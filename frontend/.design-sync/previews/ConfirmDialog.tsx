import { ConfirmDialog } from '@bakery/design-system'

export const Danger = () => (
  <ConfirmDialog isOpen onClose={() => {}} onConfirm={() => {}} confirmVariant="danger">
    Tem certeza de que deseja remover este produto?
  </ConfirmDialog>
)
