import ConfirmDialog from '@/components/ConfirmDialog'

/**
 * Diálogo de confirmação de logout (envolve ConfirmDialog com a ação de risco "Sair").
 */
const LogoutConfirmModal = ({ open, onConfirm, onCancel }) => (
    <ConfirmDialog
        isOpen={open}
        onClose={onCancel}
        onConfirm={onConfirm}
        title="Confirmar Saída"
        confirmLabel="Sair"
        confirmVariant="danger"
        cancelVariant="secondary"
    >
        Tem certeza de que deseja sair da conta?
    </ConfirmDialog>
)

export default LogoutConfirmModal
