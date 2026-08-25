import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const variantStyles = {
  success: {
    container: 'border-[var(--color-success-border)] bg-[var(--color-success-lighter)]',
    icon: CheckCircle,
    iconClass: 'text-[var(--color-success)]',
    text: 'text-[var(--color-success-strong)]',
    close: 'text-[var(--color-success-strong)] hover:bg-[var(--color-success-soft)]',
  },
  error: {
    container: 'border-[var(--color-danger-border)] bg-[var(--color-danger-lighter)]',
    icon: XCircle,
    iconClass: 'text-[var(--color-danger)]',
    text: 'text-[var(--color-danger-strong)]',
    close: 'text-[var(--color-danger-strong)] hover:bg-[var(--color-danger-soft)]',
  },
  warning: {
    container: 'border-[var(--color-warning-border)] bg-[var(--color-warning-lighter)]',
    icon: AlertTriangle,
    iconClass: 'text-[var(--color-warning-text)]',
    text: 'text-[var(--color-warning-text)]',
    close: 'text-[var(--color-warning-text)] hover:bg-[var(--color-warning-soft)]',
  },
  info: {
    container: 'border-[var(--color-border-default)] bg-[var(--color-surface-card)]',
    icon: Info,
    iconClass: 'text-[var(--color-accent)]',
    text: 'text-[var(--color-text-primary)]',
    close: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]',
  },
}

const Toast = ({ message, variant = 'success', onClose, className }) => {
  if (!message) return null

  const styles = variantStyles[variant] ?? variantStyles.success
  const Icon = styles.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed left-4 right-4 top-[5.5rem] z-[950] mx-auto w-[calc(100vw-2rem)] max-w-[32rem]',
        'sm:left-auto sm:right-4 sm:top-[5.25rem] sm:w-[min(32rem,calc(100vw-6rem))]',
        'rounded-[var(--radius-lg)] border px-4 py-3.5',
        '[box-shadow:var(--shadow-lg)]',
        'transition-[transform,opacity] duration-[180ms] ease-out',
        styles.container,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} strokeWidth={2} className={cn('mt-0.5 flex-shrink-0', styles.iconClass)} />
        <span className={cn('flex-1 text-[0.875rem] font-semibold leading-[1.35]', styles.text)}>
          {message}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dispensar notificação"
            className={cn(
              'flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)]',
              'transition-colors duration-[160ms] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-accent)]',
              styles.close,
            )}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Toast
