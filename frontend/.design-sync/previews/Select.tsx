import { Select } from '@bakery/design-system'

const options = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'un', label: 'Unidade (un)' },
  { value: 'cx', label: 'Caixa (cx)' },
]

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <Select label="Unidade de medida" value="kg" onChange={() => {}} options={options} placeholder="Selecionar…" required />
  </div>
)

export const Bare = () => (
  <div style={{ maxWidth: 260 }}>
    <Select bare value="" onChange={() => {}} options={options} placeholder="Filtrar por unidade…" />
  </div>
)
