import { StatusTabFilter } from '@bakery/design-system'

export const Default = () => (
  <div style={{ maxWidth: 560 }}>
    <StatusTabFilter value="" onChange={() => {}} counts={{ '': 12, agendado: 3, ativo: 5, fechado: 4 }} />
  </div>
)
