import { ArrowUpDown, X } from 'lucide-react'

/**
 * Botão "Ordenar" usado nas listas mobile (Table/MobileCardList), tipicamente
 * ao lado de `PaginationSummary` no `inlineToolbar` do `MobileCardList`.
 *
 * Props:
 *   active   bool     — há um sort aplicado (mostra estado ativo + badge de limpar)
 *   onOpen   fn()      — abre o SortBottomSheet
 *   onClear  fn()|undefined — limpa a ordenação (badge só aparece se fornecido)
 */
const SortButton = ({ active, onOpen, onClear }) => (
    <button
        className={`filter-toggle-btn flex-shrink-0 ${active ? 'active' : ''}`}
        onClick={e => { e.stopPropagation(); onOpen() }}
    >
        <ArrowUpDown size={15} strokeWidth={2} />
        <span>Ordenar</span>
        {active && onClear && (
            <span
                className="filter-clear-sort"
                role="button"
                aria-label="Limpar ordenação"
                onClick={e => { e.stopPropagation(); onClear() }}
            >
                <X size={12} strokeWidth={2.5} />
            </span>
        )}
    </button>
)

export default SortButton
