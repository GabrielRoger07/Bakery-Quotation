import { useEffect } from 'react'
import { X, Pencil, Trash, Barcode, AlignLeft } from 'lucide-react'
import Modal from '@/components/Modal'
import useIsMobile from '@/hooks/useIsMobile'

const DetailRow = ({ icon, label, value }) => {
    if (!value || value === '-') return null
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border-faint)] last:border-0">
            <span className="mt-0.5 text-[var(--color-accent)] shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-label font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">{label}</p>
                <p className="text-[0.9rem] font-medium text-[var(--color-text-heading)] break-all">{value}</p>
            </div>
        </div>
    )
}

const ProductDetailBody = ({ product, onEdit, onDelete, onClose }) => (
    <>
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
    </>
)

/**
 * Detalhes de um produto com ações de editar/remover. No mobile abre como
 * bottom sheet; a partir de `sm:` (desktop) o mesmo conteúdo abre dentro do
 * `Modal` genérico — mesmo padrão "corpo compartilhado, chrome trocado por
 * isMobile" que `SuppliersPanel` (em `QuotationMonitor.jsx`) já usa.
 */
const ProductBottomSheet = ({ isOpen, onClose, product, onEdit, onDelete }) => {
    const isMobile = useIsMobile()

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

    if (!isMobile) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={product?.productName}>
                <ProductDetailBody product={product} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
            </Modal>
        )
    }

    const initials = product?.productName
        ? product.productName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '?'

    return (
        <>
            <div
                className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`qsheet ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Detalhes do produto"
            >
                <div className="sort-sheet-handle" />

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

                <ProductDetailBody product={product} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
            </div>
        </>
    )
}

export default ProductBottomSheet
