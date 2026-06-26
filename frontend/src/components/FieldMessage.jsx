import { cn } from '@/utils/cn'

const tones = {
  error: 'text-[var(--color-danger-strong)]',
  warning: 'text-[var(--color-warning-text)]',
}

/**
 * Mensagem curta de validação exibida abaixo de um campo de formulário.
 * Substitui os <div> de aviso/erro repetidos sob os inputs.
 */
const FieldMessage = ({ children, tone = 'error', className }) => {
  if (!children) return null
  return (
    <div className={cn('-mt-1 mb-[0.625rem] text-caption font-medium', tones[tone], className)}>
      {children}
    </div>
  )
}

export default FieldMessage
