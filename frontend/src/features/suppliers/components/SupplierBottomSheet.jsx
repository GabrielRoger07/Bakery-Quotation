import { X, Pencil, Trash, Phone, Mail, Building2, Hash } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import DetailRow from '@/components/ui/DetailRow'

const SupplierBottomSheet = ({ isOpen, onClose, supplier, onEdit, onDelete }) => {
    const initials = supplier?.supplierName
        ? supplier.supplierName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '?'

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} label="Detalhes do fornecedor" className="qsheet">
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
        </BottomSheet>
    )
}

export default SupplierBottomSheet
