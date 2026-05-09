import { createContext, useCallback, useContext, useRef, useState } from 'react'

const MobilePageContext = createContext(null)

export const MobilePageProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState('')
    const reloadRef = useRef(null)

    const registerPage = useCallback((title, fn) => {
        setPageTitle(title)
        reloadRef.current = fn
    }, [])

    const unregisterPage = useCallback(() => {
        setPageTitle('')
        reloadRef.current = null
    }, [])

    const reload = useCallback(() => {
        reloadRef.current?.()
    }, [])

    return (
        <MobilePageContext.Provider value={{ pageTitle, reload, registerPage, unregisterPage }}>
            {children}
        </MobilePageContext.Provider>
    )
}

export const useMobilePage = () => {
    const ctx = useContext(MobilePageContext)
    if(!ctx) throw new Error('useMobilePage must be used in MobilePageProvider')
        return ctx
}
