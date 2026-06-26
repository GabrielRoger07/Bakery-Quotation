import { cn } from '@/utils/cn'

const variants = {
  error: 'text-[var(--color-danger)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning-text)]',
  info: 'text-[var(--color-accent)]',
}

/**
 * Mensagem de feedback em nível de formulário/tela.
 * Mantém o uso histórico `<Alert message={error} />` (variante error por padrão)
 * e cobre sucesso/aviso/info via prop `variant` — eliminando os <div> duplicados.
 */
const Alert = ({ message, variant = 'error', className }) => {
  if (!message) return null
  return (
    <div className={cn('mb-[0.875rem] text-body font-medium text-center', variants[variant] ?? variants.error, className)}>
      {message}
    </div>
  )
}

export default Alert
