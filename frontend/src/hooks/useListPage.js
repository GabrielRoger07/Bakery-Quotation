import { useState, useCallback } from 'react'
import useIsMobile from '@/hooks/useIsMobile'

/**
 * @param {object} config
 * @param {string} config.idKey              — campo identificador, ex: "productId"
 * @param {string} [config.defaultSortField] — campo de ordenação inicial
 */
export function useListPage({ idKey, defaultSortField = null }) {
    const isMobile = useIsMobile()

    const [items, setItems] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [sortField, setSortField] = useState(defaultSortField)
    const [sortDirection, setSortDirection] = useState("asc")

    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState({ field: "", word: "" })

    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetMode, setFormSheetMode] = useState('create')

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [itemToRemove, setItemToRemove] = useState(null)

    const openSheet = useCallback((item) => {
        setSelectedItem(item); setSheetOpen(true)
    }, [])

    const closeSheet = useCallback(() => {
        setSheetOpen(false); setSelectedItem(null)
    }, [])

    const openCreateForm = useCallback(() => {
        if (isMobile) { setSelectedItem(null); setFormSheetMode('create'); setFormSheetOpen(true) }
        else setIsCreateModalOpen(true)
    }, [isMobile])

    const openEditForm = useCallback((item) => {
        setSelectedItem(item)
        if (isMobile) { setFormSheetMode('edit'); setFormSheetOpen(true) }
        else setIsEditModalOpen(true)
    }, [isMobile])

    const closeFormSheet = useCallback(() => {
        setFormSheetOpen(false); setSelectedItem(null)
    }, [])

    const closeModals = useCallback(() => {
        setSelectedItem(null)
        setIsEditModalOpen(false); setIsCreateModalOpen(false)
        setConfirmOpen(false); setItemToRemove(null)
    }, [])

    const requestRemove = useCallback((id, allItems) => {
        const found = allItems.find(i => i[idKey] === id)
        setItemToRemove(found); setConfirmOpen(true)
    }, [idKey])

    const handleSaveEdit = useCallback((updated) => {
        setItems(prev => prev.map(i => i[idKey] === updated[idKey] ? updated : i))
    }, [idKey])

    const handleColumnSort = useCallback((columnKey) => {
        setSortDirection(prev => sortField === columnKey ? (prev === "asc" ? "desc" : "asc") : "asc")
        setSortField(columnKey)
        setCurrentPage(0)
    }, [sortField])

    const handleClearSort = useCallback(() => {
        setSortField(null); setSortDirection("asc"); setCurrentPage(0)
    }, [])

    const handleSearch = useCallback((field, word) => {
        setCurrentPage(0); setAppliedSearch({ field, word })
    }, [])

    const handleClearSearch = useCallback(() => {
        setSearchWord(""); setAppliedSearch({ field: "", word: "" }); setCurrentPage(0)
    }, [])

    return {
        isMobile,
        items, setItems, error, setError, status, setStatus,
        currentPage, setCurrentPage, totalPages, setTotalPages,
        sortField, sortDirection,
        searchWord, setSearchWord, appliedSearch, setAppliedSearch,
        sheetOpen, selectedItem, openSheet, closeSheet,
        isCreateModalOpen, isEditModalOpen,
        formSheetOpen, formSheetMode,
        openCreateForm, openEditForm, closeFormSheet, closeModals,
        confirmOpen, itemToRemove, requestRemove,
        handleSaveEdit, handleColumnSort, handleClearSort,
        handleSearch, handleClearSearch,
    }
}
