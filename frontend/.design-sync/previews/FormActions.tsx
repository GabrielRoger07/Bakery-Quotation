import { FormActions, Button } from '@bakery/design-system'

export const Default = () => (
  <div style={{ maxWidth: 480, border: '1px solid var(--color-border-default)', borderRadius: 14, padding: 20 }}>
    <FormActions>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="primary">Salvar</Button>
    </FormActions>
  </div>
)

export const Between = () => (
  <div style={{ maxWidth: 480, border: '1px solid var(--color-border-default)', borderRadius: 14, padding: 20 }}>
    <FormActions align="between">
      <Button variant="secondary">Voltar</Button>
      <Button variant="primary">Continuar</Button>
    </FormActions>
  </div>
)
