import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import Modal from '@/components/Modal'
import Table from '@/components/Table'
import MobileCardList from '@/components/MobileCardList'
import QuotationBottomSheet from '@/components/QuotationBottomSheet'
import QuotationDetails from '@/pages/Quotation/QuotationDetails'
import StatusTabFilter from '@/components/StatusTabFilter'
import Alert from '@/components/Alert'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import Pagination from '@/components/Pagination'
import { ENV } from '@/config/env'
import { formatDateTime } from '@/utils/formatDateTime'
import useIsMobile from '@/hooks/useIsMobile'
import { CalendarRange } from 'lucide-react'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToView, setQuotationToView] = useState(null)

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetQuotation, setSheetQuotation] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [quotationToRemove, setQuotationToRemove] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState("asc")

    const [statusFilter, setStatusFilter] = useState("")

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
    }), [])

    const openDetailsModal = (quotation) => {
        setQuotationToView(quotation)
        setIsDetailsModalOpen(true)
    }

    const closeModals = () => {
        setQuotationToView(null)
        setIsDetailsModalOpen(false)
        setConfirmOpen(false)
        setQuotationToRemove(null)
        setCannotDelete(false)
    }

    const openSheet = (quotation) => {
        setSheetQuotation(quotation)
        setSheetOpen(true)
    }

    const closeSheet = () => {
        setSheetOpen(false)
        setSheetQuotation(null)
    }

    const requestRemove = (quotationId) => {
        const q = quotations.find((x) => x.quotationId === quotationId)
        if (new Date(q.quotationStart) <= new Date()) {
            setCannotDelete(true)
            setConfirmOpen(true)
            setQuotationToRemove(null)
        } else {
            setQuotationToRemove(q)
            setCannotDelete(false)
            setConfirmOpen(true)
        }
    }

    const confirmRemove = async () => {
        if (!quotationToRemove) return
        const res = await request("DELETE", `/quotations/${quotationToRemove.quotationId}`)
        if (res.ok) {
            fetchQuotations()
            setError("")
        } else {
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
        if (sortField) sortQuery = `&sort=${backendSortField},${sortDirection}`

        const res = await request("GET", `/quotations/company?page=${page}${sortQuery}`)
        if (res.ok) {
            const mapped = res.data.content.map((q) => {
                const start = formatDateTime(q.quotationStart)
                const end = formatDateTime(q.quotationEnd)
                return {
                    ...q,
                    quotationStartFormatted: start ? `${start.date} • ${start.time}` : "-",
                    quotationEndFormatted: end ? `${end.date} • ${end.time}` : "-",
                    status: new Date(q.quotationStart) > new Date() ? "Agendado"
                          : new Date(q.quotationEnd) < new Date() ? "Fechado"
                          : "Ativo"
                }
            })
            setQuotations(mapped)
            setTotalPages(res.data.totalPages)
            setError("")
        } else {
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, sortMap])

    const handleColumnSort = (columnKey) => {
        if (!sortMap[columnKey]) return
        if (sortField === columnKey) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(columnKey)
            setSortDirection("asc")
        }
        setCurrentPage(0)
    }

    useEffect(() => {
        fetchQuotations(currentPage)
    }, [fetchQuotations, currentPage])

    const statusCounts = useMemo(() => {
        const counts = { "": quotations.length, agendado: 0, ativo: 0, fechado: 0 }
        for (const q of quotations) {
            const key = q.status.toLowerCase()
            if (key in counts) counts[key]++
        }
        return counts
    }, [quotations])

    const filteredQuotations = useMemo(() => {
        if (!statusFilter) return quotations
        return quotations.filter(q => q.status.toLowerCase() === statusFilter)
    }, [quotations, statusFilter])

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
        <PageContainer variant="list">

            {error && <Alert message={error} />}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <>
                    <div className="px-4 pt-4">
                        <StatusTabFilter
                            value={statusFilter}
                            onChange={setStatusFilter}
                            mobile
                            counts={statusCounts}
                        />
                    </div>
                    <MobileCardList
                        title="Cotações"
                        items={filteredQuotations}
                        idKey="quotationId"
                        loading={loading}
                        emptyMessage="Nenhuma cotação encontrada."
                        onReload={() => fetchQuotations(currentPage)}
                        onAdd={() => navigate('/quotations/new')}
                        onCardClick={openSheet}
                        renderCard={renderQuotationCard}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <QuotationBottomSheet
                        isOpen={sheetOpen}
                        onClose={closeSheet}
                        quotation={sheetQuotation}
                        onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                        onDelete={requestRemove}
                        onMonitor={handleMonitor}
                    />
                </>
            ) : (
                <>
                    <Table
                        title={"Cotações"}
                        columns={columns}
                        data={filteredQuotations}
                        idKey="quotationId"
                        loading={loading}
                        onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                        onDelete={requestRemove}
                        onAdd={() => navigate('/quotations/new')}
                        onReload={() => fetchQuotations(currentPage)}
                        onSort={handleColumnSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onView={openDetailsModal}
                        onMonitor={handleMonitor}
                        emptyMessage={"Nenhuma cotação encontrada."}
                        filterSlot={
                            <StatusTabFilter
                                value={statusFilter}
                                onChange={setStatusFilter}
                                counts={statusCounts}
                            />
                        }
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}

            <Modal isOpen={isDetailsModalOpen} onClose={closeModals} title={"Detalhes da Cotação"}>
                <QuotationDetails quotation={quotationToView} />
            </Modal>

            {cannotDelete ? (
                <Modal isOpen={confirmOpen} onClose={closeModals} title={"Confirmar Remoção"}>
                    <p className="mb-4 text-body text-[var(--color-text-secondary)]">Você não pode remover uma cotação que já começou.</p>
                </Modal>
            ) : (
                <ConfirmDialog
                    isOpen={confirmOpen}
                    onClose={closeModals}
                    onConfirm={confirmRemove}
                    loading={loading}
                >
                    Tem certeza de que você deseja remover a cotação <strong>{quotationToRemove?.quotationId}</strong>?
                </ConfirmDialog>
            )}
        </PageContainer>
    )
}

export default QuotationList
