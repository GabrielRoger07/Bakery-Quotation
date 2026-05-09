import { useCallback, useRef, useState } from 'react'
import MobilePageContext from '@/contexts/MobilePageContext'

const MobilePageProvider = ({ children }) => {
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

export default MobilePageProvider
