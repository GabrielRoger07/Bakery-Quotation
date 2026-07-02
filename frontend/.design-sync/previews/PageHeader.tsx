import { PageHeader, Button } from '@bakery/design-system'

export const WithActions = () => (
  <PageHeader
    title="Produtos"
    subtitle="Gerencie os produtos da sua empresa."
    actions={<Button variant="primary">Adicionar</Button>}
  />
)

export const TitleOnly = () => <PageHeader title="Nova cotação" />
