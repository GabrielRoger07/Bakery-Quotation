export const formatDateTime = (dateString, locale = 'pt-BR') => {
    if(!dateString) return null

    const date = new Date(dateString)

    if(isNaN(date.getTime())) return null

    const datePart = date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })

    const timePart = date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
    })

    return {
        date: datePart,
        time: timePart
    }
}