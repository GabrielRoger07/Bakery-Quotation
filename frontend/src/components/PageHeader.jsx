import { cn } from '@/utils/cn'

/**
 * Cabeçalho de tela padronizado: título + (subtítulo) + (ações).
 * Substitui os <h1> hardcoded e repetidos pelas telas.
 */
const PageHeader = ({ title, subtitle, actions, className }) => (
  <div className={cn('mb-4', actions && 'flex items-start gap-3', className)}>
    <div>
      <h1 className="m-0 text-title font-extrabold tracking-[-0.03em] text-[var(--color-text-strong)]">
        {title}
      </h1>
      {subtitle && (
        <p className="m-0 mt-1.5 text-body text-[var(--color-text-muted)]">{subtitle}</p>
      )}
    </div>
    {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
  </div>
)

export default PageHeader
