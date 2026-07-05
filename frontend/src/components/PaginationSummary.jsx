/**
 * Stack de texto com o resumo de paginação ("Página X de Y" + "Mostrando W–Z de Total"
 * ou "N registros"), calculado por `getPaginationSummary` (@/utils/paginationSummary).
 * Usado ao lado de `Pagination` (desktop) e dentro do `inlineToolbar` de `MobileCardList`.
 */
const PaginationSummary = ({ pageLabel, rangeLabel }) => (
    <div className="flex flex-col gap-0.5 min-w-0">
        {pageLabel && <span className="text-caption font-bold text-[var(--color-text-heading)]">{pageLabel}</span>}
        {rangeLabel && <span className="text-label text-[var(--color-text-muted)] truncate">{rangeLabel}</span>}
    </div>
)

export default PaginationSummary
