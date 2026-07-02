import { PageContainer, PageHeader, Input, Button, FormActions } from '@bakery/design-system'

export const Form = () => (
  <PageContainer variant="form">
    <PageHeader title="Novo produto" />
    <Input label="Nome" value="Açúcar refinado" onChange={() => {}} required />
    <FormActions>
      <Button variant="primary">Salvar</Button>
    </FormActions>
  </PageContainer>
)
