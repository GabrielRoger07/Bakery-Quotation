import { createContext, useCallback, useContext, useState } from 'react'

const MobilePageContext = createContext(null)

export const MobilePageProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState('')
    const [reloadFn, setReloadFn] = useState(null)
    const [leftAction, setLeftAction] = useState(null)
    const [rightSlot, setRightSlot] = useState(null)

    const registerPage = useCallback((title, fn, extra = {}) => {
        setPageTitle(title)
        setReloadFn(() => fn)
        setLeftAction(extra.leftAction ?? null)
        setRightSlot(extra.rightSlot ?? null)
    }, [])

    const unregisterPage = useCallback(() => {
        setPageTitle('')
        setReloadFn(null)
        setLeftAction(null)
        setRightSlot(null)
    }, [])

    return (
        <MobilePageContext.Provider value={{ pageTitle, reloadFn, leftAction, rightSlot, registerPage, unregisterPage }}>
            {children}
        </MobilePageContext.Provider>
    )
}

export const useMobilePage = () => useContext(MobilePageContext)
