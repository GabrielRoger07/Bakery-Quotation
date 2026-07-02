import { ChevronDown } from 'lucide-react'

/**
 * Botão "Carregar mais" (paginação incremental) — acumula os próximos resultados.
 * Não renderiza quando não há mais itens (`remaining <= 0`).
 */
const LoadMoreButton = ({ onClick, remaining = 0, loading = false, disabled = false }) => {
  if (remaining <= 0) return null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full mt-3 flex items-center justify-center gap-1.5 px-4 py-3 rounded-[var(--radius-lg)] border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-card)] text-[var(--color-accent)] text-[0.875rem] font-bold cursor-pointer transition-[background-color,border-color,transform] duration-[160ms] hover:bg-[var(--color-highlight-lighter)] hover:border-[var(--color-highlight-border)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronDown size={18} strokeWidth={2.25} />
      {loading ? 'Carregando...' : `Carregar mais (${remaining})`}
    </button>
  )
}

export default LoadMoreButton
