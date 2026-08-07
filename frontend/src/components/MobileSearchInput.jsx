import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Campo de busca com ícone + limpar + disparo por Enter.
 * `dense`: variante compacta usada no `desktopToolbar` das listas (ver `ListToolbar`) —
 * sem o botão de texto "Buscar" (a própria lupa vira o botão), largura contida
 * (`flex-1 min-w-[200px] max-w-[280px]`) e altura/raio alinhados ao `Select bare`.
 * Sem `dense` (default), mantém o padrão mobile: botão "Buscar" à parte, campo mais alto.
 */
const MobileSearchInput = ({
  value, onChange, onSearch, onClear, placeholder, ariaLabel, inputMode = undefined,
  inputDisabled = false, searchDisabled = false, dense = false, className,
}) => (
  <div className={cn('flex items-center gap-2', dense && 'flex-1 min-w-[200px] max-w-[280px]', className)}>
    <div className="relative flex-1 min-w-0">
      {dense ? (
        <button
          type="button"
          onClick={onSearch}
          disabled={searchDisabled}
          aria-label={ariaLabel ?? 'Buscar'}
          className={cn(
            'absolute left-0 top-0 h-full px-[0.6875rem] flex items-center text-[var(--color-text-disabled)]',
            'transition-colors duration-[140ms] ease-[ease]',
            !searchDisabled && 'hover:text-[var(--color-accent)] cursor-pointer',
            searchDisabled && 'cursor-not-allowed',
          )}
        >
          <Search size={16} strokeWidth={2} />
        </button>
      ) : (
        <span className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-[var(--color-text-disabled)] pointer-events-none">
          <Search size={16} strokeWidth={2} />
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={inputDisabled}
        aria-label={ariaLabel}
        onKeyDown={e => { if (e.key === 'Enter') onSearch() }}
        className={cn(
          'w-full pl-9 pr-9 border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-card)]',
          'text-body text-[var(--color-text-body)] outline-none',
          'transition-[border-color,box-shadow] duration-[160ms] ease-[ease]',
          'placeholder:text-[var(--color-text-disabled)]',
          'hover:border-[var(--color-accent)]',
          'focus:border-[var(--color-accent)]',
          'disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed disabled:hover:border-[var(--color-border-strong)]',
          dense
            ? 'h-[2.5rem] rounded-[var(--radius-md)] focus:[box-shadow:var(--shadow-focus-accent)]'
            : 'h-[2.75rem] rounded-[var(--radius-lg)] focus:[box-shadow:var(--shadow-focus-accent-soft)]',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar texto"
          className="absolute right-[0.625rem] top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] transition-colors duration-[140ms] ease-[ease] hover:bg-[var(--color-border-subtle)]"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
    {!dense && (
      <button
        type="button"
        onClick={onSearch}
        disabled={searchDisabled}
        className={cn(
          'flex-shrink-0 h-[2.75rem] px-[1.125rem] rounded-[var(--radius-lg)] border-none',
          'bg-[var(--color-accent)] text-white font-semibold [box-shadow:var(--shadow-accent)]',
          'transition-[background,transform,box-shadow] duration-[140ms] ease-[ease] active:scale-[0.96]',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none',
        )}
      >
        Buscar
      </button>
    )}
  </div>
)

export default MobileSearchInput
