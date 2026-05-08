import { useEffect } from 'react'
import { X, Pencil, Trash, BarChart2 } from 'lucide-react'
import QuotationDetails from '@/pages/Quotation/QuotationDetails'

const QuotationBottomSheet = ({
    isOpen,
    onClose,
    quotation,
    onEdit,
    onDelete,
    onMonitor,
}) => {
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

    const statusVariant =
        quotation?.status === 'Ativo' ? 'success' :
        quotation?.status === 'Agendado' ? 'accent' : ''

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
                aria-label="Detalhes da cotação"
            >
                <div className="sort-sheet-handle" />

                {/* Header */}
                <div className="qsheet-header">
                    <div className="qsheet-header-info">
                        <span className="qsheet-title">
                            Cotação #{quotation?.quotationId}
                        </span>
                        {quotation?.status && (
                            <span className={`card-tag ${statusVariant}`} style={{ fontSize: '0.7rem' }}>
                                {quotation.status}
                            </span>
                        )}
                    </div>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                {/* Actions row */}
                <div className="qsheet-actions">
                    {onMonitor && (
                        <button className="qsheet-action-btn qsheet-monitor" onClick={() => { onMonitor(quotation); onClose() }}>
                            <BarChart2 size={18} strokeWidth={2} />
                            <span>Monitorar</span>
                        </button>
                    )}
                    {onEdit && (
                        <button className="qsheet-action-btn qsheet-edit" onClick={() => { onEdit(quotation); onClose() }}>
                            <Pencil size={18} strokeWidth={2} />
                            <span>Editar</span>
                        </button>
                    )}
                    {onDelete && (
                        <button className="qsheet-action-btn qsheet-delete" onClick={() => { onDelete(quotation); onClose() }}>
                            <Trash size={18} strokeWidth={2} />
                            <span>Excluir</span>
                        </button>
                    )}
                </div>

                {/* Details body */}
                <div className="qsheet-body">
                    <QuotationDetails quotation={quotation} />
                </div>
            </div>
        </>
    )
}

export default QuotationBottomSheet
