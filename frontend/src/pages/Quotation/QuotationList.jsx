import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import Modal from '../../components/Modal'
import Table from '../../components/Table'
import MobileCardList from '../../components/MobileCardList'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import QuotationCreate from './QuotationCreate'
import QuotationEdit from './QuotationEdit'
import QuotationDetails from './QuotationDetails'
import { ENV } from '../../config/env'
import { formatDateTime } from '../../utils/formatDateTime'
import useIsMobile from '../../hooks/useIsMobile'
import { CalendarRange } from 'lucide-react'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const isMobile = useIsMobile()

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
        { key: "quotationId", label: "ID" },
        { key: "quotationStartFormatted", label: "Data de Início" },
        { key: "quotationEndFormatted", label: "Data de Fim" },
        { key: "status", label: "Status" }
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
        const status = new Date(updatedQuotation.quotationStart) > new Date() ? "Agendado" : new Date(updatedQuotation.quotationEnd) < new Date() ? "Fechado" : "Ativo"
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
            setError("Erro ao remover cotação. Por favor tente novamente.")
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
                    new Date(q.quotationStart) > new Date() ? "Agendado" : new Date(q.quotationEnd) < new Date() ? "Fechado" : "Ativo"
                }
            })

            setQuotations(mapped);
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, sortMap])

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

    const renderQuotationCard = (quotation) => {
        const statusVariant =
            quotation.status === 'Ativo' ? 'success' :
            quotation.status === 'Agendado' ? 'accent' : ''

        return {
            avatar: <CalendarRange size={20} strokeWidth={1.75} />,
            title: `Cotação #${quotation.quotationId}`,
            subtitle: `${quotation.quotationStartFormatted} → ${quotation.quotationEndFormatted}`,
            tags: [{ label: quotation.status, variant: statusVariant }],
        }
    }

    return (
        <div className="page-wrapper">
            {error && <Alert message={error} />}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <MobileCardList
                    title="Cotações"
                    items={quotations}
                    idKey="quotationId"
                    loading={loading}
                    emptyMessage="Nenhuma cotação encontrada."
                    onReload={() => fetchQuotations(currentPage)}
                    onAdd={() => setIsCreateModalOpen(true)}
                    onEdit={openEditModal}
                    onDelete={requestRemove}
                    onView={openDetailsModal}
                    onMonitor={handleMonitor}
                    renderCard={renderQuotationCard}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            ) : (
                <>
                    <Table
                        title={"Cotações"}
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
                        emptyMessage={"Nenhuma cotação encontrada."}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title={"Editar Cotação"}>
                <QuotationEdit
                    quotation={quotationToEdit}
                    onSave={handleSaveEdit}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={"Criar Cotação"}>
                <QuotationCreate
                    onSave={handleSaveCreate}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isDetailsModalOpen} onClose={closeModals} title={"Detalhes da Cotação"}>
                <QuotationDetails
                    quotation={quotationToView}
                />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeModals} title={"Confirmar Remoção"}>
                {cannotDelete ? (
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-4">Você não pode remover uma cotação que já começou.</p>
                ) : (
                    <div>
                        <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                            Tem certeza de que você deseja remover a cotação <strong>{quotationToRemove?.quotationId}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button onClick={closeModals}>Cancelar</Button>
                            <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default QuotationList
