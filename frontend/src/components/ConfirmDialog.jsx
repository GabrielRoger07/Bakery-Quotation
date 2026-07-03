import Button from '@/components/Button'
import { TriangleAlert } from 'lucide-react'

/**
 * Diálogo de confirmação (alerta centralizado): ícone em destaque, título e
 * descrição centralizados e ações empilhadas em largura total (confirmar em cima,
 * cancelar embaixo). Usado para ações destrutivas/de risco (excluir, descartar, sair).
 *
 * A cor do ícone acompanha `confirmVariant` (danger → vermelho, success → verde,
 * demais → roxo). Passe `icon` para trocar o glifo (default: aviso).
 */
const iconToneClasses = {
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
}

const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title = 'Confirmar Remoção',
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  confirmVariant = 'primary', cancelVariant = 'secondary', loading, children,
  icon = <TriangleAlert size={28} strokeWidth={2} />,
}) => {
  if (!isOpen) return null

  const iconTone = iconToneClasses[confirmVariant] ?? 'bg-[var(--color-highlight-lighter)] text-[var(--color-accent)]'

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[var(--color-overlay-dark)] [backdrop-filter:blur(6px)]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[340px] bg-[var(--color-surface-card)] rounded-[var(--radius-2xl)] p-6 text-center [box-shadow:var(--shadow-lg)] [animation:modalIn_0.22s_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className={`w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-4 ${iconTone}`}>
          {icon}
        </div>
        <h2 className="m-0 text-[1.1875rem] font-bold text-[var(--color-text-body)] tracking-[-0.01em]">{title}</h2>
        {children && (
          <p className="mt-2 mb-0 text-[0.84375rem] text-[var(--color-text-muted)] leading-[1.5]">{children}</p>
        )}
        <div className="mt-5 flex flex-col gap-2.5">
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading} className="w-full">{confirmLabel}</Button>
          <Button variant={cancelVariant} onClick={onClose} disabled={loading} className="w-full !text-[var(--color-accent)]">{cancelLabel}</Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
