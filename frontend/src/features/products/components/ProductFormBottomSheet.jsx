import { useEffect } from 'react'
import { X } from 'lucide-react'
import ProductCreate from '@/features/products/pages/ProductCreate'
import ProductEdit from '@/features/products/pages/ProductEdit'

const ProductFormBottomSheet = ({ isOpen, onClose, mode, product, onSaveCreate, onSaveEdit }) => {
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

    const title = mode === 'edit' ? 'Editar Produto' : 'Novo Produto'

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
                        <ProductEdit
                            product={product}
                            onSave={onSaveEdit}
                            onClose={onClose}
                        />
                    ) : (
                        <ProductCreate
                            onSave={onSaveCreate}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductFormBottomSheet
