import Modal from '@/components/Modal'
import Button from '@/components/Button'
import FormActions from '@/components/FormActions'

/**
 * Diálogo de confirmação padrão (Modal + mensagem + ações).
 * Substitui o modal de confirmação copiado nas listas.
 */
const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title = 'Confirmar Remoção',
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  confirmVariant = 'primary', cancelVariant = 'primary', loading, children,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div>
      <div className="mb-5 text-body text-[var(--color-text-secondary)]">{children}</div>
      <FormActions>
        <Button variant={cancelVariant} onClick={onClose}>{cancelLabel}</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
      </FormActions>
    </div>
  </Modal>
)

export default ConfirmDialog
