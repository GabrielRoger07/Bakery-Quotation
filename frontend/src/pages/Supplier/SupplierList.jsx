import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import SupplierCreate from './SupplierCreate'
import SupplierEdit from './SupplierEdit'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import { formatCnpj } from '../../utils/formatCnpj'
import { formatPhone } from '../../utils/formatPhone'

const SupplierList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)

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

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-"
    }))

    return (
        <div className="page-wrapper">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

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
                        Tem certeza de que você deseja remover o fornecedor <strong>${supplierToRemove?.supplierName}</strong> da empresa <strong>${supplierToRemove?.employerName}</strong>?",
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
