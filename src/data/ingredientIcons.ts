import { normalizeIngredientName, slugify } from '@/utils/ingredientSlug'

/**
 * Categorías usadas tanto para elegir el emoji como para colorear el
 * fondo de la tarjeta (ver CATEGORY_BACKGROUND en src/utils/ingredientImage.ts):
 * carne/salsa -> terracota, verdura/hierba -> salvia, lacteo/cereal ->
 * crema, el resto (pescado, fruta, especia, legumbre, liquido, dulce,
 * otros) -> tono neutro.
 */
export type IngredientIconCategory =
  | 'carne'
  | 'pescado'
  | 'lacteo'
  | 'verdura'
  | 'hierba'
  | 'fruta'
  | 'especia'
  | 'cereal'
  | 'legumbre'
  | 'liquido'
  | 'salsa'
  | 'dulce'
  | 'otros'

export interface IngredientIcon {
  icon: string
  category: IngredientIconCategory
}

/**
 * Slug normalizado (ver src/utils/ingredientSlug.ts) -> icono exacto. Solo
 * cubre nombres de ingrediente "pelados" (una o dos palabras): variantes
 * más largas ("queso manchego curado") no hacen match aquí y caen en
 * CATEGORY_RULES por palabra clave.
 */
export const EXACT_ICONS: Record<string, IngredientIcon> = {
  // lácteos y huevo
  huevo: { icon: '🥚', category: 'lacteo' },
  mantequilla: { icon: '🧈', category: 'lacteo' },
  'queso-crema': { icon: '🧀', category: 'lacteo' },
  queso: { icon: '🧀', category: 'lacteo' },
  leche: { icon: '🥛', category: 'lacteo' },
  nata: { icon: '🥛', category: 'lacteo' },
  yogur: { icon: '🥛', category: 'lacteo' },

  // carnes y caldos
  pollo: { icon: '🍗', category: 'carne' },
  'pechuga-de-pollo': { icon: '🍗', category: 'carne' },
  'caldo-de-pollo': { icon: '🍲', category: 'salsa' },
  caldo: { icon: '🍲', category: 'salsa' },
  ternera: { icon: '🥩', category: 'carne' },
  cerdo: { icon: '🥓', category: 'carne' },
  bacon: { icon: '🥓', category: 'carne' },
  jamon: { icon: '🍖', category: 'carne' },

  // pescado y marisco
  pescado: { icon: '🐟', category: 'pescado' },
  atun: { icon: '🐟', category: 'pescado' },
  salmon: { icon: '🐟', category: 'pescado' },
  gamba: { icon: '🦐', category: 'pescado' },
  marisco: { icon: '🦐', category: 'pescado' },

  // cereales y almidones
  harina: { icon: '🌾', category: 'cereal' },
  'pan-rallado': { icon: '🍞', category: 'cereal' },
  pan: { icon: '🍞', category: 'cereal' },
  arroz: { icon: '🍚', category: 'cereal' },
  pasta: { icon: '🍝', category: 'cereal' },
  fideos: { icon: '🍜', category: 'cereal' },
  avena: { icon: '🌾', category: 'cereal' },

  // aceites, condimentos y básicos de despensa
  'aceite-de-oliva': { icon: '🫒', category: 'liquido' },
  'aceite-para-freir': { icon: '🫒', category: 'liquido' },
  aceituna: { icon: '🫒', category: 'verdura' },
  vinagre: { icon: '🧴', category: 'liquido' },
  sal: { icon: '🧂', category: 'especia' },
  pimienta: { icon: '🧂', category: 'especia' },
  azucar: { icon: '🍬', category: 'dulce' },
  miel: { icon: '🍯', category: 'dulce' },

  // verduras y hortalizas
  palta: { icon: '🥑', category: 'verdura' }, // sinónimo sudamericano de aguacate
  cebolleta: { icon: '🧅', category: 'verdura' },
  cebollino: { icon: '🧅', category: 'verdura' },
  tomate: { icon: '🍅', category: 'verdura' },
  cebolla: { icon: '🧅', category: 'verdura' },
  ajo: { icon: '🧄', category: 'verdura' },
  patata: { icon: '🥔', category: 'verdura' },
  zanahoria: { icon: '🥕', category: 'verdura' },
  pimiento: { icon: '🫑', category: 'verdura' },
  lechuga: { icon: '🥬', category: 'verdura' },
  espinaca: { icon: '🥬', category: 'verdura' },
  champinon: { icon: '🍄', category: 'verdura' },
  maiz: { icon: '🌽', category: 'verdura' },
  aguacate: { icon: '🥑', category: 'verdura' },
  calabacin: { icon: '🥒', category: 'verdura' },
  pepino: { icon: '🥒', category: 'verdura' },
  brocoli: { icon: '🥦', category: 'verdura' },
  guisante: { icon: '🫛', category: 'verdura' },

  // frutas
  lima: { icon: '🍋', category: 'fruta' },
  limon: { icon: '🍋', category: 'fruta' },
  naranja: { icon: '🍊', category: 'fruta' },
  manzana: { icon: '🍎', category: 'fruta' },
  platano: { icon: '🍌', category: 'fruta' },
  fresa: { icon: '🍓', category: 'fruta' },
  uva: { icon: '🍇', category: 'fruta' },

  // dulces, especias y hierbas
  chocolate: { icon: '🍫', category: 'dulce' },
  vainilla: { icon: '🌼', category: 'especia' },
  canela: { icon: '🌿', category: 'hierba' },
  perejil: { icon: '🌿', category: 'hierba' },
  albahaca: { icon: '🌿', category: 'hierba' },
  oregano: { icon: '🌿', category: 'hierba' },
  cilantro: { icon: '🌿', category: 'hierba' },
  laurel: { icon: '🌿', category: 'hierba' },

  // bebidas, salsas, legumbres y frutos secos
  vino: { icon: '🍷', category: 'liquido' },
  cerveza: { icon: '🍺', category: 'liquido' },
  agua: { icon: '💧', category: 'liquido' },
  mostaza: { icon: '🫙', category: 'salsa' },
  mayonesa: { icon: '🫙', category: 'salsa' },
  'salsa-de-soja': { icon: '🫙', category: 'salsa' },
  'tomate-frito': { icon: '🥫', category: 'salsa' },
  garbanzo: { icon: '🫘', category: 'legumbre' },
  lenteja: { icon: '🫘', category: 'legumbre' },
  alubia: { icon: '🫘', category: 'legumbre' },
  almendra: { icon: '🥜', category: 'legumbre' },
  nuez: { icon: '🥜', category: 'legumbre' },
}

interface CategoryRule {
  keywords: string[]
  icon: string
  category: IngredientIconCategory
}

/**
 * Reglas por palabra clave, para cuando el nombre normalizado no es un
 * slug "pelado" de EXACT_ICONS (p. ej. "queso manchego curado" o "pechuga
 * de pavo"). Igual que el antiguo resolveIngredientIcon: gana la palabra
 * clave más larga que haga match, sin importar el orden de las reglas.
 */
export const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: [
      'pollo', 'pavo', 'carne', 'cerdo', 'ternera', 'cordero', 'chorizo',
      'salchicha', 'panceta', 'solomillo', 'filete', 'costilla', 'morcilla',
      'conejo', 'jamon', 'bacon', 'pato', 'asado', 'manteca',
    ],
    icon: '🍖',
    category: 'carne',
  },
  {
    keywords: [
      'pescado', 'atun', 'salmon', 'bacalao', 'merluza', 'trucha', 'sardina',
      'anchoa', 'boqueron', 'lubina', 'dorada',
    ],
    icon: '🐟',
    category: 'pescado',
  },
  {
    keywords: [
      'marisco', 'gamba', 'langostino', 'mejillon', 'calamar', 'pulpo',
      'vieira', 'cangrejo', 'almeja', 'camaron',
    ],
    icon: '🦐',
    category: 'pescado',
  },
  {
    keywords: [
      'queso', 'leche', 'nata', 'yogur', 'mantequilla', 'crema', 'requeson',
      'mascarpone', 'ricotta', 'lacteo', 'huevo', 'mozzarella',
    ],
    icon: '🥛',
    category: 'lacteo',
  },
  {
    keywords: [
      'tomate', 'tomatillo', 'cebolla', 'ceboll', 'ajo', 'patata', 'zanahoria',
      'pimiento', 'lechuga', 'espinaca', 'champinon', 'seta', 'calabacin',
      'pepino', 'pepinillo', 'brocoli', 'coliflor', 'apio', 'puerro',
      'remolacha', 'rabano', 'alcachofa', 'berenjena', 'calabaza', 'maiz',
      'guisante', 'verdura', 'hortaliza', 'aceituna', 'col', 'hinojo',
      'chalota', 'yuca', 'camote', 'garlic',
    ],
    icon: '🥕',
    category: 'verdura',
  },
  {
    keywords: [
      'limon', 'lima', 'naranja', 'manzana', 'platano', 'fresa', 'uva',
      'pera', 'melocoton', 'sandia', 'melon', 'kiwi', 'mango', 'piña',
      'cereza', 'ciruela', 'arandano', 'frambuesa', 'mora', 'fruta',
      'coco', 'papaya', 'pasa', 'granada',
    ],
    icon: '🍎',
    category: 'fruta',
  },
  {
    keywords: [
      'perejil', 'albahaca', 'oregano', 'cilantro', 'laurel', 'tomillo',
      'romero', 'menta', 'hierbabuena', 'eneldo', 'hierba', 'canela',
    ],
    icon: '🌿',
    category: 'hierba',
  },
  {
    keywords: [
      'sal', 'pimienta', 'comino', 'pimenton', 'curry', 'nuez moscada',
      'cardamomo', 'clavo', 'azafran', 'jengibre', 'curcuma', 'vainilla',
      'especia',
    ],
    icon: '🧂',
    category: 'especia',
  },
  {
    // Chiles y picantes: categoría "especia" (como el resto de picantes),
    // pero con un emoji propio en vez del salero genérico de arriba.
    keywords: [
      'chile', 'chili', 'aji', 'guindilla', 'jalapeno', 'habanero',
      'guajillo', 'pasilla', 'mulato', 'chipotle', 'gochugaru',
    ],
    icon: '🌶️',
    category: 'especia',
  },
  {
    keywords: [
      'harina', 'pan', 'arroz', 'pasta', 'fideo', 'avena', 'trigo',
      'cebada', 'centeno', 'quinoa', 'cuscus', 'cereal', 'sesamo',
      'maicena', 'semola', 'bulgur', 'espagueti', 'lasaña', 'masa',
      'levadura', 'bicarbonato',
    ],
    icon: '🌾',
    category: 'cereal',
  },
  {
    keywords: [
      'garbanzo', 'lenteja', 'alubia', 'judia', 'frijol', 'soja', 'haba',
      'legumbre', 'almendra', 'nuez', 'avellana', 'pistacho', 'anacardo',
      'cacahuete', 'tofu', 'garrofon',
    ],
    icon: '🫘',
    category: 'legumbre',
  },
  {
    keywords: [
      'agua', 'vino', 'cerveza', 'zumo', 'refresco', 'licor', 'ron',
      'whisky', 'vinagre', 'aceite', 'liquido', 'caldo', 'mirin', 'sake',
      'cafe',
    ],
    icon: '💧',
    category: 'liquido',
  },
  {
    keywords: [
      'salsa', 'mostaza', 'mayonesa', 'ketchup', 'alioli', 'vinagreta',
      'conserva', 'bechamel', 'tahini', 'encurtido', 'chimichurri',
      'tzatziki', 'coulis', 'gochujang',
    ],
    icon: '🫙',
    category: 'salsa',
  },
  {
    keywords: [
      'azucar', 'miel', 'chocolate', 'caramelo', 'mermelada', 'dulce',
      'gelatina', 'cacao', 'bizcocho',
    ],
    icon: '🍬',
    category: 'dulce',
  },
]

const NEUTRAL_ICON: IngredientIcon = { icon: '🍽️', category: 'otros' }

/**
 * Icono acorde a un nombre de ingrediente: primero busca coincidencia
 * exacta de slug en EXACT_ICONS, luego la palabra clave más larga que
 * haga match en CATEGORY_RULES, y si nada encaja devuelve un icono neutro
 * de comida.
 */
export function getIngredientIcon(name: string): IngredientIcon {
  const normalized = normalizeIngredientName(name)
  const slug = slugify(normalized)

  const exact = EXACT_ICONS[slug]
  if (exact) return exact

  let best: { rule: CategoryRule; keywordLength: number } | null = null
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (
        normalized.includes(keyword) &&
        (!best || keyword.length > best.keywordLength)
      ) {
        best = { rule, keywordLength: keyword.length }
      }
    }
  }

  if (!best) return NEUTRAL_ICON
  return { icon: best.rule.icon, category: best.rule.category }
}
