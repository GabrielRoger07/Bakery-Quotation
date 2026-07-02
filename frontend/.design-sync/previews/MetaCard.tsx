import { MetaCard } from '@bakery/design-system'
import { Calendar, Gavel } from 'lucide-react'

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, maxWidth: 520 }}>
    <MetaCard icon={<Calendar size={16} />} label="Abertura" value="27/06/2026" sub="08:00" />
    <MetaCard icon={<Gavel size={16} />} label="Modo" value="Leilão reverso" />
  </div>
)
