import { Modal, Button, FormActions } from '@bakery/design-system'

export const Open = () => (
  <Modal isOpen onClose={() => {}} title="Exemplo de Modal">
    <p style={{ margin: 0 }} className="text-body text-[var(--color-text-secondary)]">
      Conteúdo do modal. Use sempre este primitivo em vez de recriar overlays.
    </p>
    <FormActions>
      <Button variant="secondary">Fechar</Button>
    </FormActions>
  </Modal>
)
