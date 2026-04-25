import { createContext, useCallback, useContext, useState } from 'react'

const MobilePageContext = createContext(null)

export const MobilePageProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState('')
    const [reloadFn, setReloadFn] = useState(null)

    const registerPage = useCallback((title, fn) => {
        setPageTitle(title)
        setReloadFn(() => fn)
    }, [])

    const unregisterPage = useCallback(() => {
        setPageTitle('')
        setReloadFn(null)
    }, [])

    return (
        <MobilePageContext.Provider value={{ pageTitle, reloadFn, registerPage, unregisterPage }}>
            {children}
        </MobilePageContext.Provider>
    )
}

export const useMobilePage = () => useContext(MobilePageContext)
