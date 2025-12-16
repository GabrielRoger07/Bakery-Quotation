import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation, Trans } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Modal from '../../components/Modal'
import Table from '../../components/Table'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import QuotationCreate from './QuotationCreate'
import QuotationEdit from './QuotationEdit'
import QuotationDetails from './QuotationDetails'
import './QuotationList.css'
import { ENV } from '../../config/env'
import { formatDateTime } from '../../utils/formatDateTime'

const QuotationList = () => {

    const { t } = useTranslation()

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToEdit, setQuotationToEdit] = useState(null)
    const [quotationToView, setQuotationToView] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [quotationToRemove, setQuotationToRemove] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState("asc")

    const columns = [
        { key: "quotationId", label: t("quotation_id") },
        { key: "quotationStart", label: t("quotation_start_date") },
        { key: "quotationEnd", label: t("quotation_end_date") },
        { key: "status", label: t("quotation_status") }
    ]

    const sortMap = {
        quotationId: "id",
        quotationStart: "quotationStart",
        quotationEnd: "quotationEnd",
        status: null
    }

    const openEditModal = (quotation) => {
        setQuotationToEdit(quotation)
        setIsEditModalOpen(true)
    }

    const openDetailsModal = (quotation) => {
        setQuotationToView(quotation)
        setIsDetailsModalOpen(true)
    }

    const closeModals = () => {
        setQuotationToEdit(null)
        setQuotationToView(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setIsDetailsModalOpen(false)
        setConfirmOpen(false)
        setQuotationToRemove(null)
        setCannotDelete(false)
    }

    const handleSaveCreate = () => {
        fetchQuotations()
    }

    const handleSaveEdit = (updatedQuotation) => {
        const status = new Date(updatedQuotation.quotationStart) > new Date() ? t("quotation_scheduled") : new Date(updatedQuotation.quotationEnd) < new Date() ? t("quotation_closed") : t("quotation_active")
        setQuotations((prev) => 
            prev.map((q) => q.quotationId === updatedQuotation.quotationId ? {...updatedQuotation, status} : q)
        )
    }

    const requestRemove = (quotationId) => {
        const q = quotations.find((x) => x.quotationId === quotationId)
        if(new Date(q.quotationStart) <= new Date()){
            setCannotDelete(true)
            setConfirmOpen(true)
            setQuotationToRemove(null)
        }else{
            setQuotationToRemove(q)
            setCannotDelete(false)
            setConfirmOpen(true)
        }
    }

    const confirmRemove = async () => {
        if(!quotationToRemove) return

        const res = await request("DELETE", `/quotations/${quotationToRemove.quotationId}`)
        if(res.ok){
            fetchQuotations()
            setError("")
        }else{
            setError(t("delete_quotation_error"))
        }
        closeModals()
    }

    const handleMonitor = (quotation) => {
        navigate(`/quotations/monitor?id=${quotation.quotationId}`)
    }

    const fetchQuotations = async (page = 0) => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        let sortQuery = ""
        const backendSortField = sortMap[sortField]

        if(sortField) {
            sortQuery = `&sort=${backendSortField},${sortDirection}`
        }

        const res = await request("GET", `/quotations/company/${cnpj}?page=${page}${sortQuery}`)
        
        if(res.ok){
            const mapped = res.data.content.map((q) => {

                const start = formatDateTime(q.quotationStart)
                const end = formatDateTime(q.quotationEnd)

                return {
                    ...q,
                    quotationStart: start ? (
                        <div className="date-cell">
                            <span>{start.date} - {start.time}</span>
                        </div>
                    ) : "-",
                    quotationEnd: end ? (
                        <div className="date-cell">
                            <span>{end.date} - {end.time}</span>
                        </div>
                    ) : "-",
                    status:
                    new Date(q.quotationStart) > new Date() ? t("quotation_scheduled") : new Date(q.quotationEnd) < new Date() ? t("quotation_closed") : t("quotation_active")
                }
            })

            setQuotations(mapped);
            setTotalPages(res.data.totalPages)
            setCurrentPage(res.data.number)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }

    const handleColumnSort = (columnKey) => {

        if(!sortMap[columnKey]) {
            return
        }

        if(sortField === columnKey) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(columnKey)
            setSortDirection("asc")
        }

        setCurrentPage(0)
    }

    useEffect(() => {
        fetchQuotations(currentPage);
    }, [sortField, sortDirection, currentPage])

    return (
    <div className="quotation-list-container">
        {error && <Alert message={error} />}
        {status === 0 && <Alert message={t("server_internal_error")} />}

        <Table 
            title={t("quotations_title_list")}
            columns={columns}
            data={quotations}
            idKey="quotationId"
            loading={loading}
            onEdit={openEditModal}
            onDelete={requestRemove}
            onAdd={() => setIsCreateModalOpen(true)}
            onReload={() => fetchQuotations(currentPage)}
            onSort={handleColumnSort}
            sortField={sortField}
            sortDirection={sortDirection}
            onView={openDetailsModal}
            onMonitor={handleMonitor}
            emptyMessage={t("quotations_empty")}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchQuotations(page)} />

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title={t("quotations_title_edit")}>
            <QuotationEdit
                quotation={quotationToEdit}
                onSave={handleSaveEdit}
                onClose={closeModals}
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={t("quotations_title_create")}>
            <QuotationCreate
                onSave={handleSaveCreate}
                onClose={closeModals}
            />
        </Modal>

        <Modal isOpen={isDetailsModalOpen} onClose={closeModals} title={t("quotations_title_details")}>
            <QuotationDetails
                quotation={quotationToView}
            />
        </Modal>

        <Modal isOpen={confirmOpen} onClose={closeModals} title={t("confirm_removal")}>
            {cannotDelete ? (
                <p className="confirm-message">{t("quotation_cannot_delete")}</p>
            ) : (
                <div className="confirm-container">
                    <p className="confirm-message"><Trans i18nKey="quotation_remove_confirm" values={{quotation: quotationToRemove?.quotationId}} components={{strong: <strong />}}/></p>
                    <div className="confirm-buttons">
                        <Button onClick={closeModals}>{t("cancel_button")}</Button>
                        <Button onClick={confirmRemove} disabled={loading}>{t("confirm_button")}</Button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  )
}

export default QuotationList