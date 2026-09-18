/**
 * Normalización y slug de nombres de ingrediente, usadas por
 * `getIngredientImage` para resolver la imagen local de un ingrediente.
 *
 * Esta lógica se duplica intencionadamente en scripts/listIngredients.ts
 * (que genera ingredientes.md desde Firestore con un script de Node
 * independiente, fuera del proyecto de TypeScript de src/): si se cambia
 * una, hay que cambiar la otra para que los slugs sigan coincidiendo.
 */

const ACCENTED_CHARS: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
}

function stripAccents(text: string): string {
  return text.replace(
    /[áàäâéèëêíìïîóòöôúùüû]/g,
    (char) => ACCENTED_CHARS[char] ?? char,
  )
}

const UNIT_WORDS = [
  'kilogramos', 'kilogramo', 'kilos', 'kilo', 'kg',
  'gramos', 'gramo', 'grs', 'gr', 'g',
  'litros', 'litro', 'l',
  'mililitros', 'mililitro', 'ml',
  'cucharadas', 'cucharada', 'cucharaditas', 'cucharadita',
  'tazas', 'taza', 'vasos', 'vaso',
  'pizcas', 'pizca', 'puñados', 'puñado',
  'dientes', 'diente', 'unidades', 'unidad',
  'rebanadas', 'rebanada', 'rodajas', 'rodaja',
  'latas', 'lata', 'sobres', 'sobre',
  'hojas', 'hoja', 'ramitas', 'ramita',
  'piezas', 'pieza', 'chorritos', 'chorrito',
  'al gusto', 'cc', 'oz', 'lb', 'lbs',
]

const UNIT_PATTERN = new RegExp(`\\b(${UNIT_WORDS.join('|')})\\b`, 'g')

/** Singularización simple para plurales regulares del español (ver la
 * misma función en scripts/listIngredients.ts). No cubre todos los casos
 * (p. ej. "panes" -> "pane" en vez de "pan"), pero es suficiente para el
 * grueso de ingredientes de cocina. */
function singularize(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('ces')) return `${word.slice(0, -3)}z`
  if (word.endsWith('ones') && word.length > 5) return word.slice(0, -2)
  if (word.endsWith('s') && 'aeiou'.includes(word[word.length - 2])) {
    return word.slice(0, -1)
  }
  return word
}

/**
 * Normaliza un nombre de ingrediente: minúsculas, sin tildes, sin
 * contenido entre paréntesis ni tras comas, sin cantidades/unidades
 * sueltas, y con plurales simples pasados a singular. Ej: "Dientes de
 * ajo" -> "ajo", "Aceite de Oliva Virgen Extra (opcional)" -> "aceite de
 * oliva virgen extra".
 */
export function normalizeIngredientName(rawName: string): string {
  let text = stripAccents(rawName.toLowerCase().trim())
  text = text.replace(/\([^)]*\)/g, ' ')
  text = text.split(',')[0]
  text = text.replace(/^[\d½¼¾⅓⅔.,/\s-]+/, '')
  text = text.replace(UNIT_PATTERN, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  while (/^(de|del|de la|de los|de las)\s+/.test(text)) {
    text = text.replace(/^(de|del|de la|de los|de las)\s+/, '')
  }
  text = text
    .split(' ')
    .map((word) => singularize(word))
    .join(' ')
  return text
}

export function slugify(normalized: string): string {
  return normalized
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Nombre normalizado -> slug, en un solo paso. */
export function nameToSlug(rawName: string): string {
  return slugify(normalizeIngredientName(rawName))
}
