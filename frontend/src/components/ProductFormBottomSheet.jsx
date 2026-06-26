import { useEffect } from 'react'
import { X } from 'lucide-react'
import ProductCreate from '@/pages/Product/ProductCreate'
import ProductEdit from '@/pages/Product/ProductEdit'

/**
 * Bottom sheet (mobile) com o formulário de criação/edição de produto.
 */
const ProductFormBottomSheet = ({ isOpen, onClose, mode, product, onSaveCreate, onSaveEdit, departments = [] }) => {
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
                    {isOpen && (mode === 'edit' ? (
                        <ProductEdit
                            product={product}
                            onSave={onSaveEdit}
                            onClose={onClose}
                            departments={departments}
                        />
                    ) : (
                        <ProductCreate
                            onSave={onSaveCreate}
                            onClose={onClose}
                            departments={departments}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default ProductFormBottomSheet
