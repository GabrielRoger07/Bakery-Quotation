import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarRange, Clock, CloudOff, History, RotateCw } from 'lucide-react'
import useResourceList from '@/hooks/useResourceList'
import MobileCardList from '@/components/MobileCardList'
import StatusTabFilter from '@/components/StatusTabFilter'
import PageContainer from '@/components/PageContainer'
import ListToolbar from '@/components/ListToolbar'
import Select from '@/components/Select'
import PaginationSummary from '@/components/PaginationSummary'
import EmptyState from '@/components/EmptyState'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { formatDateTime } from '@/utils/formatDateTime'
import { getPaginationSummary } from '@/utils/paginationSummary'

const getStatusKey = (start, end) => {
    const now = new Date()
    if (now < new Date(start)) return 'agendado'
    if (now > new Date(end)) return 'fechado'
    return 'ativo'
}

const labelMap = { agendado: 'Agendado', ativo: 'Ativo', fechado: 'Fechado' }

const STATUS_TAG = {
    agendado: { variant: 'accent' },
    ativo:    { variant: 'success' },
    fechado:  { variant: '' },
}

const sortOptions = [
    { key: 'date-desc', label: 'Mais recentes primeiro', shortLabel: 'Recentes', field: 'quotation.quotationEnd', direction: 'desc', icon: <Clock size={18} strokeWidth={2} /> },
    { key: 'date-asc', label: 'Mais antigas primeiro', shortLabel: 'Antigas', field: 'quotation.quotationEnd', direction: 'asc', icon: <History size={18} strokeWidth={2} /> },
]

const SupplierPage = () => {
    const navigate = useNavigate()

    const {
        items, loading, error, status,
        currentPage, setCurrentPage, totalPages, totalElements, pageSize,
        sortField, sortDirection, setSort, refetch,
        appliedSearch, applySearch, clearSearch,
    } = useResourceList({
        endpoint: '/participations/supplier',
        idKey: 'quotationId',
        defaultSortField: 'quotation.quotationEnd',
        defaultSortDirection: 'desc',
    })

    const statusFilter = appliedSearch.field === 'status' ? appliedSearch.word : ''
    const handleStatusFilterChange = (value) => value ? applySearch('status', value) : clearSearch()

    const reloadCurrentPage = useCallback(() => refetch(currentPage), [refetch, currentPage])

    const handleSelect = (p) =>
        navigate(`/supplier/quotation?quotationId=${p.quotationId}&participationId=${p.participationId}`)

    const displayItems = useMemo(() => items.map((p) => {
        const start = formatDateTime(p.quotationStart)
        const end = formatDateTime(p.quotationEnd)
        return {
            ...p,
            'quotation.quotationStart': start ? `${start.date} • ${start.time}` : '-',
            'quotation.quotationEnd': end ? `${end.date} • ${end.time}` : '-',
            status: labelMap[getStatusKey(p.quotationStart, p.quotationEnd)],
        }
    }), [items])

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: items.length,
    })

    const listEmpty = !loading && items.length === 0

    const renderCard = (p) => {
        const { variant } = STATUS_TAG[getStatusKey(p.quotationStart, p.quotationEnd)]
        const startDate = formatDateTime(p.quotationStart)?.date
        return {
            avatar: <CalendarRange size={13} strokeWidth={1.75} />,
            title: `Cotação · ${startDate ?? '-'}`,
            subtitle: [`Início: ${p['quotation.quotationStart']}`, `Fim: ${p['quotation.quotationEnd']}`],
            titleTag: { label: p.status, variant },
        }
    }

    const currentSortField = sortField ?? 'quotation.quotationEnd'
    const activeSortKey = sortOptions.find(opt => opt.field === currentSortField && opt.direction === sortDirection)?.key

    const desktopToolbar = (
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
    )

    return (
        <PageContainer variant="list">
            {error && items.length > 0 && <Alert message={error} />}
            {status === 0 && <Alert message={'Erro Interno do Servidor'} />}

            <div className="sm:hidden px-4 pt-4">
                <StatusTabFilter value={statusFilter} onChange={handleStatusFilterChange} mobile />
            </div>

            {error && items.length === 0 ? (
                <div className="px-4 pt-6">
                    <EmptyState
                        tone="danger"
                        icon={<CloudOff size={28} strokeWidth={1.75} />}
                        title="Não foi possível carregar"
                        description="Verifique sua conexão e tente novamente."
                        action={
                            <Button onClick={reloadCurrentPage}>
                                <span className="inline-flex items-center gap-2">
                                    <RotateCw size={16} strokeWidth={2} /> Tentar novamente
                                </span>
                            </Button>
                        }
                    />
                </div>
            ) : (
                <MobileCardList
                    title="Suas Cotações"
                    eyebrow="Portal do Fornecedor"
                    items={displayItems}
                    idKey="quotationId"
                    loading={loading}
                    emptyMessage="Nenhuma cotação encontrada."
                    onReload={reloadCurrentPage}
                    onCardClick={handleSelect}
                    renderCard={renderCard}
                    desktopToolbar={desktopToolbar}
                    showCount={false}
                    inlineToolbar={<PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />}
                    sortOptions={sortOptions}
                    sortField={currentSortField}
                    sortDirection={sortDirection}
                    onSelectSort={(opt) => setSort(opt.field, opt.direction)}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </PageContainer>
    )
}

export default SupplierPage
