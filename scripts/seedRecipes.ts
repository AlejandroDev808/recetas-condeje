import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  '../serviceAccountKey.json',
)
const DATA_PATH = path.resolve(__dirname, 'data/recetas-internacionales.json')
const COLLECTION = 'standardRecipes'
// Tamaño de lote para las comprobaciones de existencia y los batch writes;
// muy por debajo del límite de 500 escrituras por batch de Firestore.
const CHUNK_SIZE = 20

interface MealDbMealRaw {
  idMeal: string
  strMeal: string
  [key: string]: unknown
}

interface RecipesFile {
  meals: MealDbMealRaw[]
}

function loadServiceAccount(): object {
  try {
    const raw = readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8')
    return JSON.parse(raw) as object
  } catch {
    throw new Error(
      `No se ha encontrado el archivo de credenciales en:\n  ${SERVICE_ACCOUNT_PATH}\n\n` +
        'Genera una clave de cuenta de servicio en Firebase Console > Configuración del ' +
        'proyecto > Cuentas de servicio > Generar nueva clave privada, y guarda el JSON ' +
        'descargado como "serviceAccountKey.json" en la raíz del proyecto.',
    )
  }
}

function loadRecipes(): MealDbMealRaw[] {
  const raw = readFileSync(DATA_PATH, 'utf-8')
  const data = JSON.parse(raw) as RecipesFile
  if (!Array.isArray(data.meals)) {
    throw new Error(
      `El JSON en ${DATA_PATH} no tiene la forma esperada { meals: [...] }.`,
    )
  }
  return data.meals
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

async function seed() {
  initializeApp({ credential: cert(loadServiceAccount()) })
  const db = getFirestore()
  const collection = db.collection(COLLECTION)

  const recipes = loadRecipes()
  console.log(`Leídas ${recipes.length} recetas de ${DATA_PATH}.`)

  let created = 0
  let skipped = 0
  const errors: { idMeal: string; message: string }[] = []

  const batches = chunk(recipes, CHUNK_SIZE)

  for (const [index, batchRecipes] of batches.entries()) {
    const refs = batchRecipes.map((meal) => collection.doc(meal.idMeal))
    const snapshots = await db.getAll(...refs)

    const toCreate = batchRecipes.filter((_, i) => !snapshots[i].exists)
    skipped += batchRecipes.length - toCreate.length

    if (toCreate.length > 0) {
      const writeBatch = db.batch()
      for (const meal of toCreate) {
        writeBatch.set(collection.doc(meal.idMeal), meal)
      }

      try {
        await writeBatch.commit()
        created += toCreate.length
      } catch (error) {
        for (const meal of toCreate) {
          errors.push({
            idMeal: meal.idMeal,
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    console.log(
      `Lote ${index + 1}/${batches.length}: ${toCreate.length} nuevas, ` +
        `${batchRecipes.length - toCreate.length} ya existían.`,
    )
  }

  console.log('\nResumen:')
  console.log(`  Creadas:      ${created}`)
  console.log(`  Ya existían:  ${skipped}`)
  console.log(`  Errores:      ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nDetalle de errores:')
    for (const { idMeal, message } of errors) {
      console.log(`  - ${idMeal}: ${message}`)
    }
    process.exitCode = 1
  }
}

seed().catch((error) => {
  console.error('\nError al ejecutar el seed:', error.message ?? error)
  process.exitCode = 1
})
