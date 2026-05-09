import { useEffect } from 'react'

const BottomSheet = ({ isOpen, onClose, label, className = '', children }) => {
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            <div
                className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`${className} ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={label}
            >
                <div className="sort-sheet-handle" />
                {children}
            </div>
        </>
    )
}

export default BottomSheet
