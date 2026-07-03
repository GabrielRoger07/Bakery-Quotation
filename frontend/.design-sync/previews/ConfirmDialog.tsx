import { ConfirmDialog } from '@bakery/design-system'

export const Danger = () => (
  <ConfirmDialog
    isOpen
    onClose={() => {}}
    onConfirm={() => {}}
    title="Remover produto?"
    confirmLabel="Remover"
    confirmVariant="danger"
  >
    Tem certeza de que deseja remover este produto? Esta ação não pode ser desfeita.
  </ConfirmDialog>
)
