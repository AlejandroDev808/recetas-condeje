/**
 * TheMealDB solo devuelve las categorías en inglés (categories.php), y son
 * una lista fija y pequeña (~14), así que se traducen a mano en vez de
 * gastar peticiones de traducción por cada carga de la página. El valor que
 * se manda a la API sigue siendo el nombre original en inglés — esto es
 * solo para lo que ve el usuario en el desplegable.
 */
export const CATEGORY_LABELS_ES: Record<string, string> = {
  Beef: 'Ternera',
  Breakfast: 'Desayuno',
  Chicken: 'Pollo',
  Dessert: 'Postre',
  Goat: 'Cabra',
  Lamb: 'Cordero',
  Miscellaneous: 'Variado',
  Pasta: 'Pasta',
  Pork: 'Cerdo',
  Seafood: 'Marisco',
  Side: 'Guarnición',
  Starter: 'Entrante',
  Vegan: 'Vegano',
  Vegetarian: 'Vegetariano',
}

export function categoryLabelEs(englishName: string): string {
  return CATEGORY_LABELS_ES[englishName] ?? englishName
}
