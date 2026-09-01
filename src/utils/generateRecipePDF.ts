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

/**
 * Genera y descarga un PDF con el contenido de una receta (título,
 * ingredientes y pasos). Se usa tanto para recetas propias como para
 * vistas previas de TheMealDB, así que ingredients/steps pueden faltar o
 * venir vacíos sin que la generación falle.
 */
export function generateRecipePDF({
  title,
  ingredients = [],
  steps = [],
}: RecipePdfData): void {
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

  doc.save(`${slugify(title)}.pdf`)
}
