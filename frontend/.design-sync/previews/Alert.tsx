import { Alert } from '@bakery/design-system'

export const Variants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
    <Alert variant="error" message="Algo deu errado ao salvar a cotação." />
    <Alert variant="success" message="Cotação criada com sucesso!" />
    <Alert variant="warning" message="Atenção: revise os campos obrigatórios." />
    <Alert variant="info" message="Dica: você pode editar a cotação depois." />
  </div>
)
