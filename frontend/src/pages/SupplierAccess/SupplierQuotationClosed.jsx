import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import useFetch from "@/hooks/useFetch"
import useIsMobile from "@/hooks/useIsMobile"
import { ENV } from "@/config/env"
import Button from "@/components/Button"
import MetaCard from "@/components/MetaCard"
import EmptyState from "@/components/EmptyState"
import BidResultTable from "@/components/BidResultTable"
import { formatMoney } from "@/utils/formatMoney"
import { formatDateTime } from "@/utils/formatDateTime"
import { PLURAL_UNITS } from "@/utils/formatQuantity"
import Cookies from "js-cookie"
import { ChevronLeft, FileDown, Lock, Package, TrendingDown, CheckCircle2, XCircle, Flag, Calendar } from "lucide-react"

/* ── Sub-components (mobile) ────────────────────────────────────── */

const WinningCard = ({ item, index }) => (
    <div
        className="sqc-win-card"
        style={{ animationDelay: `${index * 60}ms` }}
    >
        <div className="sqc-win-card-header">
            <div className="sqc-win-avatar">
                <Package size={17} strokeWidth={1.75} />
            </div>
            <div className="sqc-win-info">
                <span className="sqc-win-name">{item.productName}</span>
                <span className={`sqc-win-brand ${!item.brand ? 'sqc-win-brand--empty' : ''}`}>{item.brand || "Marca não definida"}</span>
                <div className="qm-bid-qty-row">
                    <span className="qm-bid-qty-label">Qtd</span>
                    <span className="qm-bid-qty-badge">
                        {item.quantity}
                        {item.unitOfMeasure && (
                            <span className="qm-bid-qty-unit">
                                {' '}{item.unitOfMeasure.toUpperCase()}{PLURAL_UNITS.includes(item.unitOfMeasure) && item.quantity > 1 ? 'S' : ''}
                            </span>
                        )}
                    </span>
                    {item.bonus > 0 && (
                        <span className="qm-bid-bonus-badge">+{item.bonus} bônus</span>
                    )}
                </div>
            </div>
        </div>
        <div className="sqc-win-prices">
            <div className="sqc-win-price-metric">
                <span className="sqc-win-price-label">Unitário</span>
                <span className="sqc-win-price-value">{formatMoney(item.pricePerUnit)}/{item.unitOfMeasure}</span>
            </div>
            <div className="sqc-win-price-metric sqc-win-price-metric--total">
                <span className="sqc-win-price-label">Total</span>
                <span className="sqc-win-price-value sqc-win-price-value--total">{formatMoney(item.price)}</span>
            </div>
        </div>
    </div>
)

/* ── Main component ──────────────────────────────────────────────── */

const SupplierQuotationClosed = ({ quotation, participationId }) => {

    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

    const [products, setProducts] = useState([])
    const [lowestBids, setLowestBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchFinalResults = async () => {
            setLoading(true)

            const resProducts = await request("GET", `/contains/${quotation.quotationId}`)
            if(!resProducts.ok) {
                setError("Falha em carregar produtos")
                setLoading(false)
                return
            }

            const productsData = resProducts.data
            setProducts(productsData)

            const bidsMap = {}

            for(const product of productsData){
                const bidRes = await request("GET", `/bids/lowest?quotationId=${quotation.quotationId}&productId=${product.productId}`)

                if(bidRes.ok && bidRes.data){
                    bidsMap[product.productId] = bidRes.data
                }
            }

            setLowestBids(bidsMap)
            setLoading(false)
        }

        fetchFinalResults()
    }, [quotation.quotationId, request])

    const winningItems = useMemo(() => {
        return Object.entries(lowestBids)
        .filter(([, bid]) => bid && bid.participationId === participationId)
        .map(([productId, bid]) => {
            const product = products.find(p => p.productId === Number(productId))
            const pricePerUnit = bid.price / (bid.quantity + bid.bonus)

            return {
                productName: product?.productName ?? "-",
                productDescription: product?.productDescription || null,
                brand: product?.brand || null,
                price: bid.price,
                quantity: bid.quantity,
                bonus: bid.bonus,
                pricePerUnit,
                unitOfMeasure: product?.unitOfMeasure || null
            }
        })
        .sort((a, b) => a.productName?.localeCompare(b.productName))
    }, [lowestBids, products, participationId])

    const totalWinningValue = winningItems.reduce((sum, item) => sum + item.price, 0)

    const handleDownloadReport = useCallback(async () => {
        const token = Cookies.get('supplierAccessToken')
        const response = await fetch(`${ENV.API_BASE_URL}/participations/${participationId}/report`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) return
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lances-${participationId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }, [participationId])

    /* ── Mobile layout ──────────────────────────────────────────── */
    if (isMobile) {
        const quotationStartFormatted = quotation ? formatDateTime(quotation.quotationStart) : null
        const quotationEndFormatted = quotation ? formatDateTime(quotation.quotationEnd) : null

        if (loading) return (
            <div className="qm-mobile-root">
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotation.quotationId}</span>
                        <span className="qm-mobile-status-pill qm-status--closed">Fechado</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>
                <div className="sqc-loading-state">
                    <div className="sqc-loading-spinner" />
                    <span className="sqc-loading-text">Carregando resultados...</span>
                </div>
            </div>
        )

        if (error) return (
            <div className="qm-mobile-root">
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotation.quotationId}</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>
                <div className="empty-state" style={{ margin: '2rem 1rem' }}>
                    <div className="empty-icon"><XCircle size={22} strokeWidth={1.5} /></div>
                    <p>{error}</p>
                </div>
            </div>
        )

        const didWin = winningItems.length > 0

        return (
            <div className="qm-mobile-root">
                {/* Sticky header */}
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotation.quotationId}</span>
                        <span className="qm-mobile-status-pill qm-status--closed">Fechado</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>

                {/* Dates info */}
                <div className="grid grid-cols-2 gap-2 mx-4 mt-3">
                    <MetaCard
                        tone="success"
                        icon={<Flag size={16} strokeWidth={2} />}
                        label="Início"
                        value={quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"}
                    />
                    <MetaCard
                        tone="danger"
                        icon={<Calendar size={16} strokeWidth={2} />}
                        label="Fim"
                        value={quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"}
                    />
                </div>

                {/* Result summary stat cards */}
                <div className="qm-stats-grid">
                    {didWin ? (
                        <div className="qm-stat-card qm-stat-card--total">
                            <div className="qm-stat-icon"><TrendingDown size={16} strokeWidth={2} /></div>
                            <div className="qm-stat-total-text">
                                <span className="qm-stat-label">Valor Total</span>
                                <span className="qm-stat-value">{formatMoney(totalWinningValue)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sqc-no-win-banner">
                            <XCircle size={20} strokeWidth={1.75} />
                            <span>Você não venceu nenhum lance nesta cotação.</span>
                        </div>
                    )}
                    <button
                        type="button"
                        className="qm-download-pdf-btn"
                        onClick={handleDownloadReport}
                    >
                        <FileDown size={18} strokeWidth={2} />
                        Baixar relatório (PDF)
                    </button>
                </div>

                {/* Winning items section */}
                {didWin && (
                    <div className="qm-section" style={{ animationDelay: '0.15s' }}>
                        <div className="qm-section-header" style={{ cursor: 'default' }}>
                            <div className="qm-section-header-left">
                                <span className="qm-section-icon" style={{ color: 'var(--color-success-strong)' }}>
                                    <CheckCircle2 size={15} strokeWidth={2} />
                                </span>
                                <span className="qm-section-title">Lances Vencedores</span>
                                <span className="qm-section-count" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success-strong)', borderColor: 'var(--color-success-soft-border)' }}>
                                    {winningItems.length}
                                </span>
                            </div>
                        </div>
                        <div className="qm-section-body">
                            <div className="qm-cards-list">
                                {winningItems.map((item, i) => (
                                    <WinningCard key={i} item={item} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ height: 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)' }} />
            </div>
        )
    }

    /* ── Desktop layout ──────────────────────────────────────────── */
    const quotationStartFormatted = formatDateTime(quotation.quotationStart)
    const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

    const startText = quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"
    const endText = quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"

    const didWin = winningItems.length > 0

    const productsLabel = `${winningItems.length} de ${products.length} produto${products.length === 1 ? '' : 's'}`

    return (
        <div className="text-[var(--color-text-body)]">

            {/* ── Header (padrão QuotationMonitor, abaixo da SupplierNavbar) ── */}
            <header className="sticky top-[3.375rem] z-[100] flex items-center gap-4 px-6 h-[4.5rem] bg-[var(--color-surface-card)] border-b border-[var(--color-border-default)] flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] flex-shrink-0"
                    aria-label="Voltar"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                <div className="w-px h-8 bg-[var(--color-border-default)] flex-shrink-0" />

                <div className="min-w-0">
                    <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                        {quotation.isAuction ? "Leilão reverso" : "Cotação única"}
                    </span>
                    <div className="flex items-center gap-2.5">
                        <h1 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)] leading-tight truncate">
                            Cotação #{quotation.quotationId}
                        </h1>
                        <span className="qm-mobile-status-pill qm-status--closed inline-flex items-center gap-1">
                            Fechado
                        </span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Flag size={14} strokeWidth={2} className="text-[var(--color-success)]" />
                        Início · {startText}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Calendar size={14} strokeWidth={2} className="text-[var(--color-danger)]" />
                        Fim · {endText}
                    </span>
                </div>
            </header>

            <div className="px-6 py-6">
                {loading ? (
                    <div className="sqc-loading-state">
                        <div className="sqc-loading-spinner" />
                        <span className="sqc-loading-text">Carregando resultados...</span>
                    </div>
                ) : error ? (
                    <EmptyState
                        className="max-w-[34rem] mx-auto"
                        tone="danger"
                        icon={<XCircle size={28} strokeWidth={1.75} />}
                        title="Não foi possível carregar os resultados"
                        description={error}
                    />
                ) : !didWin ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[18rem] flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] border border-[var(--color-border-default)] text-body font-medium text-[var(--color-text-muted)]">
                            <XCircle size={20} strokeWidth={1.75} className="shrink-0" />
                            <span>Você não venceu nenhum lance nesta cotação.</span>
                        </div>
                        <Button onClick={handleDownloadReport} className="flex items-center gap-2 whitespace-nowrap">
                            <FileDown size={16} strokeWidth={2} />
                            Baixar relatório (PDF)
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* ── Cabeçalho da seção + ação ── */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <CheckCircle2 size={22} strokeWidth={2} className="text-[var(--color-success)] shrink-0" />
                            <h2 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)]">
                                Lances vencedores
                            </h2>
                            <span className="inline-flex items-center rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-lighter)] px-2.5 py-1 text-caption font-semibold text-[var(--color-success-strong)] whitespace-nowrap">
                                {productsLabel}
                            </span>
                            <Button onClick={handleDownloadReport} className="ml-auto flex items-center gap-2 whitespace-nowrap">
                                <FileDown size={16} strokeWidth={2} />
                                Baixar relatório (PDF)
                            </Button>
                        </div>

                        <BidResultTable items={winningItems} totalValue={totalWinningValue} />
                    </>
                )}
            </div>
        </div>
    )
}

export default SupplierQuotationClosed
