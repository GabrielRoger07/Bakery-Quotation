import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { CalendarRange, CheckCircle, X } from 'lucide-react'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const location = useLocation()
    const isMobile = useIsMobile()

    const [savedNotice, setSavedNotice] = useState(location.state?.quotationSaved ?? null)

    // Limpa o state de navegação para o banner não reaparecer ao recarregar/voltar
    useEffect(() => {
        if (location.state?.quotationSaved) {
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, location.pathname, navigate])

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

            {savedNotice && (
                <div className="mx-4 mt-4 flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--color-success-border)] bg-[var(--color-success-lighter)] px-3.5 py-3">
                    <CheckCircle size={20} strokeWidth={2} className="flex-shrink-0 text-[var(--color-success)]" />
                    <span className="flex-1 text-[0.875rem] font-semibold text-[var(--color-success-strong)]">
                        {savedNotice === 'edit' ? 'Cotação atualizada com sucesso!' : 'Cotação criada com sucesso!'}
                    </span>
                    <button
                        onClick={() => setSavedNotice(null)}
                        aria-label="Dispensar"
                        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-[var(--radius-sm)] text-[var(--color-success)] cursor-pointer transition-colors duration-[160ms] hover:bg-[var(--color-success-soft)]"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}

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
