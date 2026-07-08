import { useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'

/**
 * SortBottomSheet — native-feel mobile sort panel.
 *
 * Lista plana de opções pré-compostas (campo + direção já combinados).
 * Tocar numa opção aplica a ordenação e fecha o sheet imediatamente.
 *
 * Props:
 *   isOpen        bool
 *   onClose       fn()
 *   options       [{ key, label, field, direction }]
 *   sortField     string | null
 *   sortDirection "asc" | "desc"
 *   onSelectSort  fn(option)
 */
const SortBottomSheet = ({ isOpen, onClose, options = [], sortField, sortDirection, onSelectSort }) => {
    const sheetRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const handleSelect = (option) => {
        onSelectSort(option)
        onClose()
    }

    return (
        <>
            <div
                className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={sheetRef}
                className={`sort-sheet ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Ordenar lista"
            >
                <div className="sort-sheet-handle" />

                <div className="sort-sheet-header">
                    <span className="sort-sheet-title">Ordenar por</span>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="sort-sheet-body">
                    <div className="sort-options-list">
                        {options.map(opt => {
                            const active = opt.field === sortField && opt.direction === sortDirection
                            return (
                                <button
                                    key={opt.key}
                                    className={`sort-option-btn ${active ? 'active' : ''}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    <span className="sort-option-label">{opt.label}</span>
                                    {active && <Check size={17} strokeWidth={2.5} />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SortBottomSheet
