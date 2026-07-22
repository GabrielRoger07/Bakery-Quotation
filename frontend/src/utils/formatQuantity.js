/* Unidades que pluralizam com "s" (as demais são siglas: KG, L, UND...) */
export const PLURAL_UNITS = ['bag', 'balde']

/**
 * Formata quantidade + unidade de medida: `{ quantity: 12, unitOfMeasure: 'CX' }` → "12 CX".
 */
export const formatQuantity = ({ quantity, unitOfMeasure }) => {
    if (!unitOfMeasure) return String(quantity)
    const plural = PLURAL_UNITS.includes(unitOfMeasure) && quantity > 1 ? 'S' : ''
    return `${quantity} ${unitOfMeasure.toUpperCase()}${plural}`
}

export default formatQuantity
