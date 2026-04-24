import Modal from './Modal'
import Button from './Button'

const LogoutConfirmModal = ({ open, onConfirm, onCancel }) => (
    <Modal isOpen={open} onClose={onCancel} title="Confirmar Saída" centered>
        <div>
            <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                Tem certeza de que deseja sair da conta?
            </p>
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm}>Sair</Button>
            </div>
        </div>
    </Modal>
)

export default LogoutConfirmModal
