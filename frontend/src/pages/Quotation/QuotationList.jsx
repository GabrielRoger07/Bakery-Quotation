import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import Modal from '@/components/Modal'
import MobileCardList from '@/components/MobileCardList'
import QuotationBottomSheet from '@/components/QuotationBottomSheet'
import StatusTabFilter from '@/components/StatusTabFilter'
import Alert from '@/components/Alert'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import Select from '@/components/Select'
import ListToolbar from '@/components/ListToolbar'
import PaginationSummary from '@/components/PaginationSummary'
import Toast from '@/components/Toast'
import { ENV } from '@/config/env'
import { formatDateTime } from '@/utils/formatDateTime'
import { getPaginationSummary } from '@/utils/paginationSummary'
import { CalendarRange, Clock, History } from 'lucide-react'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const { request: requestCounts } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const location = useLocation()

    const [savedNotice, setSavedNotice] = useState(location.state?.quotationSaved ?? null)

    // Limpa o state de navegação para o banner não reaparecer ao recarregar/voltar
    useEffect(() => {
        if (location.state?.quotationSaved) {
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, location.pathname, navigate])

    useEffect(() => {
        if (!savedNotice) return undefined

        const timeoutId = window.setTimeout(() => {
            setSavedNotice(null)
        }, 5000)

        return () => window.clearTimeout(timeoutId)
    }, [savedNotice])

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)
    const [initialLoad, setInitialLoad] = useState(true)

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetQuotation, setSheetQuotation] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [quotationToRemove, setQuotationToRemove] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [pageSize, setPageSize] = useState(0)

    const [sortField, setSortField] = useState("quotationEnd")
    const [sortDirection, setSortDirection] = useState("desc")

    const [statusFilter, setStatusFilter] = useState("")

    const closeModals = () => {
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
        const sortQuery = sortField ? `&sort=${sortField},${sortDirection}` : ""

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
    }, [request, requestCounts, sortField, sortDirection, statusFilter])

    const reloadCurrentPage = useCallback(() => fetchQuotations(currentPage), [fetchQuotations, currentPage])

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
        { key: "date-desc", label: "Mais recentes primeiro", shortLabel: "Recentes", field: "quotationEnd", direction: "desc", icon: <Clock size={18} strokeWidth={2} /> },
        { key: "date-asc", label: "Mais antigas primeiro", shortLabel: "Antigas", field: "quotationEnd", direction: "asc", icon: <History size={18} strokeWidth={2} /> },
    ], [])

    useEffect(() => {
        fetchQuotations(currentPage)
    }, [fetchQuotations, currentPage])

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: quotations.length,
    })

    const listEmpty = !loading && !initialLoad && quotations.length === 0

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

    const activeSortKey = sortOptions.find(opt => opt.field === sortField && opt.direction === sortDirection)?.key

    const desktopToolbar = useMemo(() => (
        <ListToolbar
            before={<StatusTabFilter value={statusFilter} onChange={handleStatusFilterChange} />}
            sort={(
                <Select
                    bare
                    className="w-[16rem] shrink-0"
                    value={activeSortKey}
                    onChange={e => {
                        const opt = sortOptions.find(o => o.key === e.target.value)
                        if (opt) setSort(opt.field, opt.direction)
                    }}
                    selectClassName="h-[2.5rem]"
                    options={sortOptions.map(opt => ({ value: opt.key, label: opt.label }))}
                />
            )}
            pageLabel={pageLabel}
            rangeLabel={rangeLabel}
            empty={listEmpty}
        />
    ), [statusFilter, activeSortKey, sortOptions, pageLabel, rangeLabel, listEmpty])

    return (
        <PageContainer variant="list">

            {savedNotice && (
                <Toast
                    variant="success"
                    message={savedNotice === 'edit'
                        ? 'Cotação atualizada com sucesso!'
                        : 'Cotação criada com sucesso!'}
                    onClose={() => setSavedNotice(null)}
                />
            )}

            {error && <Alert message={error} />}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            <div className="sm:hidden px-4 pt-4">
                <StatusTabFilter
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    mobile
                />
            </div>

            <MobileCardList
                title="Cotações"
                eyebrow="Compras"
                addLabel="Nova Cotação"
                items={quotations}
                idKey="quotationId"
                loading={loading || initialLoad}
                emptyMessage="Nenhuma cotação encontrada."
                onReload={reloadCurrentPage}
                onAdd={() => navigate('/quotations/new')}
                onCardClick={openSheet}
                renderCard={renderQuotationCard}
                desktopToolbar={desktopToolbar}
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

            <QuotationBottomSheet
                isOpen={sheetOpen}
                onClose={closeSheet}
                quotation={sheetQuotation}
                onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                onDelete={requestRemove}
                onMonitor={handleMonitor}
            />

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
