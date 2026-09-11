import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { Recipe, RecipeDraft } from '@/types'
import { db } from './firebase'

const recipesCollection = collection(db, 'recipes')

/**
 * Un bug de guardado anterior dejaba algunas recetas en Firestore sin
 * ingredients/steps/mealTimes/tags como array (el campo directamente no
 * existía en el documento). Se normaliza aquí, al entrar los datos desde
 * Firestore, para que el resto de la app pueda confiar en el tipo `Recipe`
 * sin comprobaciones repetidas en cada componente.
 */
function toRecipe(id: string, data: Record<string, unknown>): Recipe {
  return {
    ...data,
    id,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    steps: Array.isArray(data.steps) ? data.steps : [],
    mealTimes: Array.isArray(data.mealTimes) ? data.mealTimes : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  } as Recipe
}

/**
 * Firestore rechaza `undefined` como valor de campo (a diferencia de
 * `null`), y los formularios dejan campos opcionales como imageUrl o
 * sourceId en `undefined` cuando están vacíos. Se limpian aquí, en un solo
 * sitio, en vez de acordarse de hacerlo en cada llamada.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T
}

/**
 * Suscripción en tiempo real a las recetas del usuario (propias + guardadas
 * de TheMealDB, ambas viven en la misma colección). Se usa onSnapshot en
 * vez de un getDocs puntual para que crear/editar/borrar se refleje al
 * instante en la lista sin recargar.
 */
export function subscribeToUserRecipes(
  uid: string,
  onChange: (recipes: Recipe[]) => void,
): () => void {
  const q = query(
    recipesCollection,
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => toRecipe(d.id, d.data())))
  })
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, 'recipes', id))
  return snap.exists() ? toRecipe(snap.id, snap.data()) : null
}

export async function createRecipe(
  ownerId: string,
  draft: RecipeDraft,
): Promise<string> {
  const now = Date.now()
  const ref = await addDoc(
    recipesCollection,
    stripUndefined({
      ...draft,
      ownerId,
      createdAt: now,
      updatedAt: now,
    }),
  )
  return ref.id
}

export async function updateRecipe(
  id: string,
  patch: Partial<RecipeDraft>,
): Promise<void> {
  await updateDoc(
    doc(db, 'recipes', id),
    stripUndefined({
      ...patch,
      updatedAt: Date.now(),
    }),
  )
}

export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, 'recipes', id))
}

/**
 * Borra todas las recetas del usuario. Se usa al eliminar la cuenta: sin
 * esto, las recetas quedarían huérfanas en Firestore (ownerId apuntando a
 * un uid que ya no existe en Auth).
 */
export async function deleteAllUserRecipes(uid: string): Promise<void> {
  const snapshot = await getDocs(
    query(recipesCollection, where('ownerId', '==', uid)),
  )
  const batch = writeBatch(db)
  for (const d of snapshot.docs) batch.delete(d.ref)
  await batch.commit()
}

/** Copia una receta encontrada en TheMealDB al cuaderno del usuario. */
export async function saveMealDbRecipe(
  ownerId: string,
  draft: RecipeDraft,
): Promise<string> {
  return createRecipe(ownerId, draft)
}
