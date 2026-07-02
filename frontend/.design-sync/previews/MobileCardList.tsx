import { MobileCardList } from '@bakery/design-system'

const items = [
  { id: 1, name: 'Farinha de trigo', dept: 'Secos', unit: 'kg' },
  { id: 2, name: 'Fermento biológico', dept: 'Secos', unit: 'un' },
  { id: 3, name: 'Leite integral', dept: 'Laticínios', unit: 'L' },
]

const renderCard = (item: any) => (
  <div>
    <div className="text-body font-semibold text-[var(--color-text-heading)]">{item.name}</div>
    <div className="text-caption text-[var(--color-text-muted)]">{item.dept} · {item.unit}</div>
  </div>
)

export const Default = () => (
  <div style={{ maxWidth: 400 }}>
    <MobileCardList title="Produtos" items={items} idKey="id" renderCard={renderCard} onEdit={() => {}} onDelete={() => {}} />
  </div>
)
