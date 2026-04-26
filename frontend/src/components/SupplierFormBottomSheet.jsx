import { useEffect } from 'react'
import { X } from 'lucide-react'
import SupplierCreate from '../pages/Supplier/SupplierCreate'
import SupplierEdit from '../pages/Supplier/SupplierEdit'

const SupplierFormBottomSheet = ({ isOpen, onClose, mode, supplier, onSaveCreate, onSaveEdit }) => {
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

    const title = mode === 'edit' ? 'Editar Fornecedor' : 'Novo Fornecedor'

    return (
        <>
            <div
                className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`sform-sheet ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="sort-sheet-handle" />

                <div className="sform-sheet-header">
                    <span className="sform-sheet-title">{title}</span>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="sform-sheet-body">
                    {mode === 'edit' ? (
                        <SupplierEdit
                            supplier={supplier}
                            onSave={onSaveEdit}
                            onClose={onClose}
                        />
                    ) : (
                        <SupplierCreate
                            onSave={onSaveCreate}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default SupplierFormBottomSheet
