import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import SupplierCreate from './SupplierCreate'
import SupplierEdit from './SupplierEdit'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import './SupplierList.css'
import { ENV } from '../../config/env'
import { formatCnpj } from '../../utils/formatCnpj'
import { formatPhone } from '../../utils/formatPhone'

const SupplierList = () => {

    const { t } = useTranslation()

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
        { key: "supplierName", label: t("supplier_name")},
        { key: "supplierEmail", label: t("supplier_email")},
        { key: "supplierWhatsappNumber", label: t("supplier_whatsapp")},
        { key: "employerName", label: t("employer_name")},
        { key: "employerCnpj", label: t("employer_cnpj")}
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
            setError(t("delete_supplier_error"))
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
            <div className="search-select-wrapper">
                <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="custom-select">
                    <option value="">{t("select_field")}</option>
                    <option value="supplierName">{t("supplier_name")}</option>
                    <option value="supplierEmail">{t("supplier_email")}</option>
                    <option value="supplierWhatsappNumber">{t("supplier_whatsapp")}</option>
                    <option value="employerName">{t("employer_name")}</option>
                    <option value="employerCnpj">{t("employer_cnpj")}</option>
                </select>
                <span className="select-arrow"></span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("enter_search")}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading || !searchField}>{t("search_button")}</Button>
        </>
    ), [searchField, searchWord, handleSearch, loading, t])

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-"
    }))

    return (
    <div className="page-container">
        {error && <Alert message={error}/>}
        {status === 0 && <Alert message={t("server_internal_error")} />}

        <Table
            title={t("suppliers_title_list")}
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
            emptyMessage={t("suppliers_empty")}
            toolbar={filterToolbar}
            filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title={t("suppliers_title_edit")}>
            <SupplierEdit 
                supplier={supplierToEdit} 
                onSave={handleSaveEdit}
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={t("suppliers_title_create")}>
            <SupplierCreate
                onSave={handleSaveCreate}
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={confirmOpen} onClose={closeModals} title={t("confirm_removal")}>
            <div className="confirm-container">
                <p className="confirm-message"><Trans i18nKey="supplier_remove_confirm" values={{supplier: supplierToRemove?.supplierName, employer: supplierToRemove?.employerName}} components={{strong: <strong />}}/></p>
                <div className="confirm-buttons">
                    <Button onClick={closeModals}>{t("cancel_button")}</Button>
                    <Button onClick={confirmRemove} disabled={loading}>{t("confirm_button")}</Button>
                </div>
            </div>
        </Modal>
    </div>
  )
}

export default SupplierList