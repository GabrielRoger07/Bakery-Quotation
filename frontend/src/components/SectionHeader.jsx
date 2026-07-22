import { cn } from '@/utils/cn'

/**
 * Cabeçalho de seção (ícone + rótulo + contador) usado em telas de detalhe.
 * Extraído de QuotationDetails para reuso.
 */
const SectionHeader = ({ icon, label, count, className }) => (
  <div className={cn("flex items-center gap-[0.4rem] mb-[0.625rem] text-[var(--color-text-muted)]", className)}>
    {icon}
    <h4 className="m-0 text-[var(--color-text-muted)] text-caption font-bold uppercase tracking-[0.07em]">{label}</h4>
    <span className="text-[0.625rem] font-bold text-[var(--color-accent)] bg-[var(--color-highlight-soft)] px-2 py-[0.125rem] rounded-full tracking-[0.02em]">{count}</span>
  </div>
)

export default SectionHeader
