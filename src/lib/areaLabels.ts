/**
 * `strArea` en los documentos de `standardRecipes` y en las respuestas de
 * TheMealDB está en inglés, así que se traduce a mano para mostrarlo en la
 * interfaz. El valor que se usa para filtrar sigue siendo el original.
 */
export const AREA_LABELS_ES: Record<string, string> = {
  Italian: 'Italiana',
  Japanese: 'Japonesa',
  Spanish: 'Española',
  French: 'Francesa',
  Mexican: 'Mexicana',
  Chinese: 'China',
  Indian: 'India',
  Thai: 'Tailandesa',
  Greek: 'Griega',
  Peruvian: 'Peruana',
  Moroccan: 'Marroquí',
  Korean: 'Coreana',
  Vietnamese: 'Vietnamita',
  Turkish: 'Turca',
  Lebanese: 'Libanesa',
  Brazilian: 'Brasileña',
  Argentinian: 'Argentina',
  German: 'Alemana',
  Portuguese: 'Portuguesa',
  Cuban: 'Cubana',
  // Países del filtro de TheMealDB que no aparecen en el catálogo propio.
  British: 'Británica',
  Canadian: 'Canadiense',
  Croatian: 'Croata',
  Egyptian: 'Egipcia',
  Filipino: 'Filipina',
  Irish: 'Irlandesa',
  Jamaican: 'Jamaicana',
  Kenyan: 'Keniata',
  Malaysian: 'Malasia',
  Polish: 'Polaca',
  Russian: 'Rusa',
  Tunisian: 'Tunecina',
  Ukrainian: 'Ucraniana',
}

/** Bandera del país de origen de la cocina, para mostrar junto a la etiqueta. */
export const AREA_FLAGS: Record<string, string> = {
  Italian: '🇮🇹',
  Japanese: '🇯🇵',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  Mexican: '🇲🇽',
  Chinese: '🇨🇳',
  Indian: '🇮🇳',
  Thai: '🇹🇭',
  Greek: '🇬🇷',
  Peruvian: '🇵🇪',
  Moroccan: '🇲🇦',
  Korean: '🇰🇷',
  Vietnamese: '🇻🇳',
  Turkish: '🇹🇷',
  Lebanese: '🇱🇧',
  Brazilian: '🇧🇷',
  Argentinian: '🇦🇷',
  German: '🇩🇪',
  Portuguese: '🇵🇹',
  Cuban: '🇨🇺',
  British: '🇬🇧',
  Canadian: '🇨🇦',
  Croatian: '🇭🇷',
  Egyptian: '🇪🇬',
  Filipino: '🇵🇭',
  Irish: '🇮🇪',
  Jamaican: '🇯🇲',
  Kenyan: '🇰🇪',
  Malaysian: '🇲🇾',
  Polish: '🇵🇱',
  Russian: '🇷🇺',
  Tunisian: '🇹🇳',
  Ukrainian: '🇺🇦',
}

export function areaLabelEs(englishName: string): string {
  return AREA_LABELS_ES[englishName] ?? englishName
}

export function areaFlag(englishName: string): string {
  return AREA_FLAGS[englishName] ?? '🌍'
}

/** Etiqueta lista para mostrar: bandera + nombre en español. */
export function areaLabelWithFlag(englishName: string): string {
  return `${areaFlag(englishName)} ${areaLabelEs(englishName)}`
}

/**
 * `list.php?a=list` de TheMealDB devuelve ~200 nacionalidades (una tabla de
 * referencia, no las áreas realmente usadas por recetas), y varias de las
 * que sí tienen nombre de cocina reconocible (French, Indian, American...)
 * devuelven `null` en filter.php con la test key pública. Se usa en su
 * lugar esta lista fija, verificada a mano contra filter.php?a=, con los
 * países que sí devuelven recetas de TheMealDB.
 */
export const SEARCH_AREAS = [
  'British',
  'Canadian',
  'Chinese',
  'Croatian',
  'Egyptian',
  'Filipino',
  'Greek',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Kenyan',
  'Malaysian',
  'Mexican',
  'Moroccan',
  'Polish',
  'Portuguese',
  'Russian',
  'Spanish',
  'Thai',
  'Tunisian',
  'Turkish',
  'Ukrainian',
  'Vietnamese',
]

/**
 * Une los países con recetas reales en TheMealDB (`SEARCH_AREAS`) con los
 * que aparecen en el catálogo propio (`standardRecipes`), para que el
 * desplegable de país del buscador cubra ambas fuentes a la vez.
 */
export function mergeAreas(catalogAreas: string[]): string[] {
  return [...new Set([...SEARCH_AREAS, ...catalogAreas])].sort((a, b) =>
    areaLabelEs(a).localeCompare(areaLabelEs(b)),
  )
}
