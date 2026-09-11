/**
 * `strArea` en los documentos de `standardRecipes` está en inglés (mismo
 * convenio que TheMealDB), así que se traduce a mano para mostrarlo en la
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
  // Países del filtro de TheMealDB (Buscar > País) que no aparecen en el
  // catálogo propio.
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

export function areaLabelEs(englishName: string): string {
  return AREA_LABELS_ES[englishName] ?? englishName
}

/**
 * `list.php?a=list` de TheMealDB devuelve ~200 nacionalidades (una tabla de
 * referencia, no las áreas realmente usadas por recetas), y varias de las
 * que sí tienen nombre de cocina reconocible (French, Indian, American...)
 * devuelven `null` en filter.php con la test key pública. Se usa en su
 * lugar esta lista fija, verificada a mano contra filter.php?a=, con los
 * países que sí devuelven recetas.
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
].sort((a, b) => areaLabelEs(a).localeCompare(areaLabelEs(b)))
