/**
 * Calcula os textos de resumo de paginação ("Página X de Y" / "Mostrando W–Z de Total")
 * usados junto do componente `Pagination`/`MobilePagination`. Com 1 página só (ou nenhuma),
 * mostra apenas a contagem de registros, já que não há navegação possível.
 *
 * @param {object} params
 * @param {number} params.currentPage    índice da página atual (0-based)
 * @param {number} params.totalPages     total de páginas
 * @param {number} params.totalElements  total de itens em todas as páginas
 * @param {number} params.pageSize       tamanho da página (vindo de `res.data.size`)
 * @param {number} params.pageItemCount  quantidade de itens na página atual (ex.: `items.length`)
 * @returns {{ pageLabel: string, rangeLabel: string }}
 */
export function getPaginationSummary({ currentPage, totalPages, totalElements, pageSize, pageItemCount }) {
    // Sem registros não há resumo: quem comunica isso é o estado vazio da lista.
    if (totalElements === 0) return { pageLabel: '', rangeLabel: '' }

    if (totalPages <= 1) {
        return { pageLabel: `${totalElements} ${totalElements === 1 ? 'registro' : 'registros'}`, rangeLabel: '' }
    }

    const start = currentPage * pageSize + 1
    const end = start + pageItemCount - 1
    return {
        pageLabel: `Página ${currentPage + 1} de ${totalPages}`,
        rangeLabel: `Mostrando ${start}–${end} de ${totalElements}`,
    }
}
