import { SectionHeader } from '@bakery/design-system'
import { Building2 } from 'lucide-react'

export const Default = () => (
  <div style={{ maxWidth: 520 }}>
    <SectionHeader icon={<Building2 size={14} strokeWidth={2.5} />} label="Fornecedores" count={3} />
  </div>
)
