import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import useFetch from "@/hooks/useFetch"
import useIsMobile from "@/hooks/useIsMobile"
import { ENV } from "@/config/env"
import Button from "@/components/ui/Button"
import { formatMoney } from "@/utils/formatMoney"
import Cookies from "js-cookie"
import { ChevronLeft, FileDown, Package, Trophy, TrendingDown, CheckCircle2, XCircle } from "lucide-react"

const thCls = "text-left px-[0.6rem] py-2 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)] border-b-2 border-[var(--color-border)]"
const thNumCls = `${thCls} text-right`
const tdCls = "px-[0.6rem] py-[0.55rem] text-[var(--color-text-default)] border-b border-[var(--color-border-lighter)] align-middle"
const tdNumCls = `${tdCls} text-right whitespace-nowrap`

/* ── Mobile sub-components ──────────────────────────────────────── */

const MobileWinningCard = ({ item, index }) => (
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
                <span className="sqc-win-brand">{item.brand || "Marca não definida"}</span>
            </div>
            <div className="sqc-win-qty-badge">
                <span className="sqc-win-qty-label">Qtd</span>
                <span className="sqc-win-qty-value">{item.quantity} UN</span>
            </div>
        </div>
        <div className="sqc-win-prices">
            <div className="sqc-win-price-metric">
                <span className="sqc-win-price-label">Preço Unitário</span>
                <span className="sqc-win-price-value">{formatMoney(item.pricePerUnit)}</span>
            </div>
            <div className="sqc-win-price-metric sqc-win-price-metric--total">
                <span className="sqc-win-price-label">Valor Total</span>
                <span className="sqc-win-price-value sqc-win-price-value--total">{formatMoney(item.price)}</span>
            </div>
        </div>
        {item.bonus > 0 && (
            <div className="sqc-win-bonus-row">
                <span className="sqc-win-bonus-pill">+{item.bonus} bônus</span>
            </div>
        )}
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
                brand: product?.brand || null,
                price: bid.price,
                quantity: bid.quantity,
                bonus: bid.bonus,
                pricePerUnit
            }
        })
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
                    <button className="qm-mobile-export-btn" onClick={handleDownloadReport} aria-label="Exportar relatório">
                        <FileDown size={18} strokeWidth={2} />
                    </button>
                </div>

                {/* Dates row */}
                <div className="qm-dates-row">
                    <div className="qm-date-item">
                        <span className="qm-date-label">Início</span>
                        <span className="qm-date-value">{new Date(quotation.quotationStart).toLocaleString()}</span>
                    </div>
                    <div className="qm-date-divider" />
                    <div className="qm-date-item">
                        <span className="qm-date-label">Fim</span>
                        <span className="qm-date-value">{new Date(quotation.quotationEnd).toLocaleString()}</span>
                    </div>
                </div>

                {/* Result summary stat cards */}
                <div className="qm-stats-grid">
                    {didWin ? (
                        <div className="qm-stat-card qm-stat-card--total">
                            <div className="qm-stat-icon"><TrendingDown size={16} strokeWidth={2} /></div>
                            <span className="qm-stat-value">{formatMoney(totalWinningValue)}</span>
                            <span className="qm-stat-label">Valor Total</span>
                        </div>
                    ) : (
                        <div className="sqc-no-win-banner">
                            <XCircle size={20} strokeWidth={1.75} />
                            <span>Você não venceu nenhum lance nesta cotação.</span>
                        </div>
                    )}
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
                                <span className="qm-section-count" style={{ background: 'var(--color-success-soft-bg-2)', color: 'var(--color-success-strong)', borderColor: 'var(--color-success-soft-border)' }}>
                                    {winningItems.length}
                                </span>
                            </div>
                        </div>
                        <div className="qm-section-body">
                            <div className="qm-cards-list">
                                {winningItems.map((item, i) => (
                                    <MobileWinningCard key={i} item={item} index={i} />
                                ))}
                            </div>
                            {/* Total footer */}
                            <div className="sqc-total-footer">
                                <span className="sqc-total-label">Valor Total dos Lances Vencedores</span>
                                <span className="sqc-total-value">{formatMoney(totalWinningValue)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ height: 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)' }} />
            </div>
        )
    }

    /* ── Desktop layout ──────────────────────────────────────────── */
    if (loading) return <p>Carregando...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="page-wrapper text-[var(--color-text-primary)]">
            <h2 className="text-[var(--color-text-strong)] text-[1.25rem] m-0">
                Cotação {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotation.quotationId}
            </h2>
            <h3 className="text-[var(--color-text-secondary)] mt-1 mb-4">Fechado</h3>

            <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-0)] border border-[var(--color-border)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.4rem]">
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-strong)]">Início:</strong>{" "}
                    {new Date(quotation.quotationStart).toLocaleString()}
                </p>
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-strong)]">Fim:</strong>{" "}
                    {new Date(quotation.quotationEnd).toLocaleString()}
                </p>
            </div>

            <div className="flex flex-col items-center flex-grow justify-center pb-60 w-full">
                {winningItems.length === 0 ? (
                    <p className="text-[var(--color-text-secondary)]">Você não venceu nenhum lance</p>
                ) : (
                    <div className="w-full bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] p-4">
                        <h4 className="m-0 mb-3 text-[var(--color-text-strong)]">Lances Vencedores</h4>
                        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                            <table className="w-full border-collapse text-[0.875rem]">
                                <thead>
                                    <tr>
                                        <th className={thCls}>Produto</th>
                                        <th className={thCls}>Marca</th>
                                        <th className={thNumCls}>Quantidade</th>
                                        <th className={thNumCls}>Preço Unitário</th>
                                        <th className={thNumCls}>Preço Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winningItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className={tdCls}>{item.productName}</td>
                                            <td className={tdCls}>
                                                {item.brand ? item.brand : <span className="text-[var(--color-text-muted)] italic">-</span>}
                                            </td>
                                            <td className={tdNumCls}>{item.quantity} UN</td>
                                            <td className={tdNumCls}>{formatMoney(item.pricePerUnit)}/UN</td>
                                            <td className={`${tdNumCls} font-medium text-[var(--color-text-strong)]`}>{formatMoney(item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border)]">Valor Total</td>
                                        <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border)]">{formatMoney(totalWinningValue)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <Button onClick={handleDownloadReport}>
                        Exportar Relatório
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SupplierQuotationClosed
