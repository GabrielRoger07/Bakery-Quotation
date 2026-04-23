import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
        { key: "quotationStartFormatted", label: t("quotation_start_date") },
        { key: "quotationEndFormatted", label: t("quotation_end_date") },
        { key: "status", label: t("quotation_status") }
    ]

    const sortMap = useMemo(() => ({
        quotationId: "id",
        quotationStartFormatted: "quotationStart",
        quotationEndFormatted: "quotationEnd",
        status: null
    }), []);

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

    const fetchQuotations = useCallback(async (page = 0) => {
        let sortQuery = ""
        const backendSortField = sortMap[sortField]

        if(sortField) {
            sortQuery = `&sort=${backendSortField},${sortDirection}`
        }

        const res = await request("GET", `/quotations/company?page=${page}${sortQuery}`)

        if(res.ok){
            const mapped = res.data.content.map((q) => {

                const start = formatDateTime(q.quotationStart)
                const end = formatDateTime(q.quotationEnd)

                return {
                    ...q,
                    quotationStartFormatted: start ? `${start.date} • ${start.time}` : "-",
                    quotationEndFormatted: end ? `${end.date} • ${end.time}` : "-",
                    status:
                    new Date(q.quotationStart) > new Date() ? t("quotation_scheduled") : new Date(q.quotationEnd) < new Date() ? t("quotation_closed") : t("quotation_active")
                }
            })

            setQuotations(mapped);
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, sortMap, t])

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
    }, [fetchQuotations, currentPage])

    return (
        <div className="page-wrapper">
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

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

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
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-4">{t("quotation_cannot_delete")}</p>
                ) : (
                    <div>
                        <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                            <Trans i18nKey="quotation_remove_confirm" values={{quotation: quotationToRemove?.quotationId}} components={{strong: <strong />}}/>
                        </p>
                        <div className="flex justify-end gap-3">
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
