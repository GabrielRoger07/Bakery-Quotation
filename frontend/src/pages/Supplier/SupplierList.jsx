import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import MobileCardList from '../../components/MobileCardList'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import SupplierCreate from './SupplierCreate'
import SupplierEdit from './SupplierEdit'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import { formatCnpj } from '../../utils/formatCnpj'
import { formatPhone } from '../../utils/formatPhone'
import { Phone, Building2 } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'

const SUPPLIER_FILTER_OPTIONS = [
    { value: "supplierName",           label: "Nome" },
    { value: "supplierEmail",          label: "E-mail" },
    { value: "supplierWhatsappNumber", label: "Whatsapp" },
    { value: "employerName",           label: "Empresa" },
    { value: "employerCnpj",           label: "CNPJ" },
]

const SupplierList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [supplierToEdit, setSupplierToEdit] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [supplierToRemove, setSupplierToRemove] = useState(null)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState("asc")

    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState({ field: "", word: "" })

    const columns = [
        { key: "supplierName", label: "Nome"},
        { key: "supplierEmail", label: "E-mail"},
        { key: "supplierWhatsappNumber", label: "Whatsapp"},
        { key: "employerName", label: "Nome da Empresa"},
        { key: "employerCnpj", label: "CNPJ da Empresa"}
    ]

    const openEditModal = (supplier) => {
        setSupplierToEdit(supplier)
        setIsEditModalOpen(true)
    }

    const closeModals = () => {
        setSupplierToEdit(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setConfirmOpen(false)
        setSupplierToRemove(null)
    }

    const handleSaveCreate = () => {
        fetchSuppliers()
    }

    const handleSaveEdit = (updatedSupplier) => {
        setSuppliers(prev => prev.map(s => s.supplierId === updatedSupplier.supplierId ? updatedSupplier : s))
    }

    const requestRemove = (supplierId) => {
        const supplier = suppliers.find(s => s.supplierId === supplierId)
        setSupplierToRemove(supplier)
        setConfirmOpen(true)
    }

    const confirmRemove = async () => {

        if(!supplierToRemove) return

        const res = await request("DELETE", `/suppliers/${supplierToRemove.supplierId}`)

        if(res.ok){
            fetchSuppliers();
            setError("")
        }else{
            setError("Erro ao remover fornecedor. Por favor tente novamente.")
        }
        closeModals()
    }

    const fetchSuppliers = useCallback(async (page = 0) => {

        let query = `?page=${page}`
        sortField ? query += `&sort=${sortField},${sortDirection}` : query += `&sort=supplierName,${sortDirection}`
        if(appliedSearch.field) query += `&field=${appliedSearch.field}`
        if(appliedSearch.word) query += `&value=${appliedSearch.word}`

        const res = await request("GET", `/suppliers/company${query}`)

        if(res.ok){
            setSuppliers(res.data.content);
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, appliedSearch])

    const handleSearch = useCallback(() => {
        setCurrentPage(0)
        setAppliedSearch({ field: searchField, word: searchWord })
    }, [searchField, searchWord])

    const handleColumnSort = (columnKey) => {
        if(sortField === columnKey){
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(columnKey)
            setSortDirection("asc")
        }

        setCurrentPage(0)
    }

    const handleClearSort = () => {
        setSortField(null)
        setSortDirection("asc")
        setCurrentPage(0)
    }

    useEffect(() => {
        fetchSuppliers(currentPage);
    }, [fetchSuppliers, currentPage])

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
                placeholder={"Digite o campo"}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading || !searchField}>Buscar</Button>
        </>
    ), [searchField, searchWord, handleSearch, loading])

    const handleClearSearch = useCallback(() => {
        setSearchField("")
        setSearchWord("")
        setAppliedSearch({ field: "", word: "" })
        setCurrentPage(0)
    }, [])

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
                <button
                    type="button"
                    className="mf-search-btn"
                    onClick={handleSearch}
                    disabled={loading || !searchField}
                >
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
    ), [searchField, searchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-"
    }))

    const renderSupplierCard = (supplier) => {
        const initials = supplier.supplierName
            ? supplier.supplierName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : '?'

        const tags = []
        if (supplier.supplierWhatsappNumber && supplier.supplierWhatsappNumber !== '-') {
            tags.push({ label: supplier.supplierWhatsappNumber, icon: <Phone size={10} strokeWidth={2.5} />, variant: 'accent' })
        }
        if (supplier.employerCnpj && supplier.employerCnpj !== '-') {
            tags.push({ label: supplier.employerCnpj, icon: <Building2 size={10} strokeWidth={2.5} /> })
        }

        return {
            avatar: initials,
            title: supplier.supplierName,
            subtitle: supplier.employerName || undefined,
            meta: supplier.supplierEmail && supplier.supplierEmail !== '-' ? supplier.supplierEmail : undefined,
            tags,
        }
    }

    return (
        <div className="page-wrapper">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <MobileCardList
                    title="Fornecedores"
                    items={formattedSuppliers}
                    idKey="supplierId"
                    loading={loading}
                    emptyMessage="Nenhum fornecedor encontrado."
                    onReload={() => fetchSuppliers(currentPage)}
                    onAdd={() => setIsCreateModalOpen(true)}
                    onEdit={openEditModal}
                    onDelete={requestRemove}
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
            ) : (
                <>
                    <Table
                        title={"Fornecedores"}
                        columns={columns}
                        data={formattedSuppliers}
                        idKey="supplierId"
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={requestRemove}
                        onAdd={() => setIsCreateModalOpen(true)}
                        onReload={() => fetchSuppliers(currentPage)}
                        onSort={handleColumnSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        emptyMessage={"Nenhum fornecedor encontrado."}
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title={"Editar Fornecedor"}>
                <SupplierEdit
                    supplier={supplierToEdit}
                    onSave={handleSaveEdit}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={"Criar Fornecedor"}>
                <SupplierCreate
                    onSave={handleSaveCreate}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeModals} title={"Confirmar Remoção"}>
                <div>
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                        Tem certeza de que você deseja remover o fornecedor <strong>{supplierToRemove?.supplierName}</strong> da empresa <strong>{supplierToRemove?.employerName}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button onClick={closeModals}>Cancelar</Button>
                        <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SupplierList
