import { Input } from '@bakery/design-system'

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <Input label="Nome do produto" value="Farinha de trigo tipo 1" onChange={() => {}} placeholder="Digite o nome" required />
  </div>
)

export const WithError = () => (
  <div style={{ maxWidth: 420 }}>
    <Input label="E-mail do fornecedor" type="email" value="email-invalido" onChange={() => {}} error="E-mail inválido" />
  </div>
)

export const Password = () => (
  <div style={{ maxWidth: 420 }}>
    <Input label="Senha" type="password" value="segredo123" onChange={() => {}} />
  </div>
)
