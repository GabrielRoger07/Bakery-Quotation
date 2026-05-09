import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import { useListPage } from '@/hooks/useListPage'
import Table from '@/components/data-display/Table'
import MobileCardList from '@/components/data-display/MobileCardList'
import SupplierBottomSheet from '@/features/suppliers/components/SupplierBottomSheet'
import SupplierFormBottomSheet from '@/features/suppliers/components/SupplierFormBottomSheet'
import Modal from '@/components/ui/Modal'
import Alert from '@/components/ui/Alert'
import SupplierCreate from '@/features/suppliers/pages/SupplierCreate'
import SupplierEdit from '@/features/suppliers/pages/SupplierEdit'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { ENV } from '@/config/env'
import { formatCnpj } from '@/utils/formatCnpj'
import { formatPhone } from '@/utils/formatPhone'

const SUPPLIER_FILTER_OPTIONS = [
    { value: "supplierName",           label: "Nome" },
    { value: "supplierEmail",          label: "E-mail" },
    { value: "supplierWhatsappNumber", label: "Whatsapp" },
    { value: "employerName",           label: "Empresa" },
    { value: "employerCnpj",           label: "CNPJ" },
]

const columns = [
    { key: "supplierName",           label: "Nome" },
    { key: "supplierEmail",          label: "E-mail" },
    { key: "supplierWhatsappNumber", label: "Whatsapp" },
    { key: "employerName",           label: "Nome da Empresa" },
    { key: "employerCnpj",           label: "CNPJ da Empresa" },
]

const SupplierList = () => {
    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const {
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
    } = useListPage({ idKey: 'supplierId' })

    const [searchField, setSearchField] = useState("")

    const fetchSuppliers = useCallback(async (page = 0) => {
        let query = `?page=${page}`
        sortField ? query += `&sort=${sortField},${sortDirection}` : query += `&sort=supplierName,${sortDirection}`
        if (appliedSearch.field) query += `&field=${appliedSearch.field}`
        if (appliedSearch.word) query += `&value=${appliedSearch.word}`

        const res = await request("GET", `/suppliers/company${query}`)
        if (res.ok) {
            setItems(res.data.content)
            setTotalPages(res.data.totalPages)
            setError("")
        } else {
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, appliedSearch, setItems, setTotalPages, setError, setStatus])

    useEffect(() => {
        fetchSuppliers(currentPage)
    }, [fetchSuppliers, currentPage])

    const handleSearch = useCallback(() => {
        setCurrentPage(0)
        setAppliedSearch({ field: searchField, word: searchWord })
    }, [searchField, searchWord, setCurrentPage, setAppliedSearch])

    const handleClearSearch = useCallback(() => {
        setSearchField("")
        setSearchWord("")
        setAppliedSearch({ field: "", word: "" })
        setCurrentPage(0)
    }, [setSearchWord, setAppliedSearch, setCurrentPage])

    const confirmRemove = async () => {
        if (!itemToRemove) return
        const res = await request("DELETE", `/suppliers/${itemToRemove.supplierId}`)
        if (res.ok) {
            fetchSuppliers()
            setError("")
        } else {
            setError("Erro ao remover fornecedor. Por favor tente novamente.")
        }
        closeModals()
    }

    const filterToolbar = useMemo(() => (
        <>
            <div className="relative">
                <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="toolbar-select">
                    <option value="">Selecione</option>
                    <option value="supplierName">Nome</option>
                    <option value="supplierEmail">E-mail</option>
                    <option value="supplierWhatsappNumber">Whatsapp</option>
                    <option value="employerName">Nome da Empresa</option>
                    <option value="employerCnpj">CNPJ da Empresa</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder="Digite o campo"
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading || !searchField}>Buscar</Button>
        </>
    ), [searchField, searchWord, setSearchWord, handleSearch, loading])

    const mobileFilterToolbar = useMemo(() => (
        <div className="mf-root">
            <p className="mf-label">Filtrar por</p>
            <div className="mf-chips">
                {SUPPLIER_FILTER_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`mf-chip ${searchField === opt.value ? 'selected' : ''}`}
                        onClick={() => setSearchField(prev => prev === opt.value ? "" : opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <div className="mf-input-row">
                <div className="mf-input-wrap">
                    <svg className="mf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        className="mf-input"
                        value={searchWord}
                        onChange={e => setSearchWord(e.target.value)}
                        placeholder={searchField ? `Buscar por ${SUPPLIER_FILTER_OPTIONS.find(o => o.value === searchField)?.label ?? '...'}` : "Selecione um campo acima"}
                        onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                        disabled={!searchField}
                    />
                    {searchWord && (
                        <button type="button" className="mf-input-clear" onClick={() => setSearchWord("")} aria-label="Limpar texto">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        </button>
                    )}
                </div>
                <button type="button" className="mf-search-btn" onClick={handleSearch} disabled={loading || !searchField}>
                    Buscar
                </button>
            </div>
            {appliedSearch.word && (
                <div className="mf-active-row">
                    <span className="mf-active-pill">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        {SUPPLIER_FILTER_OPTIONS.find(o => o.value === appliedSearch.field)?.label}: <strong>{appliedSearch.word}</strong>
                    </span>
                    <button type="button" className="mf-clear-btn" onClick={handleClearSearch}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        Limpar
                    </button>
                </div>
            )}
        </div>
    ), [searchField, searchWord, setSearchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const formattedSuppliers = items.map(supplier => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-",
    }))

    const renderSupplierCard = (supplier) => ({
        avatar: supplier.supplierName
            ? supplier.supplierName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : '?',
        title: supplier.supplierName,
        subtitle: supplier.employerName || undefined,
    })

    return (
        <div className="page-wrapper">
            {error && <Alert message={error} />}
            {status === 0 && <Alert message="Erro Interno do Servidor" />}

            {isMobile ? (
                <>
                    <MobileCardList
                        title="Fornecedores"
                        items={formattedSuppliers}
                        idKey="supplierId"
                        loading={loading}
                        emptyMessage="Nenhum fornecedor encontrado."
                        onReload={() => fetchSuppliers(currentPage)}
                        onAdd={openCreateForm}
                        onCardClick={openSheet}
                        renderCard={renderSupplierCard}
                        toolbar={mobileFilterToolbar}
                        filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
                        sortColumns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleColumnSort}
                        onClearSort={handleClearSort}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <SupplierBottomSheet
                        isOpen={sheetOpen}
                        onClose={closeSheet}
                        supplier={selectedItem}
                        onEdit={openEditForm}
                        onDelete={(id) => requestRemove(id, items)}
                    />
                    <SupplierFormBottomSheet
                        isOpen={formSheetOpen}
                        onClose={closeFormSheet}
                        mode={formSheetMode}
                        supplier={selectedItem}
                        onSaveCreate={fetchSuppliers}
                        onSaveEdit={handleSaveEdit}
                    />
                </>
            ) : (
                <>
                    <Table
                        title="Fornecedores"
                        columns={columns}
                        data={formattedSuppliers}
                        idKey="supplierId"
                        loading={loading}
                        onEdit={openEditForm}
                        onDelete={(id) => requestRemove(id, items)}
                        onAdd={openCreateForm}
                        onReload={() => fetchSuppliers(currentPage)}
                        onSort={handleColumnSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        emptyMessage="Nenhum fornecedor encontrado."
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Editar Fornecedor">
                <SupplierEdit
                    supplier={selectedItem}
                    onSave={handleSaveEdit}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Criar Fornecedor">
                <SupplierCreate
                    onSave={fetchSuppliers}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeModals} title="Confirmar Remoção">
                <div>
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                        Tem certeza de que você deseja remover o fornecedor <strong>{itemToRemove?.supplierName}</strong> da empresa <strong>{itemToRemove?.employerName}</strong>?
                    </p>
                    <div className="flex justify-center gap-3 mt-4">
                        <Button onClick={closeModals}>Cancelar</Button>
                        <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SupplierList
