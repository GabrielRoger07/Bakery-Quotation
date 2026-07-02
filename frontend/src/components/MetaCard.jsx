/**
 * Card de metadado (ícone + rótulo + valor + sub) usado em telas de detalhe.
 * Extraído de QuotationDetails para reuso.
 */
const MetaCard = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-[0.625rem] p-[0.75rem_0.875rem] bg-[var(--color-highlight-lighter)] border border-[var(--color-border-faint)] rounded-[var(--radius-lg)]">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--color-highlight-soft)] rounded-[var(--radius-md)] text-[var(--color-accent)]">
      {icon}
    </div>
    <div className="flex flex-col gap-[0.1rem] min-w-0">
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">{label}</span>
      <span className="text-body font-bold text-[var(--color-text-heading)] leading-[1.3]">{value}</span>
      {sub && <span className="text-body text-[var(--color-text-body)] font-semibold">{sub}</span>}
    </div>
  </div>
)

export default MetaCard
