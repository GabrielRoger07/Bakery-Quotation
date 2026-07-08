import { ArrowUpDown } from 'lucide-react'

/**
 * Pill usado nas listas mobile (Table/MobileCardList), tipicamente
 * ao lado de `PaginationSummary` no `inlineToolbar` do `MobileCardList`.
 * Abre o `SortBottomSheet` com as opções de ordenação da tela.
 *
 * Props:
 *   label    string — texto exibido, refletindo a ordenação ativa (ex.: "A-Z", "Recentes")
 *   onOpen   fn() — abre o SortBottomSheet
 */
const SortButton = ({ label = 'Ordenar', onOpen }) => (
    <button
        className="filter-toggle-btn sort-pill-btn flex-shrink-0"
        onClick={e => { e.stopPropagation(); onOpen() }}
    >
        <ArrowUpDown size={15} strokeWidth={2} />
        <span>{label}</span>
    </button>
)

export default SortButton
