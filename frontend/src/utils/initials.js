/**
 * Gera as iniciais de um nome para avatares (ex.: "Padaria Central" → "PC").
 * Centraliza o cálculo antes duplicado nas listas.
 */
export const initials = (name, max = 2) =>
  name ? name.split(' ').slice(0, max).map(w => w[0]).join('').toUpperCase() : '?'

export default initials
