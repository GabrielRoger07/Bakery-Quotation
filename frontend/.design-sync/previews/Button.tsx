import { Button } from '@bakery/design-system'

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="primary">Salvar cotação</Button>
    <Button variant="success">Aprovar lance</Button>
    <Button variant="danger">Remover produto</Button>
    <Button variant="secondary">Cancelar</Button>
  </div>
)

export const Ghost = () => (
  <div style={{ background: 'var(--color-brand)', padding: 16, borderRadius: 14, display: 'inline-block' }}>
    <Button variant="ghost">Sair</Button>
  </div>
)

export const States = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button loading>Enviando…</Button>
    <Button disabled>Indisponível</Button>
    <Button type="submit" variant="primary">Enviar proposta</Button>
  </div>
)
