import Button from '@/components/Button'

const pageButtonBase = 'min-w-[2rem] h-8 px-2 text-[0.875rem] font-medium rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] cursor-pointer text-[var(--color-text-neutral)] flex items-center justify-center transition-[background-color,border-color,color,box-shadow] duration-[160ms] ease-[ease]'
const pageButtonActive = '!bg-[var(--color-accent)] !text-white !border-[var(--color-accent)] font-bold [box-shadow:var(--shadow-accent)]'
const pageButtonInactive = 'hover:bg-[var(--color-highlight-lighter)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'

/**
 * Controles de paginação (desktop), com elipses quando há muitas páginas.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        const lastPage = totalPages - 1
        pages.push(0)
        if (currentPage > 2) pages.push("ellipsis-start")
        if (currentPage > 1) pages.push(currentPage - 1)
        if (currentPage !== 0 && currentPage !== lastPage) pages.push(currentPage)
        if (currentPage < lastPage - 1) pages.push(currentPage + 1)
        if (currentPage < lastPage - 2) pages.push("ellipsis-end")
        if (lastPage !== 0) pages.push(lastPage)
        return [...new Set(pages)]
    }

    const pages = getPageNumbers()

    return (
        <div className="flex justify-center items-center gap-3 mt-[1.125rem] mb-5 flex-wrap">
            <Button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="!text-[0.875rem] !min-h-[2.125rem] !px-[0.875rem] !py-[0.375rem]"
            >
                {"<"} Anterior
            </Button>

            <div className="flex gap-1 items-center">
                {pages.map((page, index) => {
                    if (page === "ellipsis-start" || page === "ellipsis-end") {
                        return <span key={index} className="px-1 text-[0.875rem] text-[var(--color-text-muted)]">...</span>
                    }
                    return (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`${pageButtonBase} ${page === currentPage ? pageButtonActive : pageButtonInactive}`}
                        >
                            {page + 1}
                        </button>
                    )
                })}
            </div>

            <Button
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="!text-[0.875rem] !min-h-[2.125rem] !px-[0.875rem] !py-[0.375rem]"
            >
                Próximo {">"}
            </Button>
        </div>
    )
}

export default Pagination