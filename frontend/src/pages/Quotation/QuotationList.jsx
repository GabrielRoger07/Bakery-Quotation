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
import PaginationSummary from '@/components/PaginationSummary'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import { ENV } from '@/config/env'
import { formatDateTime } from '@/utils/formatDateTime'
import { getPaginationSummary } from '@/utils/paginationSummary'
import useIsMobile from '@/hooks/useIsMobile'
import { useMobilePage } from '@/contexts/MobilePageContext'
import { CalendarRange, CheckCircle, Clock, CloudOff, History, RotateCw, X } from 'lucide-react'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const { request: requestCounts } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const location = useLocation()
    const isMobile = useIsMobile()
    const { registerPage, unregisterPage } = useMobilePage()

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
    const [initialLoad, setInitialLoad] = useState(true)

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToView, setQuotationToView] = useState(null)

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetQuotation, setSheetQuotation] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [quotationToRemove, setQuotationToRemove] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [pageSize, setPageSize] = useState(0)

    const [sortField, setSortField] = useState("quotationEndFormatted")
    const [sortDirection, setSortDirection] = useState("desc")

    const [statusFilter, setStatusFilter] = useState("")

    const columns = useMemo(() => [
        { key: "quotationId", label: "ID" },
        { key: "quotationStartFormatted", label: "Data de Início" },
        { key: "quotationEndFormatted", label: "Data de Fim" },
        { key: "status", label: "Status" }
    ], [])

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

        const statusQuery = statusFilter ? `&field=status&value=${statusFilter}` : ""

        const res = await request("GET", `/quotations/company?page=${page}${sortQuery}${statusQuery}`)
        if (res.ok) {
            const mapped = await Promise.all(res.data.content.map(async (q) => {
                const start = formatDateTime(q.quotationStart)
                const end = formatDateTime(q.quotationEnd)
                const [productsRes, suppliersRes] = await Promise.all([
                    requestCounts("GET", `/contains/${q.quotationId}`),
                    requestCounts("GET", `/participations/quotations/${q.quotationId}`),
                ])
                return {
                    ...q,
                    quotationStartFormatted: start ? `${start.date} • ${start.time}` : "-",
                    quotationEndFormatted: end ? `${end.date} • ${end.time}` : "-",
                    status: new Date(q.quotationStart) > new Date() ? "Agendado"
                          : new Date(q.quotationEnd) < new Date() ? "Fechado"
                          : "Ativo",
                    productCount: productsRes.ok ? productsRes.data.length : 0,
                    supplierCount: suppliersRes.ok ? suppliersRes.data.length : 0,
                }
            }))
            setQuotations(mapped)
            setTotalPages(res.data.totalPages)
            setTotalElements(res.data.totalElements)
            setPageSize(res.data.size)
            setError("")
        } else {
            setError(res.data?.message)
        }
        setStatus(res.status)
        setInitialLoad(false)
    }, [request, requestCounts, sortField, sortDirection, sortMap, statusFilter])

    const reloadCurrentPage = useCallback(() => fetchQuotations(currentPage), [fetchQuotations, currentPage])

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

    const setSort = (field, direction) => {
        setSortField(field)
        setSortDirection(direction)
        setCurrentPage(0)
    }

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value)
        setCurrentPage(0)
    }

    const sortOptions = useMemo(() => [
        { key: "date-desc", label: "Mais recentes primeiro", shortLabel: "Recentes", field: "quotationEndFormatted", direction: "desc", icon: <Clock size={18} strokeWidth={2} /> },
        { key: "date-asc", label: "Mais antigas primeiro", shortLabel: "Antigas", field: "quotationEndFormatted", direction: "asc", icon: <History size={18} strokeWidth={2} /> },
    ], [])

    useEffect(() => {
        fetchQuotations(currentPage)
    }, [fetchQuotations, currentPage])

    // Mantém o título/reload do header mobile registrados mesmo quando o
    // MobileCardList é desmontado (ex.: card de erro no lugar da lista).
    useEffect(() => {
        if (!isMobile) return
        registerPage("Cotações", reloadCurrentPage)
        return () => unregisterPage()
    }, [isMobile, registerPage, unregisterPage, reloadCurrentPage])

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: quotations.length,
        emptyLabel: "Nenhuma cotação encontrada",
        loading: loading || initialLoad,
    })

    const renderQuotationCard = (quotation) => {
        const statusVariant =
            quotation.status === 'Ativo' ? 'success' :
            quotation.status === 'Agendado' ? 'accent' : ''
        const startDate = formatDateTime(quotation.quotationStart)?.date
        return {
            avatar: <CalendarRange size={13} strokeWidth={1.75} />,
            title: `Cotação · ${startDate ?? '-'}`,
            subtitle: [`Início: ${quotation.quotationStartFormatted}`, `Fim: ${quotation.quotationEndFormatted}`],
            meta: `${quotation.productCount} itens · ${quotation.supplierCount} fornecedores`,
            titleTag: { label: quotation.status, variant: statusVariant },
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

            {error && !(isMobile && quotations.length === 0) && <Alert message={error} />}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <>
                    <div className="px-4 pt-4">
                        <StatusTabFilter
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            mobile
                        />
                    </div>
                    {error && quotations.length === 0 ? (
                        <div className="px-4 pt-6">
                            <EmptyState
                                tone="danger"
                                icon={<CloudOff size={28} strokeWidth={1.75} />}
                                title="Não foi possível carregar"
                                description="Verifique sua conexão e tente novamente."
                                action={
                                    <Button onClick={() => fetchQuotations(currentPage)}>
                                        <span className="inline-flex items-center gap-2">
                                            <RotateCw size={16} strokeWidth={2} /> Tentar novamente
                                        </span>
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <MobileCardList
                            title="Cotações"
                            items={quotations}
                            idKey="quotationId"
                            loading={loading || initialLoad}
                            emptyMessage="Nenhuma cotação encontrada."
                            onReload={reloadCurrentPage}
                            onAdd={() => navigate('/quotations/new')}
                            onCardClick={openSheet}
                            renderCard={renderQuotationCard}
                            showCount={false}
                            inlineToolbar={<PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />}
                            sortOptions={sortOptions}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSelectSort={(opt) => setSort(opt.field, opt.direction)}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
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
                        data={quotations}
                        idKey="quotationId"
                        loading={loading || initialLoad}
                        onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                        onDelete={requestRemove}
                        onAdd={() => navigate('/quotations/new')}
                        onReload={reloadCurrentPage}
                        onSort={handleColumnSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onView={openDetailsModal}
                        onMonitor={handleMonitor}
                        emptyMessage={"Nenhuma cotação encontrada."}
                        filterSlot={
                            <StatusTabFilter
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                            />
                        }
                    />
                    <div className="flex items-center justify-between gap-2 px-1">
                        <PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
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
                    confirmVariant="danger"
                >
                    Tem certeza de que você deseja remover a cotação <strong>{quotationToRemove?.quotationId}</strong>?
                </ConfirmDialog>
            )}
        </PageContainer>
    )
}

export default QuotationList
