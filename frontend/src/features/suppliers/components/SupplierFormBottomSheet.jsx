import { X } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import SupplierCreate from '@/features/suppliers/pages/SupplierCreate'
import SupplierEdit from '@/features/suppliers/pages/SupplierEdit'

const SupplierFormBottomSheet = ({ isOpen, onClose, mode, supplier, onSaveCreate, onSaveEdit }) => {
    const title = mode === 'edit' ? 'Editar Fornecedor' : 'Novo Fornecedor'

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
        </BottomSheet>
    )
}

export default SupplierFormBottomSheet
