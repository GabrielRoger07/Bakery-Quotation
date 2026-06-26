import { cn } from '@/utils/cn'

/**
 * Estado vazio padrão (caixa tracejada centralizada).
 * Substitui os <p> de "nenhum item" duplicados.
 */
const EmptyState = ({ children, className }) => (
  <p className={cn(
    'm-0 p-4 text-center text-body text-[var(--color-text-muted)]',
    'bg-[var(--color-surface-1)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]',
    className,
  )}>
    {children}
  </p>
)

export default EmptyState
