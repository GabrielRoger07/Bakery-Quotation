import { useEffect, useState } from 'react'

const useIsMobile = (breakpoint = 640) => {
    const [isMobile, setIsMobile] = useState(() => {
        if(typeof window === 'undefined') return false
        return window.innerWidth <= breakpoint
    })
    
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
        const handler = e => setIsMobile(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [breakpoint])
    return isMobile
}

export default useIsMobile