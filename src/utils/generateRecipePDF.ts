import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { jsPDF } from 'jspdf'
import type { Ingredient } from '@/types'

interface RecipePdfData {
  title: string
  ingredients?: Ingredient[]
  steps?: string[]
}

const MARGIN = 20
const PAGE_WIDTH = 210 // A4 en mm
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

// Paleta calcada de src/index.css (--color-espresso-*, --color-terracotta-*)
// para que el PDF se sienta coherente con el resto de la app.
const COLOR_ESPRESSO_700: [number, number, number] = [46, 31, 24]
const COLOR_ESPRESSO_500: [number, number, number] = [74, 53, 41]
const COLOR_TERRACOTTA_500: [number, number, number] = [193, 80, 46]
const COLOR_TERRACOTTA_600: [number, number, number] = [161, 62, 34]

/** Quita espacios y acentos para usar el título como nombre de archivo. */
function slugify(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'receta'
}

/** Texto legible de un ingrediente: omite cantidad/unidad si vienen vacías. */
function formatIngredient(ingredient: Ingredient): string {
  const parts = [ingredient.quantity, ingredient.unit, ingredient.name]
    .map((part) => part?.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Ingrediente sin especificar'
}

function isShareCancelled(error: unknown): boolean {
  // El plugin @capacitor/share rechaza con este mensaje textual cuando el
  // usuario cierra el diálogo nativo de compartir sin elegir destino — no es
  // un fallo real.
  const message = error instanceof Error ? error.message : String(error)
  return /cancel/i.test(message)
}

/**
 * Entrega el PDF ya generado en un WebView nativo (Android), donde no existe
 * la API de descarga del navegador (`<a download>` no dispara nada). Se
 * escribe como fichero binario en el directorio de caché de la app —
 * temporal y sin permisos de almacenamiento adicionales — y se ofrece al
 * usuario a través del diálogo nativo de compartir/guardar de Android, que
 * puede servir el fichero gracias al FileProvider ya declarado en
 * AndroidManifest.xml (cubre el directorio de caché en file_paths.xml).
 */
async function deliverPdfNative(doc: jsPDF, filename: string): Promise<void> {
  const dataUri = doc.output('datauristring')
  const base64 = dataUri.slice(dataUri.indexOf(',') + 1)

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  })

  try {
    await Share.share({
      title: filename,
      dialogTitle: 'Guardar o compartir receta',
      files: [uri],
    })
  } catch (error) {
    if (isShareCancelled(error)) return
    throw error
  }
}

/**
 * Genera y descarga un PDF con el contenido de una receta (título,
 * ingredientes y pasos). Se usa tanto para recetas propias como para
 * vistas previas de TheMealDB, así que ingredients/steps pueden faltar o
 * venir vacíos sin que la generación falle.
 */
export async function generateRecipePDF({
  title,
  ingredients = [],
  steps = [],
}: RecipePdfData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  function checkPageBreak(nextLineHeight: number) {
    if (y + nextLineHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function addSectionHeading(text: string) {
    checkPageBreak(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...COLOR_TERRACOTTA_600)
    doc.text(text, MARGIN, y)
    y += 3
    doc.setDrawColor(...COLOR_TERRACOTTA_500)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y)
    y += 8
  }

  function addBodyLines(lines: string[], lineHeight = 6) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_ESPRESSO_700)
    for (const line of lines) {
      checkPageBreak(lineHeight)
      doc.text(line, MARGIN, y)
      y += lineHeight
    }
  }

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...COLOR_ESPRESSO_700)
  const titleLines = doc.splitTextToSize(title || 'Receta sin título', CONTENT_WIDTH)
  for (const line of titleLines) {
    checkPageBreak(10)
    doc.text(line, MARGIN, y)
    y += 10
  }
  y += 4

  // Ingredientes
  addSectionHeading('Ingredientes')
  if (ingredients.length > 0) {
    for (const [index, ingredient] of ingredients.entries()) {
      const wrapped = doc.splitTextToSize(
        `${index + 1}. ${formatIngredient(ingredient)}`,
        CONTENT_WIDTH,
      )
      addBodyLines(wrapped)
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_ESPRESSO_500)
    checkPageBreak(6)
    doc.text('Esta receta todavía no tiene ingredientes.', MARGIN, y)
    y += 6
  }
  y += 6

  // Preparación
  addSectionHeading('Preparación')
  if (steps.length > 0) {
    for (const [index, step] of steps.entries()) {
      const wrapped = doc.splitTextToSize(`${index + 1}. ${step}`, CONTENT_WIDTH)
      addBodyLines(wrapped)
      y += 2
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_ESPRESSO_500)
    checkPageBreak(6)
    doc.text('Esta receta todavía no tiene pasos de preparación.', MARGIN, y)
    y += 6
  }

  const filename = `${slugify(title)}.pdf`
  if (Capacitor.isNativePlatform()) {
    await deliverPdfNative(doc, filename)
  } else {
    doc.save(filename)
  }
}
