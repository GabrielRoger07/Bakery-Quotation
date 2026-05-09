import { useContext } from 'react'
import { MobilePageContext } from '@/contexts/MobilePageContext'

const useMobilePage = () => {
    const ctx = useContext(MobilePageContext)
    if (!ctx) throw new Error('useMobilePage must be used in MobilePageProvider')
    return ctx
}

export default useMobilePage
