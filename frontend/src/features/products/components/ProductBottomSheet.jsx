import { X, Pencil, Trash, Barcode, AlignLeft } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import DetailRow from '@/components/ui/DetailRow'

const ProductBottomSheet = ({ isOpen, onClose, product, onEdit, onDelete }) => {
    const initials = product?.productName
        ? product.productName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '?'

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} label="Detalhes do produto" className="qsheet">
            <div className="qsheet-header">
                <div className="qsheet-header-info">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[0.75rem] font-bold text-[var(--color-accent-strong)] shrink-0">
                        {initials}
                    </div>
                    <span className="qsheet-title">{product?.productName}</span>
                </div>
                <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                    <X size={18} strokeWidth={2} />
                </button>
            </div>

            <div className="qsheet-actions">
                {onEdit && (
                    <button className="qsheet-action-btn qsheet-edit" onClick={() => { onEdit(product); onClose() }}>
                        <Pencil size={18} strokeWidth={2} />
                        <span>Editar</span>
                    </button>
                )}
                {onDelete && (
                    <button className="qsheet-action-btn qsheet-delete" onClick={() => { onDelete(product.productId); onClose() }}>
                        <Trash size={18} strokeWidth={2} />
                        <span>Excluir</span>
                    </button>
                )}
            </div>

            <div className="qsheet-body">
                <DetailRow
                    icon={<Barcode size={16} strokeWidth={1.75} />}
                    label="Código"
                    value={product?.productBarCodeNumber}
                />
                <DetailRow
                    icon={<AlignLeft size={16} strokeWidth={1.75} />}
                    label="Descrição"
                    value={product?.productDescription}
                />
            </div>
        </BottomSheet>
    )
}

export default ProductBottomSheet
