/**
 * Diccionario de equivalencias: variantes de un mismo ingrediente (en
 * español, inglés, o abreviaturas habituales) que deben resolver al mismo
 * slug de imagen, aunque su nombre normalizado no coincida literalmente.
 *
 * Las claves son nombres ya pasados por `normalizeIngredientName` (ver
 * src/utils/ingredientSlug.ts): minúsculas y sin tildes. `getIngredientImage`
 * consulta primero este diccionario y solo si no hay match calcula el slug
 * directamente a partir del nombre normalizado.
 *
 * Poblado con los 30 ingredientes más frecuentes de ingredientes.md
 * (`npm run list:ingredients`). Añade aquí nuevas variantes a medida que
 * aparezcan recetas con otra forma de nombrar un ingrediente ya cubierto.
 */
export const INGREDIENT_ALIASES: Record<string, string> = {
  // cebolla
  onion: 'cebolla',
  cebollas: 'cebolla',

  // ajo
  garlic: 'ajo',
  ajos: 'ajo',
  'diente de ajo': 'ajo',
  'dientes de ajo': 'ajo',

  // azucar
  sugar: 'azucar',
  'azucar blanco': 'azucar',
  'azucar blanca': 'azucar',
  'azucar comun': 'azucar',

  // aceite-de-oliva
  aove: 'aceite-de-oliva',
  'aceite de oliva virgen extra': 'aceite-de-oliva',
  'aceite de oliva virgen': 'aceite-de-oliva',
  'olive oil': 'aceite-de-oliva',
  'extra virgin olive oil': 'aceite-de-oliva',

  // sal
  salt: 'sal',
  'sal fina': 'sal',
  'sal marina': 'sal',
  'sal gorda': 'sal',

  // huevo
  egg: 'huevo',
  eggs: 'huevo',
  huevos: 'huevo',
  'huevo entero': 'huevo',

  // harina
  flour: 'harina',
  'harina de trigo': 'harina',
  'harina comun': 'harina',
  'harina todo uso': 'harina',
  'all purpose flour': 'harina',

  // tomate
  tomato: 'tomate',
  tomatoes: 'tomate',
  tomates: 'tomate',
  jitomate: 'tomate',

  // comino
  cumin: 'comino',
  'comino molido': 'comino',
  'comino en polvo': 'comino',

  // mantequilla
  butter: 'mantequilla',
  manteca: 'mantequilla',

  // zanahoria
  carrot: 'zanahoria',
  carrots: 'zanahoria',
  zanahorias: 'zanahoria',

  // salsa-de-soja
  'soy sauce': 'salsa-de-soja',
  'salsa soja': 'salsa-de-soja',
  'salsa de soya': 'salsa-de-soja',
  shoyu: 'salsa-de-soja',

  // pimenton
  paprika: 'pimenton',
  'pimenton dulce': 'pimenton',
  'pimenton picante': 'pimenton',
  'pimenton de la vera': 'pimenton',
  'pimenton ahumado': 'pimenton',

  // tomate-triturado
  'crushed tomatoes': 'tomate-triturado',
  'tomate frito': 'tomate-triturado',
  passata: 'tomate-triturado',

  // cebolleta
  scallion: 'cebolleta',
  'cebolleta fresca': 'cebolleta',
  'green onion': 'cebolleta',
  'cebolla tierna': 'cebolleta',

  // patata
  potato: 'patata',
  potatoes: 'patata',
  patatas: 'patata',
  papa: 'patata',
  papas: 'patata',

  // cilantro-fresco
  cilantro: 'cilantro-fresco',
  coriander: 'cilantro-fresco',
  'fresh coriander': 'cilantro-fresco',
  'coriander leaves': 'cilantro-fresco',

  // canela
  cinnamon: 'canela',
  'canela en polvo': 'canela',
  'canela molida': 'canela',

  // perejil
  parsley: 'perejil',
  'perejil fresco': 'perejil',

  // leche
  milk: 'leche',

  // leche-de-coco
  'coconut milk': 'leche-de-coco',

  // aceite-de-sesamo
  'sesame oil': 'aceite-de-sesamo',
  'aceite de ajonjoli': 'aceite-de-sesamo',

  // arroz
  rice: 'arroz',

  // salsa-de-pescado
  'fish sauce': 'salsa-de-pescado',
  'nam pla': 'salsa-de-pescado',

  // aceite-para-freir
  'frying oil': 'aceite-para-freir',
  'aceite para frituras': 'aceite-para-freir',

  // yema-de-huevo
  'egg yolk': 'yema-de-huevo',
  'egg yolks': 'yema-de-huevo',
  yemas: 'yema-de-huevo',

  // agua
  water: 'agua',

  // carne-picada-de-ternera
  'ground beef': 'carne-picada-de-ternera',
  'minced beef': 'carne-picada-de-ternera',
  'carne picada': 'carne-picada-de-ternera',
  'carne molida de res': 'carne-picada-de-ternera',

  // aceite
  oil: 'aceite',
  'cooking oil': 'aceite',
  'vegetable oil': 'aceite',

  // lima
  lime: 'lima',
  limes: 'lima',
}
