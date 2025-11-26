import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
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

    const fetchSuppliers = async (page = 0) => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        let sortQuery = ""
        if(sortField) {
            sortQuery = `&sort=${sortField},${sortDirection}`
        }

        const res = await request("GET", `/suppliers/company/${cnpj}?page=${page}${sortQuery}`)
        if(res.ok){
            setSuppliers(res.data.content);
            setTotalPages(res.data.totalPages)
            setCurrentPage(res.data.number)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }

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
    }, [sortField, sortDirection, currentPage])

    return (
    <div className="supplier-list-container">
        {error && <Alert message={error}/>}
        {status === 0 && <Alert message={t("server_internal_error")} />}

        <Table 
            title={t("suppliers_title_list")}
            columns={columns}
            data={suppliers}
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
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchSuppliers(page)} />

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