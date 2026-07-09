import { useCallback, useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import { ENV } from '@/config/env'

/**
 * Encapsula a lógica comum das listas paginadas (Product/Supplier):
 * fetch, paginação, ordenação, busca e fluxo de remoção com confirmação.
 *
 * A apresentação (Table/MobileCardList, toolbars, modais de form) e qualquer
 * filtro específico de domínio permanecem na página.
 *
 * @param {object} cfg
 * @param {string} cfg.endpoint            ex.: '/products/company'
 * @param {string} cfg.idKey               ex.: 'productId'
 * @param {string} cfg.defaultSortField    ex.: 'productName'
 * @param {(item) => string} cfg.deletePath caminho do DELETE p/ um item
 * @param {string} cfg.deleteErrorMessage  mensagem de erro ao remover
 */
export default function useResourceList({ endpoint, idKey, defaultSortField, deletePath, deleteErrorMessage }) {
  const { request, loading } = useFetch(ENV.API_BASE_URL)

  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [initialLoad, setInitialLoad] = useState(true)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)

  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const [appliedSearch, setAppliedSearch] = useState({ field: '', word: '' })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)

  const fetchItems = useCallback(async (page = 0) => {
    let query = `?page=${page}`
    query += sortField
      ? `&sort=${sortField},${sortDirection}`
      : `&sort=${defaultSortField},${sortDirection}`
    if (appliedSearch.field) query += `&field=${appliedSearch.field}`
    if (appliedSearch.word) query += `&value=${appliedSearch.word}`

    const res = await request('GET', `${endpoint}${query}`)
    if (res.ok) {
      setItems(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
      setPageSize(res.data.size)
      setError('')
    } else {
      setError(res.data?.message)
    }
    setStatus(res.status)
    setInitialLoad(false)
  }, [request, endpoint, sortField, sortDirection, appliedSearch, defaultSortField])

  useEffect(() => {
    // Busca a página atual ao montar e sempre que página/ordenação/busca mudam — comportamento intencional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems(currentPage)
  }, [fetchItems, currentPage])

  const handleSort = (columnKey) => {
    if (sortField === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(columnKey)
      setSortDirection('asc')
    }
    setCurrentPage(0)
  }

  const clearSort = () => {
    setSortField(null)
    setSortDirection('asc')
    setCurrentPage(0)
  }

  const setSort = (field, direction) => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(0)
  }

  const applySearch = (field, word) => {
    setCurrentPage(0)
    setAppliedSearch({ field, word })
  }

  const clearSearch = () => {
    setAppliedSearch({ field: '', word: '' })
    setCurrentPage(0)
  }

  const requestRemove = (id) => {
    setItemToRemove(items.find(it => it[idKey] === id))
    setConfirmOpen(true)
  }

  const cancelRemove = () => {
    setConfirmOpen(false)
    setItemToRemove(null)
  }

  const confirmRemove = async () => {
    if (!itemToRemove) return
    const res = await request('DELETE', deletePath(itemToRemove))
    if (res.ok) {
      fetchItems(currentPage)
      setError('')
    } else {
      setError(deleteErrorMessage)
    }
    cancelRemove()
  }

  return {
    items, setItems, loading: loading || initialLoad, error, setError, status,
    currentPage, setCurrentPage, totalPages, totalElements, pageSize,
    sortField, sortDirection, handleSort, clearSort, setSort,
    appliedSearch, applySearch, clearSearch,
    refetch: fetchItems,
    confirm: {
      isOpen: confirmOpen,
      item: itemToRemove,
      requestRemove,
      confirm: confirmRemove,
      cancel: cancelRemove,
    },
  }
}
