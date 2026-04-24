export const formatDecimal = (value) => {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0))
}

export const formatMoney = (value, currency = "R$") => {
    return `${currency} ${formatDecimal(value)}`
}