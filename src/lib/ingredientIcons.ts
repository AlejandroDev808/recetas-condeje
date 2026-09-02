export type IngredientIconCategory =
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'spice'
  | 'herb'
  | 'grain'
  | 'liquid'
  | 'other'

export interface IngredientIconRef {
  /** Carpeta de autor en el repo de game-icons.net (requerido por la atribución CC BY 3.0). */
  author: string
  slug: string
  category: IngredientIconCategory
}

/** Icono genérico usado cuando ninguna regla (ni específica ni de
 * categoría) hace match con el nombre del ingrediente. */
const FALLBACK_ICON: IngredientIconRef = {
  author: 'delapouite',
  slug: 'cooking-pot',
  category: 'other',
}

interface IconRule {
  keywords: string[]
  author: string
  slug: string
  category: IngredientIconCategory
}

/**
 * Reglas de icono por palabra clave. No importa el orden: se usa el
 * keyword más largo que haga match por substring en el nombre del
 * ingrediente (en inglés, tal y como llega de TheMealDB), así "pear" gana
 * sobre "pea" y "cornflour" sobre "corn" sin depender de dónde esté cada
 * regla en la lista.
 */
const ICON_RULES: IconRule[] = [
  // --- casos compuestos que colisionarían con una regla más corta ---
  { keywords: ['cornflour', 'cornstarch', 'corn flour', 'corn starch'], author: 'lorc', slug: 'wheat', category: 'grain' },
  { keywords: ['peanut'], author: 'rihlsul', slug: 'peanut', category: 'protein' },
  { keywords: ['eggplant', 'aubergine'], author: 'lorc', slug: 'aubergine', category: 'vegetable' },
  { keywords: ['bell pepper', 'sweet pepper', 'capsicum'], author: 'delapouite', slug: 'bell-pepper', category: 'vegetable' },
  { keywords: ['chilli', 'chili', 'cayenne', 'jalape'], author: 'delapouite', slug: 'chili-pepper', category: 'spice' },
  // "vegetable oil/stock/broth" son líquidos, no la verdura genérica: sin
  // esta regla, el keyword "vegetable" (más largo que "oil"/"stock"/
  // "broth") ganaba y les ponía el icono de zanahoria de la línea de abajo,
  // sin ninguna relación con lo que muestra la tarjeta.
  { keywords: ['vegetable oil'], author: 'delapouite', slug: 'oil-can', category: 'liquid' },
  { keywords: ['vegetable stock', 'vegetable broth', 'vegetable bouillon'], author: 'sbed', slug: 'water-drop', category: 'liquid' },

  // --- verduras y hortalizas ---
  { keywords: ['tomato'], author: 'delapouite', slug: 'tomato', category: 'vegetable' },
  { keywords: ['garlic'], author: 'delapouite', slug: 'garlic', category: 'vegetable' },
  { keywords: ['onion', 'shallot', 'scallion', 'leek', 'spring onion'], author: 'delapouite', slug: 'leek', category: 'vegetable' },
  { keywords: ['carrot'], author: 'delapouite', slug: 'carrot', category: 'vegetable' },
  { keywords: ['potato'], author: 'delapouite', slug: 'potato', category: 'vegetable' },
  { keywords: ['cabbage'], author: 'delapouite', slug: 'cabbage', category: 'vegetable' },
  { keywords: ['broccoli'], author: 'delapouite', slug: 'broccoli', category: 'vegetable' },
  { keywords: ['asparagus'], author: 'delapouite', slug: 'asparagus', category: 'vegetable' },
  { keywords: ['artichoke'], author: 'caro-asercion', slug: 'artichoke', category: 'vegetable' },
  { keywords: ['mushroom'], author: 'delapouite', slug: 'mushrooms', category: 'vegetable' },
  { keywords: ['pumpkin', 'squash'], author: 'delapouite', slug: 'pumpkin', category: 'vegetable' },
  { keywords: ['pea'], author: 'delapouite', slug: 'peas', category: 'vegetable' },
  // Pimienta (negra/blanca) molida: no es picante como un chile (regla de
  // arriba), así que usa el icono neutro de especia en polvo.
  { keywords: ['pepper'], author: 'lorc', slug: 'powder', category: 'spice' },
  { keywords: ['avocado'], author: 'delapouite', slug: 'avocado', category: 'fruit' },
  { keywords: ['olive'], author: 'delapouite', slug: 'olive', category: 'vegetable' },
  { keywords: ['corn'], author: 'delapouite', slug: 'corn', category: 'vegetable' },
  { keywords: ['vegetable', 'veggie', 'salad', 'greens'], author: 'delapouite', slug: 'carrot', category: 'vegetable' },

  // --- frutas ---
  { keywords: ['lemon'], author: 'delapouite', slug: 'lemon', category: 'fruit' },
  { keywords: ['lime'], author: 'delapouite', slug: 'lemon', category: 'fruit' },
  { keywords: ['orange'], author: 'delapouite', slug: 'orange', category: 'fruit' },
  { keywords: ['banana'], author: 'delapouite', slug: 'banana', category: 'fruit' },
  { keywords: ['grape'], author: 'lorc', slug: 'grapes', category: 'fruit' },
  { keywords: ['strawberr'], author: 'delapouite', slug: 'strawberry', category: 'fruit' },
  { keywords: ['raspberr'], author: 'delapouite', slug: 'raspberry', category: 'fruit' },
  { keywords: ['blueberr', 'cranberr', 'berry', 'berries'], author: 'delapouite', slug: 'berries-bowl', category: 'fruit' },
  { keywords: ['cherry'], author: 'delapouite', slug: 'cherry', category: 'fruit' },
  { keywords: ['peach'], author: 'delapouite', slug: 'peach', category: 'fruit' },
  { keywords: ['pear'], author: 'delapouite', slug: 'pear', category: 'fruit' },
  { keywords: ['plum'], author: 'delapouite', slug: 'plum', category: 'fruit' },
  { keywords: ['watermelon'], author: 'delapouite', slug: 'watermelon', category: 'fruit' },
  { keywords: ['kiwi'], author: 'delapouite', slug: 'kiwi-fruit', category: 'fruit' },
  { keywords: ['coconut'], author: 'delapouite', slug: 'coconuts', category: 'fruit' },
  { keywords: ['apple'], author: 'lorc', slug: 'shiny-apple', category: 'fruit' },
  { keywords: ['fruit'], author: 'skoll', slug: 'fruit-bowl', category: 'fruit' },

  // --- proteínas ---
  { keywords: ['bacon'], author: 'delapouite', slug: 'bacon', category: 'protein' },
  { keywords: ['sausage'], author: 'delapouite', slug: 'sausage', category: 'protein' },
  { keywords: ['ham'], author: 'skoll', slug: 'ham-shank', category: 'protein' },
  { keywords: ['beef', 'steak', 'mince', 'sirloin'], author: 'delapouite', slug: 'steak', category: 'protein' },
  { keywords: ['duck'], author: 'delapouite', slug: 'duck', category: 'protein' },
  { keywords: ['chicken', 'poultry'], author: 'delapouite', slug: 'chicken', category: 'protein' },
  { keywords: ['egg'], author: 'delapouite', slug: 'raw-egg', category: 'protein' },
  { keywords: ['shrimp', 'prawn'], author: 'delapouite', slug: 'shrimp', category: 'protein' },
  { keywords: ['crab'], author: 'lorc', slug: 'crab-claw', category: 'protein' },
  { keywords: ['squid', 'calamari'], author: 'lorc', slug: 'squid', category: 'protein' },
  { keywords: ['octopus'], author: 'lorc', slug: 'octopus', category: 'protein' },
  { keywords: ['mussel'], author: 'delapouite', slug: 'mussel', category: 'protein' },
  { keywords: ['scallop'], author: 'lorc', slug: 'scallop', category: 'protein' },
  { keywords: ['salmon'], author: 'various-artists', slug: 'salmon', category: 'protein' },
  { keywords: ['tuna', 'cod', 'anchov', 'sardine', 'haddock', 'trout', 'fish'], author: 'darkzaitzev', slug: 'fish-cooked', category: 'protein' },
  { keywords: ['kidney'], author: 'delapouite', slug: 'kidneys', category: 'protein' },
  { keywords: ['liver'], author: 'delapouite', slug: 'liver', category: 'protein' },
  { keywords: ['meat', 'pork', 'lamb', 'turkey', 'venison', 'mutton'], author: 'lorc', slug: 'meat', category: 'protein' },

  // --- lácteos ---
  { keywords: ['cheese'], author: 'lorc', slug: 'cheese-wedge', category: 'dairy' },
  { keywords: ['butter'], author: 'delapouite', slug: 'butter', category: 'dairy' },
  { keywords: ['milk'], author: 'rihlsul', slug: 'milk-carton', category: 'dairy' },

  // --- cereales / almidones ---
  { keywords: ['flour'], author: 'delapouite', slug: 'flour', category: 'grain' },
  { keywords: ['bread'], author: 'delapouite', slug: 'bread', category: 'grain' },
  { keywords: ['rice'], author: 'caro-asercion', slug: 'bowl-of-rice', category: 'grain' },
  { keywords: ['pasta', 'noodle', 'spaghetti', 'macaroni'], author: 'delapouite', slug: 'noodles', category: 'grain' },
  { keywords: ['oat'], author: 'lorc', slug: 'oat', category: 'grain' },
  { keywords: ['wheat'], author: 'lorc', slug: 'wheat', category: 'grain' },
  { keywords: ['yeast', 'baking powder', 'baking soda'], author: 'delapouite', slug: 'dough-roller', category: 'grain' },
  { keywords: ['sesame'], author: 'delapouite', slug: 'sesame', category: 'grain' },
  { keywords: ['almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'nuts'], author: 'delapouite', slug: 'almond', category: 'grain' },
  { keywords: ['seed'], author: 'delapouite', slug: 'plant-seed', category: 'grain' },

  // --- especias y hierbas ---
  // Estas especias molidas no son picantes (a diferencia del chile, que
  // usa su propio icono en la regla de arriba), así que llevan un icono
  // neutro de polvo/gránulos en vez del icono de guindilla que compartían
  // antes sin ningún sentido.
  { keywords: ['cinnamon', 'nutmeg', 'cumin', 'paprika', 'turmeric', 'cardamom', 'clove', 'curry powder', 'mixed spice', 'five spice', 'ginger', 'spice'], author: 'lorc', slug: 'powder', category: 'spice' },
  { keywords: ['vanilla'], author: 'lorc', slug: 'vanilla-flower', category: 'spice' },
  { keywords: ['salt'], author: 'lorc', slug: 'salt-shaker', category: 'spice' },
  { keywords: ['sugar'], author: 'delapouite', slug: 'sugar-cane', category: 'spice' },
  { keywords: ['thyme', 'rosemary', 'oregano', 'parsley', 'coriander', 'cilantro', 'basil', 'mint', 'dill', 'bay leaf', 'herbs'], author: 'delapouite', slug: 'herbs-bundle', category: 'herb' },

  // --- líquidos, salsas y condimentos ---
  { keywords: ['oil'], author: 'delapouite', slug: 'oil-can', category: 'liquid' },
  { keywords: ['wine'], author: 'delapouite', slug: 'wine-bottle', category: 'liquid' },
  { keywords: ['beer'], author: 'delapouite', slug: 'beer-bottle', category: 'liquid' },
  { keywords: ['honey'], author: 'delapouite', slug: 'honey-jar', category: 'liquid' },
  { keywords: ['water', 'ice'], author: 'sbed', slug: 'water-drop', category: 'liquid' },
  { keywords: ['soy sauce', 'worcestershire', 'vinegar', 'ketchup', 'mustard', 'mayonnaise', 'gravy', 'stock', 'broth', 'sauce'], author: 'sbed', slug: 'water-drop', category: 'liquid' },
  { keywords: ['cream', 'yogurt', 'yoghurt', 'buttermilk'], author: 'rihlsul', slug: 'milk-carton', category: 'dairy' },

  // --- otros ---
  { keywords: ['chocolate', 'cocoa'], author: 'rihlsul', slug: 'chocolate-bar', category: 'other' },
  { keywords: ['cookie', 'biscuit'], author: 'delapouite', slug: 'cookie', category: 'other' },
]

/**
 * TheMealDB manda los ingredientes en inglés (a veces con mayúsculas
 * variables, p. ej. "Chicken Breast" o "Self-raising Flour"). Se busca por
 * substring en el nombre en minúsculas, así que "Ground Beef" hace match
 * con "beef" aunque el ingrediente tenga palabras alrededor.
 */
export function resolveIngredientIcon(name: string): IngredientIconRef {
  const lower = name.toLowerCase()

  let best: { rule: IconRule; keywordLength: number } | null = null
  for (const rule of ICON_RULES) {
    for (const keyword of rule.keywords) {
      if (
        lower.includes(keyword) &&
        (!best || keyword.length > best.keywordLength)
      ) {
        best = { rule, keywordLength: keyword.length }
      }
    }
  }

  if (!best) return FALLBACK_ICON
  const { author, slug, category } = best.rule
  return { author, slug, category }
}
