const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single'
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

interface MyMemoryResponse {
  responseData: { translatedText: string }
  responseStatus: number | string
}

/**
 * Endpoint no oficial (sin API key) que usa el propio widget de Google
 * Translate. Para frases cortas de comida da resultados mucho más fiables
 * que MyMemory (p. ej. "pollo" -> "chicken" en vez de coincidencias raras
 * de su memoria de traducción), así que es la vía principal.
 */
async function translateViaGoogle(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: from,
    tl: to,
    dt: 't',
    q: text,
  })
  const res = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Google Translate respondió ${res.status}`)

  const data = (await res.json()) as unknown
  const segments = Array.isArray(data) ? data[0] : null
  if (!Array.isArray(segments)) {
    throw new Error('Respuesta inesperada de Google Translate')
  }

  const translated = segments
    .map((segment) => (Array.isArray(segment) ? segment[0] : ''))
    .join('')
    .trim()
  if (!translated) throw new Error('Traducción vacía')
  return translated
}

/**
 * Respaldo si el endpoint de Google falla (bloqueado, caído...). Gratuita
 * y sin key, aunque para palabras sueltas ambiguas puede devolver
 * coincidencias raras de su memoria de traducción colaborativa.
 */
async function translateViaMyMemory(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: `${from}|${to}` })
  const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`MyMemory respondió ${res.status}`)

  const data = (await res.json()) as MyMemoryResponse
  const translated = data.responseData?.translatedText
  if (!translated) throw new Error('Traducción vacía')
  return translated
}

/**
 * TheMealDB solo tiene contenido en inglés, así que la query de búsqueda se
 * traduce antes de consultarla. Encadena Google -> MyMemory -> texto
 * original: si ambas fallan (red, límite de la API...) se usa la query tal
 * cual en vez de romper la búsqueda — peor resultado, pero la app sigue
 * funcionando.
 */
export async function translateToEnglish(text: string): Promise<string> {
  try {
    return (await translateViaGoogle(text, 'es', 'en')).trim()
  } catch {
    try {
      return (await translateViaMyMemory(text, 'es', 'en')).trim()
    } catch {
      return text
    }
  }
}
