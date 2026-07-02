import { cn } from '@/utils/cn'
import FieldMessage from '@/components/FieldMessage'

const selectBase = [
  'w-full min-h-[2.625rem] py-[0.5625rem] pl-[0.875rem] pr-9 appearance-none cursor-pointer',
  'border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)]',
  'text-body text-[var(--color-text-body)] bg-[var(--color-surface-card)]',
  'outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[ease]',
  'hover:border-[var(--color-accent)]',
  'focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]',
].join(' ')

const selectError = '!border-[var(--color-danger-strong)] focus:[box-shadow:var(--shadow-focus-danger)]'

const ChevronIcon = () => (
  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

/**
 * Select estilizado com seta — substitui o <select> nativo + SVG copiado pelas telas.
 * `options`: array de { value, label }. Aceita também `children` para casos especiais.
 * `bare`: sem label e sem margem de campo (uso em toolbars de filtro).
 */
const Select = ({
  label, name, value, onChange, options, children, placeholder,
  required, isInvalid, error, bare = false, className, selectClassName,
}) => {
  const invalid = isInvalid || Boolean(error)
  const isEmpty = required && !value

  const control = (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={cn(selectBase, invalid && selectError, bare && 'min-h-0 h-[2.375rem] py-0', selectClassName)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : children}
      </select>
      <ChevronIcon />
    </div>
  )

  if (bare) return <div className={cn('relative', className)}>{control}</div>

  return (
    <div className={cn('flex flex-col mb-[1.125rem]', className)}>
      {label && (
        <label className="mb-[0.375rem] font-semibold text-[var(--color-text-neutral)] text-body tracking-[0.005em] mr-auto">
          {label}
          {required && (
            <span className={cn('ml-[2px] font-bold', isEmpty ? 'text-[var(--color-danger-strong)]' : 'text-[var(--color-text-disabled)]')}>*</span>
          )}
        </label>
      )}
      {control}
      {error && <FieldMessage className="mt-[0.375rem] mb-0">{error}</FieldMessage>}
    </div>
  )
}

export default Select
