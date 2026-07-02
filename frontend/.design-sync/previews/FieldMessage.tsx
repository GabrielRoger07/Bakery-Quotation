import { FieldMessage } from '@bakery/design-system'

export const Tones = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <FieldMessage tone="error">Campo obrigatório</FieldMessage>
    <FieldMessage tone="warning">Mínimo de 3 caracteres</FieldMessage>
  </div>
)
