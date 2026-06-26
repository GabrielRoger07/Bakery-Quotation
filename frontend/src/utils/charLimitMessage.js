/**
 * Converte o objeto `warning` do hook useCharLimit em texto.
 * Centraliza a frase antes repetida campo a campo nos formulários.
 */
export const charLimitMessage = (warning) => {
  if (!warning) return ''
  if (warning.type === 'too_short') {
    return `É permitido ter no mínimo ${warning.min} caracteres para ${warning.fieldName}.`
  }
  if (warning.type === 'too_long') {
    return `É permitido ter no máximo ${warning.max} caracteres para ${warning.fieldName}.`
  }
  return ''
}

export default charLimitMessage
