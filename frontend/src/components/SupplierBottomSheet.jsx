import { useEffect } from 'react'
import { X, Pencil, Trash, Phone, Mail, Building2, Hash } from 'lucide-react'

const DetailRow = ({ icon, label, value }) => {
    if (!value || value === '-') return null
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border-faint)] last:border-0">
            <span className="mt-0.5 text-[var(--color-accent)] shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">{label}</p>
                <p className="text-[0.9rem] font-medium text-[var(--color-text-heading)] break-all">{value}</p>
            </div>
        </div>
    )
}

/**
 * Bottom sheet (mobile) com os detalhes de um fornecedor e ações de editar/remover.
 */
const SupplierBottomSheet = ({ isOpen, onClose, supplier, onEdit, onDelete }) => {
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

    const initials = supplier?.supplierName
        ? supplier.supplierName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
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
                aria-label="Detalhes do fornecedor"
            >
                <div className="sort-sheet-handle" />

                <div className="qsheet-header">
                    <div className="qsheet-header-info">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[0.75rem] font-bold text-[var(--color-accent-strong)] shrink-0">
                            {initials}
                        </div>
                        <span className="qsheet-title">{supplier?.supplierName}</span>
                    </div>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="qsheet-actions">
                    {onEdit && (
                        <button className="qsheet-action-btn qsheet-edit" onClick={() => { onEdit(supplier); onClose() }}>
                            <Pencil size={18} strokeWidth={2} />
                            <span>Editar</span>
                        </button>
                    )}
                    {onDelete && (
                        <button className="qsheet-action-btn qsheet-delete" onClick={() => { onDelete(supplier.supplierId); onClose() }}>
                            <Trash size={18} strokeWidth={2} />
                            <span>Excluir</span>
                        </button>
                    )}
                </div>

                <div className="qsheet-body">
                    <DetailRow
                        icon={<Building2 size={16} strokeWidth={1.75} />}
                        label="Empresa"
                        value={supplier?.employerName}
                    />
                    <DetailRow
                        icon={<Hash size={16} strokeWidth={1.75} />}
                        label="CNPJ"
                        value={supplier?.employerCnpj}
                    />
                    <DetailRow
                        icon={<Phone size={16} strokeWidth={1.75} />}
                        label="Whatsapp"
                        value={supplier?.supplierWhatsappNumber}
                    />
                    <DetailRow
                        icon={<Mail size={16} strokeWidth={1.75} />}
                        label="E-mail"
                        value={supplier?.supplierEmail}
                    />
                </div>
            </div>
        </>
    )
}

export default SupplierBottomSheet
