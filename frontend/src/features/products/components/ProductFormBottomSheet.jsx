import { X } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import ProductCreate from '@/features/products/pages/ProductCreate'
import ProductEdit from '@/features/products/pages/ProductEdit'

const ProductFormBottomSheet = ({ isOpen, onClose, mode, product, onSaveCreate, onSaveEdit }) => {
    const title = mode === 'edit' ? 'Editar Produto' : 'Novo Produto'

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} label={title} className="sform-sheet">
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
        </BottomSheet>
    )
}

export default ProductFormBottomSheet
