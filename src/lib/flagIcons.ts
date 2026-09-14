/**
 * Código ISO 3166-1 alpha-2 de cada país usado en `strArea`, para pedir su
 * bandera a flagcdn.com. Los emoji de bandera (regional indicators) no se
 * usan porque Windows no trae las ligaduras que los combinan en una sola
 * imagen: en vez de la bandera se ven las dos letras sueltas en cajitas.
 */
export const AREA_COUNTRY_CODES: Record<string, string> = {
  Italian: 'it',
  Japanese: 'jp',
  Spanish: 'es',
  French: 'fr',
  Mexican: 'mx',
  Chinese: 'cn',
  Indian: 'in',
  Thai: 'th',
  Greek: 'gr',
  Peruvian: 'pe',
  Moroccan: 'ma',
  Korean: 'kr',
  Vietnamese: 'vn',
  Turkish: 'tr',
  Lebanese: 'lb',
  Brazilian: 'br',
  Argentinian: 'ar',
  German: 'de',
  Portuguese: 'pt',
  Cuban: 'cu',
  British: 'gb',
  Canadian: 'ca',
  Croatian: 'hr',
  Egyptian: 'eg',
  Filipino: 'ph',
  Irish: 'ie',
  Jamaican: 'jm',
  Kenyan: 'ke',
  Malaysian: 'my',
  Polish: 'pl',
  Russian: 'ru',
  Tunisian: 'tn',
  Ukrainian: 'ua',
}

/** URL de la bandera en flagcdn.com (ancho fijo, alto proporcional), o null si no hay código mapeado. */
export function flagUrl(area: string, width = 20): string | null {
  const code = AREA_COUNTRY_CODES[area]
  return code ? `https://flagcdn.com/w${width}/${code}.png` : null
}
