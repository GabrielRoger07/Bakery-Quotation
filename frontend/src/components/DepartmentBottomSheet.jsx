import { useEffect } from 'react'
import { X, Pencil, Trash } from 'lucide-react'
import Modal from '@/components/Modal'
import useIsMobile from '@/hooks/useIsMobile'

const DepartmentDetailBody = ({ department, onEdit, onDelete, onClose }) => (
    <div className="qsheet-actions">
        {onEdit && (
            <button className="qsheet-action-btn qsheet-edit" onClick={() => { onEdit(department); onClose() }}>
                <Pencil size={18} strokeWidth={2} />
                <span>Editar</span>
            </button>
        )}
        {onDelete && (
            <button className="qsheet-action-btn qsheet-delete" onClick={() => { onDelete(department.departmentId); onClose() }}>
                <Trash size={18} strokeWidth={2} />
                <span>Excluir</span>
            </button>
        )}
    </div>
)

/**
 * Detalhes de um departamento com ações de editar/remover. No mobile abre
 * como bottom sheet; a partir de `sm:` (desktop) o mesmo conteúdo abre dentro
 * do `Modal` genérico — mesmo padrão "corpo compartilhado, chrome trocado por
 * isMobile" usado por `ProductBottomSheet`/`SupplierBottomSheet`.
 */
const DepartmentBottomSheet = ({ isOpen, onClose, department, onEdit, onDelete }) => {
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
            <Modal isOpen={isOpen} onClose={onClose} title={department?.departmentName}>
                <DepartmentDetailBody department={department} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
            </Modal>
        )
    }

    const initials = department?.departmentName
        ? department.departmentName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
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
                aria-label="Detalhes do departamento"
            >
                <div className="sort-sheet-handle" />

                <div className="qsheet-header">
                    <div className="qsheet-header-info">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-highlight)] flex items-center justify-center text-[0.75rem] font-bold text-[var(--color-accent-strong)] shrink-0">
                            {initials}
                        </div>
                        <span className="qsheet-title">{department?.departmentName}</span>
                    </div>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <DepartmentDetailBody department={department} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
            </div>
        </>
    )
}

export default DepartmentBottomSheet
