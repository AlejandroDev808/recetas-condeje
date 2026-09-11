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
}

export function areaLabelEs(englishName: string): string {
  return AREA_LABELS_ES[englishName] ?? englishName
}
