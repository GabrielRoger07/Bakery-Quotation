import { cn } from '@/utils/cn'

/**
 * Estado vazio padrão (caixa tracejada centralizada).
 *
 * Uso simples (texto): <EmptyState>Nenhum item</EmptyState>
 * Uso rico (design do wizard): passar `icon`, `title`, `description` e/ou `action`
 * para renderizar o card com ícone lavanda, título e CTA.
 */
const EmptyState = ({ icon, title, description, action, children, className }) => {
  // Variante rica — usada quando há ícone ou título
  if (icon || title) {
    return (
      <div className={cn(
        'flex flex-col items-center text-center px-5 py-9',
        'bg-[var(--color-surface-card)] border border-dashed border-[var(--color-border-default)] rounded-[var(--radius-xl)]',
        className,
      )}>
        {icon && (
          <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--color-highlight-lighter)] flex items-center justify-center mb-3.5 text-[var(--color-highlight)]">
            {icon}
          </div>
        )}
        {title && (
          <p className="m-0 text-heading font-bold text-[var(--color-text-heading)]">{title}</p>
        )}
        {description && (
          <p className="mt-1.5 mb-0 text-caption text-[var(--color-text-muted)] leading-[1.5]">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }

  // Variante simples (texto) — comportamento original
  return (
    <p className={cn(
      'm-0 p-4 text-center text-body text-[var(--color-text-muted)]',
      'bg-[var(--color-surface-subtle)] border border-dashed border-[var(--color-border-default)] rounded-[var(--radius-lg)]',
      className,
    )}>
      {children}
    </p>
  )
}

export default EmptyState
