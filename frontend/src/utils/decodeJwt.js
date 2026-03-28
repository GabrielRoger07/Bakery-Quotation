export function decodeJwt(token) {
    try {
        const payload = token.split('.')[1]
        const bytes = Uint8Array.from(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
            c => c.charCodeAt(0)
        )
        return JSON.parse(new TextDecoder().decode(bytes))
    } catch {
        return null
    }
}