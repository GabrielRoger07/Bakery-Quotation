import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import { useListPage } from '@/hooks/useListPage'
import Modal from '@/components/ui/Modal'
import Table from '@/components/data-display/Table'
import MobileCardList from '@/components/data-display/MobileCardList'
import QuotationBottomSheet from '@/features/quotations/components/QuotationBottomSheet'
import QuotationDetails from '@/features/quotations/components/QuotationDetails'
import StatusTabFilter from '@/components/data-display/StatusTabFilter'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { ENV } from '@/config/env'
import { formatDateTime } from '@/utils/formatDateTime'
import { CalendarRange } from 'lucide-react'

const columns = [
    { key: "quotationId",             label: "ID" },
    { key: "quotationStartFormatted", label: "Data de Início" },
    { key: "quotationEndFormatted",   label: "Data de Fim" },
    { key: "status",                  label: "Status" },
]

const sortMap = {
    quotationId:             "id",
    quotationStartFormatted: "quotationStart",
    quotationEndFormatted:   "quotationEnd",
    status:                  null,
}

const QuotationList = () => {
    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()
    const {
        isMobile,
        items, setItems, error, setError, status, setStatus,
        currentPage, setCurrentPage, totalPages, setTotalPages,
        sortField, sortDirection,
        sheetOpen, selectedItem, openSheet, closeSheet,
        confirmOpen, itemToRemove, requestRemove,
        handleColumnSort: lpHandleColumnSort,
        closeModals,
    } = useListPage({ idKey: 'quotationId' })

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToView, setQuotationToView] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)
    const [statusFilter, setStatusFilter] = useState("")

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
                          : "Ativo",
                }
            })
            setItems(mapped)
            setTotalPages(res.data.totalPages)
            setError("")
        } else {
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, setItems, setTotalPages, setError, setStatus])

    useEffect(() => {
        fetchQuotations(currentPage)
    }, [fetchQuotations, currentPage])

    const handleColumnSort = (columnKey) => {
        if (!sortMap[columnKey]) return
        lpHandleColumnSort(columnKey)
    }

    const openDetailsModal = (quotation) => {
        setQuotationToView(quotation)
        setIsDetailsModalOpen(true)
    }

    const closeAllModals = () => {
        setQuotationToView(null)
        setIsDetailsModalOpen(false)
        setCannotDelete(false)
        closeModals()
    }

    const handleRequestRemove = (quotationId) => {
        const q = items.find(x => x.quotationId === quotationId)
        if (new Date(q.quotationStart) <= new Date()) {
            setCannotDelete(true)
            requestRemove(quotationId, [])
        } else {
            setCannotDelete(false)
            requestRemove(quotationId, items)
        }
    }

    const confirmRemove = async () => {
        if (!itemToRemove) return
        const res = await request("DELETE", `/quotations/${itemToRemove.quotationId}`)
        if (res.ok) {
            fetchQuotations()
            setError("")
        } else {
            setError("Erro ao remover cotação. Por favor tente novamente.")
        }
        closeAllModals()
    }

    const handleMonitor = (quotation) => {
        navigate(`/quotations/monitor?id=${quotation.quotationId}`)
    }

    const statusCounts = useMemo(() => {
        const counts = { "": items.length, agendado: 0, ativo: 0, fechado: 0 }
        for (const q of items) {
            const key = q.status.toLowerCase()
            if (key in counts) counts[key]++
        }
        return counts
    }, [items])

    const filteredQuotations = useMemo(() => {
        if (!statusFilter) return items
        return items.filter(q => q.status.toLowerCase() === statusFilter)
    }, [items, statusFilter])

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
            <div className="flex justify-center gap-3 mt-4">
                {error && <Alert message={error} />}
                {status === 0 && <Alert message="Erro Interno do Servidor" />}
            </div>

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
                        quotation={selectedItem}
                        onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                        onDelete={handleRequestRemove}
                        onMonitor={handleMonitor}
                    />
                </>
            ) : (
                <>
                    <Table
                        title="Cotações"
                        columns={columns}
                        data={filteredQuotations}
                        idKey="quotationId"
                        loading={loading}
                        onEdit={(q) => navigate(`/quotations/${q.quotationId}/edit`)}
                        onDelete={handleRequestRemove}
                        onAdd={() => navigate('/quotations/new')}
                        onReload={() => fetchQuotations(currentPage)}
                        onSort={handleColumnSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onView={openDetailsModal}
                        onMonitor={handleMonitor}
                        emptyMessage="Nenhuma cotação encontrada."
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

            <Modal isOpen={isDetailsModalOpen} onClose={closeAllModals} title="Detalhes da Cotação">
                <QuotationDetails quotation={quotationToView} />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeAllModals} title="Confirmar Remoção">
                {cannotDelete ? (
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-4">
                        Você não pode remover uma cotação que já começou.
                    </p>
                ) : (
                    <div>
                        <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                            Tem certeza de que você deseja remover a cotação <strong>{itemToRemove?.quotationId}</strong>?
                        </p>
                        <div className="flex justify-center gap-3 mt-4">
                            <Button onClick={closeAllModals}>Cancelar</Button>
                            <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default QuotationList
