import { Table } from '@bakery/design-system'

const columns = [
  { key: 'name', label: 'Produto' },
  { key: 'dept', label: 'Departamento' },
  { key: 'unit', label: 'Unidade' },
]

const data = [
  { id: 1, name: 'Farinha de trigo', dept: 'Secos', unit: 'kg' },
  { id: 2, name: 'Fermento biológico', dept: 'Secos', unit: 'un' },
  { id: 3, name: 'Leite integral', dept: 'Laticínios', unit: 'L' },
]

export const Default = () => (
  <Table title="Produtos" columns={columns} data={data} idKey="id" onEdit={() => {}} onDelete={() => {}} />
)

export const Empty = () => (
  <Table title="Produtos" columns={columns} data={[]} idKey="id" emptyMessage="Nenhum produto cadastrado." />
)
