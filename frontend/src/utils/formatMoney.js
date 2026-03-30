export const resolveLocale = (language) => {
    return language === "pt" ? "pt" : "en"
}

export const formatDecimal = (value, language) => {
    const locale = resolveLocale(language)
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0))
}

export const formatMoney = (value, language, currency = "R$") => {
    return `${currency} ${formatDecimal(value, language)}`
}
