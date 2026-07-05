import { createContext, useCallback, useContext, useRef, useState } from 'react'

const MobilePageContext = createContext(null)

export const MobilePageProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState('')
    const [hasReload, setHasReload] = useState(false)
    const [leftAction, setLeftAction] = useState(null)
    const [rightSlot, setRightSlot] = useState(null)
    const reloadFnRef = useRef(null)

    // reloadFnRef guarda a função "crua", que pode ser recriada a cada render
    // de quem registra a página; só a disponibilidade (hasReload) entra no
    // state, para não forçar o Provider (e todos os consumidores) a
    // re-renderizar sempre que essa referência mudar.
    const registerPage = useCallback((title, fn, extra = {}) => {
        setPageTitle(title)
        reloadFnRef.current = fn ?? null
        setHasReload(!!fn)
        setLeftAction(extra.leftAction ?? null)
        setRightSlot(extra.rightSlot ?? null)
    }, [])

    const unregisterPage = useCallback(() => {
        setPageTitle('')
        reloadFnRef.current = null
        setHasReload(false)
        setLeftAction(null)
        setRightSlot(null)
    }, [])

    const callReload = useCallback(() => {
        reloadFnRef.current?.()
    }, [])

    return (
        <MobilePageContext.Provider value={{
            pageTitle,
            reloadFn: hasReload ? callReload : null,
            leftAction, rightSlot, registerPage, unregisterPage,
        }}>
            {children}
        </MobilePageContext.Provider>
    )
}

export const useMobilePage = () => useContext(MobilePageContext)
