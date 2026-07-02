import { cn } from '@/utils/cn'

const variantClasses = {
  primary: [
    'bg-[var(--color-accent)] border-[var(--color-accent)] text-white',
    '[box-shadow:var(--shadow-accent)]',
    'hover:[&:not(:disabled)]:bg-[var(--color-accent-hover)] hover:[&:not(:disabled)]:border-[var(--color-accent-hover)]',
    'hover:[&:not(:disabled)]:-translate-y-px hover:[&:not(:disabled)]:[box-shadow:var(--shadow-hover-accent)]',
  ].join(' '),

  success: [
    'bg-[var(--color-success-strong)] border-[var(--color-success-strong)] text-white',
    'hover:[&:not(:disabled)]:bg-[var(--color-success)] hover:[&:not(:disabled)]:border-[var(--color-success)]',
    'hover:[&:not(:disabled)]:-translate-y-px hover:[&:not(:disabled)]:[box-shadow:var(--shadow-hover-success)]',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger-strong)] border-[var(--color-danger-strong)] text-white',
    'hover:[&:not(:disabled)]:bg-[var(--color-danger)] hover:[&:not(:disabled)]:border-[var(--color-danger)]',
    'hover:[&:not(:disabled)]:-translate-y-px hover:[&:not(:disabled)]:[box-shadow:var(--shadow-hover-danger)]',
  ].join(' '),

  secondary: [
    'bg-[var(--color-surface-card)] border-[var(--color-border-strong)] text-[var(--color-text-neutral)]',
    '[box-shadow:var(--shadow-xs)]',
    'hover:[&:not(:disabled)]:bg-[var(--color-surface-muted)] hover:[&:not(:disabled)]:text-[var(--color-text-body)]',
    'hover:[&:not(:disabled)]:-translate-y-px hover:[&:not(:disabled)]:[box-shadow:var(--shadow-sm)]',
  ].join(' '),

  ghost: [
    'bg-[var(--color-on-dark-bg)] border-[var(--color-on-dark-border-strong)] text-[var(--color-on-dark-text-muted)]',
    '[box-shadow:none]',
    'hover:[&:not(:disabled)]:bg-[var(--color-on-dark-bg-hover)] hover:[&:not(:disabled)]:border-[var(--color-on-dark-border-strong)] hover:[&:not(:disabled)]:text-white',
    'hover:[&:not(:disabled)]:[translate:none] hover:[&:not(:disabled)]:[box-shadow:none]',
  ].join(' '),
}

const base = [
  'appearance-none border border-transparent',
  'font-semibold text-body tracking-[0.01em]',
  'px-[1.125rem] py-[0.5625rem] min-h-[2.375rem]',
  'rounded-[var(--radius-md)] cursor-pointer',
  'transition-[background-color,transform,box-shadow,border-color] duration-[160ms] ease-[ease]',
  'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-accent)]',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:[box-shadow:none]',
  'max-sm:min-h-[2.75rem]',
].join(' ')

/**
 * Botão padrão com variantes (primary/success/danger/secondary/ghost) e estado de loading.
 */
const Button = ({ children, onClick, disabled, type = 'button', loading = false, className = '', variant = 'primary' }) => {
  const cls = cn(base, variantClasses[variant] ?? variantClasses.primary, className)

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls}>
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button