import { cn } from '@/utils/cn'

/**
 * Card de metadado (rótulo + valor + sub) usado em telas de detalhe/revisão.
 * Layout vertical: linha superior (ícone + rótulo, colorida por `tone`), valor e sub.
 *
 * `tone` colore APENAS a linha ícone+rótulo (o card permanece branco):
 *  - 'default' → roxo (accent) — ex.: Modo
 *  - 'success' → verde — ex.: Início
 *  - 'danger'  → vermelho — ex.: Fim
 *  - 'muted'   → cinza — ex.: rótulos de estatística
 */
const TONES = {
  default: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
  muted: 'text-[var(--color-text-muted)]',
}

const MetaCard = ({ icon, label, value, sub, tone = 'default' }) => (
  <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-[0.8125rem_0.875rem]">
    <div className={cn('flex items-center gap-1.5 mb-[0.4375rem] text-caption font-bold uppercase tracking-[0.06em]', TONES[tone] ?? TONES.default)}>
      {icon}
      {label}
    </div>
    <div className="text-heading font-bold text-[var(--color-text-heading)] leading-[1.3]">{value}</div>
    {sub && <div className="mt-0.5 text-caption font-semibold text-[var(--color-text-muted)]">{sub}</div>}
  </div>
)

export default MetaCard
