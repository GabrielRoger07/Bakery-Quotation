import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import useWebSocket from '@/hooks/useWebSocket'
import useIsMobile from '@/hooks/useIsMobile'
import { useMobilePage } from '@/contexts/MobilePageContext'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import MetaCard from '@/components/MetaCard'
import MobileSearchInput from '@/components/MobileSearchInput'
import SectionHeader from '@/components/SectionHeader'
import { ENV } from '@/config/env'
import { formatMoney } from '@/utils/formatMoney'
import { formatDateTime } from '@/utils/formatDateTime'
import { X, FileDown, Package, Gavel, TrendingDown, Users, User, Clock, Activity, ChevronDown, ChevronRight, CheckCircle2, MinusCircle, Building2, SearchX, RotateCw, Flag, Calendar } from 'lucide-react'
import Cookies from 'js-cookie'


/* ── Mobile sub-components ─────────────────────────────────────── */

const BID_FILTER_OPTIONS = [
    { value: "supplierName", label: "Fornecedor" },
    { value: "employerName", label: "Empresa" },
    { value: "employerCnpj", label: "CNPJ" },
]

const BID_PRESENCE_OPTIONS = [
    { value: "all",     label: "Todos" },
    { value: "with",    label: "Com lance" },
    { value: "without", label: "Sem lance" },
]

const BID_STATUS_OPTIONS = [
    { value: "all",     label: "Todos" },
    { value: "winning", label: "Vencendo" },
    { value: "losing",  label: "Superado" },
]

const MobileFilterPanel = ({
    filterOptions = [],
    selectedField, onSelectField,
    searchWord, onSearchWord,
    onSearch,
    appliedWord,
    onClear,
    extraChips,
    extraChipsLabel = "Situação",
    fieldLabel,
}) => {
    const resolvedFieldLabel = fieldLabel ?? filterOptions.find(o => o.value === selectedField)?.label

    return (
        <div className="mf-root">
            {extraChips && (
                <>
                    <p className="mf-label">{extraChipsLabel}</p>
                    <div className="mf-chips">{extraChips}</div>
                </>
            )}
            {filterOptions.length > 0 && (
                <>
                    <p className="mf-label" style={{ marginTop: '0.25rem' }}>Filtrar por</p>
                    <div className="mf-chips">
                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`mf-chip ${selectedField === opt.value ? 'selected' : ''}`}
                                onClick={() => onSelectField(prev => prev === opt.value ? "" : opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
            <div className="mf-input-row">
                <div className="mf-input-wrap">
                    <svg className="mf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        className="mf-input"
                        value={searchWord}
                        onChange={e => onSearchWord(e.target.value)}
                        placeholder={selectedField ? `Buscar por ${resolvedFieldLabel ?? '...'}` : "Selecione um campo acima"}
                        onKeyDown={e => { if (e.key === "Enter") onSearch() }}
                        disabled={!selectedField}
                    />
                    {searchWord && (
                        <button type="button" className="mf-input-clear" onClick={onClear} aria-label="Limpar texto">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        </button>
                    )}
                </div>
                <button type="button" className="mf-search-btn" onClick={onSearch} disabled={!selectedField}>
                    Buscar
                </button>
            </div>
            {appliedWord && (
                <div className="mf-active-row">
                    <span className="mf-active-pill">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        {resolvedFieldLabel}: <strong>{appliedWord}</strong>
                    </span>
                    <button type="button" className="mf-clear-btn" onClick={onClear}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        Limpar
                    </button>
                </div>
            )}
        </div>
    )
}

const MobileProductCard = ({ product, isScheduled }) => {
    const hasLance = product.lowestBid !== null && product.lowestBid !== "-"
    return (
        <div className="qm-product-card">
            <div className="qm-product-card-header">
                <div className="qm-product-avatar">
                    <Package size={18} strokeWidth={1.75} />
                </div>
                <div className="qm-product-info">
                    <span className="qm-product-name">{product.productName}</span>
                    <div className="qm-product-brand-row">
                        <span className={`qm-product-brand ${!product.brand || product.brand === "-" ? 'qm-product-brand--empty' : ''}`}>
                            {product.brand && product.brand !== "-" ? product.brand : "Sem marca"}
                        </span>
                        {!isScheduled && (
                            <span className={`qm-mobile-status-pill qm-product-lance-badge ${hasLance ? 'qm-status--active' : 'qm-status--closed'}`}>
                                {hasLance ? 'Com lance' : 'Sem lance'}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`qm-product-qty-badge`}>
                    <span className="qm-product-qty-label">Qtd</span>
                    <span className="qm-product-qty-value">
                        {product.quantity}
                        <span className="qm-product-qty-unit">
                            {' '}{product.unitOfMeasure.toUpperCase()}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 'S' : ''}
                        </span>
                    </span>
                </div>
            </div>

            {hasLance && !isScheduled && (
                <div className="qm-product-bid-section">
                    <div className="qm-product-bid-row">
                        <div className="qm-bid-metric">
                            <span className="qm-bid-metric-label">Menor Lance</span>
                            <span className="qm-bid-metric-value">
                                {formatMoney(product.lowestBid)}
                            </span>
                        </div>
                        <div className="qm-bid-metric">
                            <span className="qm-bid-metric-label">Preço Unitário</span>
                            <span className="qm-bid-metric-value">
                                {product.pricePerUnit && product.pricePerUnit !== "-"
                                    ? `${formatMoney(product.pricePerUnit)}/${product.unitOfMeasure}`
                                    : "-"}
                            </span>
                        </div>
                    </div>
                    <div className="qm-product-supplier-row">
                        <User size={13} strokeWidth={2} className="qm-bid-supplier-icon" />
                        <span className="qm-product-supplier-name">{product.supplierName}</span>
                        {product.employerName !== "-" && (
                            <span className="qm-product-employer-name">{product.employerName}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const MobileBidCard = ({ bid, isLowest, unitOfMeasure, isClosed }) => {
    const createdAt = formatDateTime(bid.createdAt)

    return (
        <div className={`qm-bid-card ${isLowest ? 'qm-bid-card--winning' : 'qm-bid-card--losing'}`}>
            <div className="qm-bid-card-header">
                <div className="qm-bid-card-product">
                    <span className="qm-bid-product-name">{bid.productName}</span>
                    <div className="qm-bid-qty-row">
                        <span className="qm-bid-qty-label">Qtd</span>
                        <span className="qm-bid-qty-badge">
                            {bid.quantity}
                            {unitOfMeasure && (
                                <span className="qm-bid-qty-unit">
                                    {' '}{unitOfMeasure.toUpperCase()}{['bag', 'balde'].includes(unitOfMeasure) && bid.quantity > 1 ? 'S' : ''}
                                </span>
                            )}
                        </span>
                        {bid.bonus > 0 && (
                            <span className="qm-bid-bonus-badge">+{bid.bonus} bônus</span>
                        )}
                    </div>
                </div>
                <span className={`qm-bid-status-badge ${isLowest ? 'winning' : 'losing'}`}>
                    {isLowest ? (isClosed ? 'Vencedor' : 'Vencendo') : 'Superado'}
                </span>
            </div>
            <div className="qm-bid-prices-row">
                <div className="qm-bid-price-metric">
                    <span className="qm-bid-price-label">Total</span>
                    <span className="qm-bid-price-value">
                        {formatMoney(bid.price)}
                    </span>
                </div>
                <div className="qm-bid-price-metric">
                    <span className="qm-bid-price-label">Unitário</span>
                    <span className="qm-bid-price-value">
                        {formatMoney(bid.price / (bid.quantity + bid.bonus))}
                        {unitOfMeasure ? `/${unitOfMeasure}` : ''}
                    </span>
                </div>
            </div>
            <div className="qm-bid-supplier-row">
                <User size={13} strokeWidth={2} className="qm-bid-supplier-icon" />
                <span className="qm-bid-supplier-name">{bid.supplierName}</span>
                {bid.employerName && <span className="qm-bid-employer">{bid.employerName}</span>}
            </div>
            <div className="qm-bid-timestamp">
                <Clock size={12} strokeWidth={2} />
                <span>{createdAt ? `${createdAt.date} • ${createdAt.time}` : "-"}</span>
            </div>
        </div>
    )
}

const MobileSection = ({ title, icon, count, children, filterSlot, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="qm-section">
            <button
                className="qm-section-header"
                onClick={() => setOpen(p => !p)}
                type="button"
            >
                <div className="qm-section-header-left">
                    <span className="qm-section-icon">{icon}</span>
                    <span className="qm-section-title">{title}</span>
                    <span className="qm-section-count">{count}</span>
                </div>
                <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className="qm-section-chevron"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>

            {open && (
                <div className="qm-section-body">
                    {filterSlot && (
                        <div className="qm-section-filter-bar">{filterSlot}</div>
                    )}
                    {children}
                </div>
            )}
        </div>
    )
}

/* ── Suppliers list (grouped by bid status) ─────────────────────── */
const SuppliersList = ({ suppliers, plain = false }) => {
    const withBid    = suppliers.filter(s => s.hasBid)
    const withoutBid = suppliers.filter(s => !s.hasBid)

    const row = (s, i) => (
        <div key={s.participationId} className="sqm-row" style={{ animationDelay: `${i * 35}ms` }}>
            <div className={`sqm-row-avatar ${!plain && s.hasBid ? 'sqm-row-avatar--active' : ''}`}>
                <Building2 size={15} strokeWidth={1.75} />
            </div>
            <div className="sqm-row-info">
                <span className="sqm-row-name">{s.supplierName}</span>
                {s.employerName && <span className="sqm-row-employer">{s.employerName}</span>}
            </div>
            {!plain && (
                <div className={`sqm-row-badge ${s.hasBid ? 'sqm-row-badge--active' : 'sqm-row-badge--pending'}`}>
                    {s.hasBid
                        ? <><CheckCircle2 size={11} strokeWidth={2.5} />{s.bidCount} lance{s.bidCount !== 1 ? 's' : ''}</>
                        : <><MinusCircle size={11} strokeWidth={2} />Sem lance</>
                    }
                </div>
            )}
        </div>
    )

    if (plain) {
        return (
            <>
                {suppliers.map((s, i) => row(s, i))}
                {suppliers.length === 0 && (
                    <div className="qm-empty" style={{ padding: '2rem 1rem' }}>Nenhum fornecedor participando.</div>
                )}
            </>
        )
    }

    return (
        <>
            {withBid.length > 0 && (
                <div className="sqm-group">
                    <div className="sqm-group-header sqm-group-header--active">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                        <span>Com lance</span>
                        <span className="sqm-group-count">{withBid.length}</span>
                    </div>
                    {withBid.map((s, i) => row(s, i))}
                </div>
            )}
            {withoutBid.length > 0 && (
                <div className="sqm-group">
                    <div className="sqm-group-header sqm-group-header--pending">
                        <MinusCircle size={13} strokeWidth={2} />
                        <span>Sem lance</span>
                        <span className="sqm-group-count">{withoutBid.length}</span>
                    </div>
                    {withoutBid.map((s, i) => row(s, withBid.length + i))}
                </div>
            )}
            {suppliers.length === 0 && (
                <div className="qm-empty" style={{ padding: '2rem 1rem' }}>Nenhum fornecedor participando.</div>
            )}
        </>
    )
}

/* ── Suppliers panel (sheet mobile / Modal desktop) ─────────────── */
const SuppliersPanel = ({ suppliers, onClose, isMobile }) => {
    const body = <SuppliersList suppliers={suppliers} />

    if (!isMobile) return (
        <Modal isOpen onClose={onClose} title={`Fornecedores (${suppliers.length})`}>
            {body}
        </Modal>
    )

    return (
        <>
            <div className="sqm-backdrop" onClick={onClose} />
            <div className="sqm-sheet">
                <div className="sqm-sheet-handle" />
                <div className="sqm-sheet-header">
                    <div className="sqm-sheet-title-row">
                        <Users size={16} strokeWidth={2} />
                        <span className="sqm-sheet-title">Fornecedores</span>
                        <span className="sqm-sheet-count">{suppliers.length}</span>
                    </div>
                    <button className="sqm-close-btn" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="sqm-body">{body}</div>
            </div>
        </>
    )
}

/* ── Main component ─────────────────────────────────────────────── */

const QuotationMonitor = () => {

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('id')

    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()
    const { registerPage, unregisterPage } = useMobilePage()

    const [quotation, setQuotation] = useState(null)
    const [baseProducts, setBaseProducts] = useState([])
    const [bids, setBids] = useState([])
    const [dataLoading, setDataLoading] = useState(true)

    const [, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState({ field: "", word: "" })
    const [bidFilter, setBidFilter] = useState("all")

    const [bidSearchField, setBidSearchField] = useState("supplierName")
    const [bidSearchWord, setBidSearchWord] = useState("")
    const [appliedBidSearch, setAppliedBidSearch] = useState({ field: "", word: "" })
    const [bidStatusFilter, setBidStatusFilter] = useState("all")

    const [participations, setParticipations] = useState([])
    const [showSuppliersPanel, setShowSuppliersPanel] = useState(false)
    const [countdown, setCountdown] = useState({ status: '', timeRemaining: '' })

    const statusLabel = countdown.status === 'Active' ? 'Ativo'
        : countdown.status === 'Scheduled' ? 'Agendado'
        : 'Fechado'

    const statusCls = countdown.status === 'Active' ? 'qm-status--active'
        : countdown.status === 'Scheduled' ? 'qm-status--scheduled'
        : 'qm-status--closed'

    useEffect(() => {
        if (!quotation) return
        registerPage(`Cotação #${quotation.quotationId}`, null, {
            leftAction: { icon: X, onClick: () => navigate(-1), ariaLabel: "Fechar" },
            rightSlot: <span className={`qm-mobile-status-pill ${statusCls}`}>{statusLabel}</span>,
        })
        return () => unregisterPage()
    }, [quotation, registerPage, unregisterPage, navigate, statusCls, statusLabel])

    useEffect(() => {
        const fetchQuotationData = async () => {
            const quotationRes = await request("GET", `/quotations/${quotationId}`)
            if(quotationRes.ok) setQuotation(quotationRes.data)

            const participationRes = await request("GET", `/participations/quotations/${quotationId}`)
            if(participationRes.ok) setParticipations(participationRes.data)

            const containsRes = await request("GET", `/contains/${quotationId}`)
            if(containsRes.ok) setBaseProducts(containsRes.data)

            const bidsRes = await request("GET", `/bids/quotations/${quotationId}`)
            if(bidsRes.ok) setBids(bidsRes.data)

            setDataLoading(false)
        }

        fetchQuotationData()
    }, [quotationId, request])

    const formatTime = (ms) => {
        const days = Math.floor(ms / 86400000)
        const hours = Math.floor(ms % 86400000 / 3600000)
        const mins = Math.floor((ms % 3600000) / 60000)
        const secs = Math.floor((ms % 60000) / 1000)
        return days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`
    }

    useEffect(() => {
        if(!quotation) return

        const start = new Date(quotation.quotationStart)
        const end = new Date(quotation.quotationEnd)

        const updateCountdown = () => {
            const now = new Date()
            if(now < start){
                setCountdown({ status: 'Scheduled', timeRemaining: formatTime(start - now) })
            }else if(now >= start && now <= end){
                setCountdown({ status: 'Active', timeRemaining: formatTime(end - now) })
            }else{
                setCountdown({ status: 'Closed', timeRemaining: 'Closed' })
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [quotation])

    const lowestBids = useMemo(() => {
        const map = {}
        for(const bid of bids){
            const pricePerUnit = bid.price / (bid.quantity + bid.bonus)
            if(!map[bid.productId] || pricePerUnit < map[bid.productId].pricePerUnit){
                map[bid.productId] = {
                    price: bid.price,
                    bonus: bid.bonus,
                    supplierName: bid.supplierName,
                    employerName: bid.employerName,
                    employerCnpj: bid.employerCnpj,
                    pricePerUnit
                }
            }
        }
        return map
    }, [bids])

    const uniqueSuppliers = participations.length

    const suppliersWithBidStatus = useMemo(() => {
        const supplierIdsWithBids = new Set(bids.map(b => b.participationId))
        return participations.map(p => ({
            ...p,
            hasBid: supplierIdsWithBids.has(p.participationId),
            bidCount: bids.filter(b => b.participationId === p.participationId).length,
        }))
    }, [participations, bids])

    const unitByProductId = useMemo(() => {
        const map = {}
        for (const p of baseProducts) map[p.productId] = p.unitOfMeasure
        return map
    }, [baseProducts])

    const products = useMemo(() => baseProducts.map(p => {
        const lowest = lowestBids[p.productId]
        return lowest ? {
            ...p,
            lowestBid: lowest.price,
            bonus: lowest.bonus,
            pricePerUnit: lowest.pricePerUnit,
            supplierName: lowest.supplierName || "-",
            employerName: lowest.employerName || "-",
            employerCnpj: lowest.employerCnpj || "-"
        } : {
            ...p,
            lowestBid: null,
            bonus: "-",
            pricePerUnit: "-",
            supplierName: "-",
            employerName: "-",
            employerCnpj: "-"
        }
    }), [baseProducts, lowestBids])

    const handleNewBid = useCallback(bid => {
        setBids(prev => [bid, ...prev])
    }, [])

    useWebSocket(quotationId, handleNewBid)

    const handleProductNameSearch = useCallback(() => {
        setAppliedSearch({ field: "productName", word: searchWord })
    }, [searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchField("")
        setSearchWord("")
        setAppliedSearch({ field: "", word: "" })
        setBidFilter("all")
    }, [])

    const filteredProducts = useMemo(() => {
        let result = products

        if (appliedSearch.word) {
            const term = appliedSearch.word.toLowerCase()
            if (!appliedSearch.field || appliedSearch.field === "productName") {
                result = result.filter(p => p.productName?.toLowerCase().includes(term))
            } else {
                const matchingProductIds = new Set(
                    bids
                        .filter(b => b[appliedSearch.field]?.toString().toLowerCase().includes(term))
                        .map(b => b.productId)
                )
                result = result.filter(p => matchingProductIds.has(p.productId))
            }
        }

        if (bidFilter === "with") {
            const productIdsWithBids = new Set(bids.map(b => b.productId))
            result = result.filter(p => productIdsWithBids.has(p.productId))
        } else if (bidFilter === "without") {
            const productIdsWithBids = new Set(bids.map(b => b.productId))
            result = result.filter(p => !productIdsWithBids.has(p.productId))
        }

        return result
    }, [products, bids, appliedSearch, bidFilter])

    const handleBidSearch = useCallback(() => {
        setAppliedBidSearch({ field: bidSearchField, word: bidSearchWord })
    }, [bidSearchField, bidSearchWord])

    const handleClearBidSearch = useCallback(() => {
        setBidSearchField("supplierName")
        setBidSearchWord("")
        setAppliedBidSearch({ field: "", word: "" })
        setBidStatusFilter("all")
    }, [])

    const filteredBids = useMemo(() => {
        let result = bids

        if (appliedBidSearch.word) {
            const term = appliedBidSearch.word.toLowerCase()
            const field = appliedBidSearch.field
            if (!field || field === "productName") {
                result = result.filter(b => b.productName?.toLowerCase().includes(term))
            } else {
                result = result.filter(b => b[field]?.toString().toLowerCase().includes(term))
            }
        }

        if (bidStatusFilter !== "all") {
            result = result.filter(b => {
                const lowest = lowestBids[b.productId]
                const isLowest = lowest && b.price === lowest.price
                return bidStatusFilter === "winning" ? isLowest : !isLowest
            })
        }

        return result
    }, [bids, appliedBidSearch, bidStatusFilter, lowestBids])

    const totalEstimated = products.reduce((sum, p) => {
        if(!p.lowestBid || p.lowestBid === "-") return sum
        return sum + p.lowestBid
    }, 0)

    const formattedTotalEstimated = formatMoney(totalEstimated)

    const productsWithBidsCount = useMemo(() => new Set(bids.map(b => b.productId)).size, [bids])

    const handlePrintPdf = useCallback(async () => {
        const token = Cookies.get('accessToken')
        const response = await fetch(`${ENV.API_BASE_URL}/quotations/${quotationId}/report`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) return
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cotacao-${quotationId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }, [quotationId])

    const sortedFilteredProducts = useMemo(() =>
        [...filteredProducts].sort((a, b) => a.productName?.localeCompare(b.productName))
    , [filteredProducts])

    if(!quotation) return <p>Carregando...</p>

    /* ── Mobile layout ────────────────────────────────────────────── */
    if (isMobile) {
        const quotationStartFormatted = formatDateTime(quotation.quotationStart)
        const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

        const hasActiveProductFilter = appliedSearch.word !== "" || bidFilter !== "all"
        const hasActiveBidFilter = appliedBidSearch.word !== "" || bidStatusFilter !== "all"

        const mobileProductFilter = (
            <MobileFilterPanel
                selectedField="productName"
                fieldLabel="Nome do produto"
                searchWord={searchWord}
                onSearchWord={setSearchWord}
                onSearch={handleProductNameSearch}
                appliedWord={appliedSearch.word}
                onClear={handleClearSearch}
                extraChipsLabel="Lance"
                extraChips={countdown.status === 'Scheduled' ? undefined : BID_PRESENCE_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`mf-chip ${bidFilter === opt.value ? 'selected' : ''}`}
                        onClick={() => setBidFilter(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            />
        )

        const mobileBidFilter = (
            <MobileFilterPanel
                filterOptions={BID_FILTER_OPTIONS}
                selectedField={bidSearchField}
                onSelectField={setBidSearchField}
                searchWord={bidSearchWord}
                onSearchWord={setBidSearchWord}
                onSearch={handleBidSearch}
                appliedWord={appliedBidSearch.word}
                onClear={handleClearBidSearch}
                extraChips={BID_STATUS_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`mf-chip ${bidStatusFilter === opt.value ? 'selected' : ''}`}
                        onClick={() => setBidStatusFilter(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            />
        )

        return (
            <div className="qm-mobile-root">

                {/* ── Countdown banner ── */}
                {countdown.status !== 'Closed' && (
                    <div className={`qm-countdown-banner ${statusCls}`}>
                        <Clock size={22} strokeWidth={2} className="qm-countdown-icon" />
                        <div className="qm-countdown-text">
                            <span className="qm-countdown-label">{countdown.status === 'Active' ? 'Encerra em' : 'Começa em'}</span>
                            <span className="qm-countdown-time">{countdown.timeRemaining}</span>
                        </div>
                    </div>
                )}

                {/* ── Dates info ── */}
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

                {/* ── Stats grid ── */}
                {countdown.status !== 'Scheduled' && (
                    <div className="qm-stats-grid">
                        <div className="qm-stat-card qm-stat-card--total">
                            <div className="qm-stat-icon"><TrendingDown size={16} strokeWidth={2} /></div>
                            <div className="qm-stat-total-text">
                                <span className="qm-stat-label">{countdown.status === 'Closed' ? 'Valor Total' : 'Total estimado'}</span>
                                <span className="qm-stat-value">{formattedTotalEstimated}</span>
                            </div>
                        </div>
                        {countdown.status === 'Closed' && (
                            <button
                                type="button"
                                className="qm-download-pdf-btn"
                                onClick={handlePrintPdf}
                            >
                                <FileDown size={18} strokeWidth={2} />
                                Baixar lista de compras (PDF)
                            </button>
                        )}
                        <div className="qm-stat-card">
                            <div className="qm-stat-icon"><Activity size={16} strokeWidth={2} /></div>
                            <span className="qm-stat-value">{bids.length}</span>
                            <span className="qm-stat-label">Lances</span>
                        </div>
                        <button className="qm-stat-card qm-stat-card--clickable" onClick={() => setShowSuppliersPanel(true)}>
                            <div className="qm-stat-card-top">
                                <div className="qm-stat-icon"><Users size={16} strokeWidth={2} /></div>
                                <ChevronRight size={14} strokeWidth={2.5} className="qm-stat-chevron" />
                            </div>
                            <span className="qm-stat-value">{uniqueSuppliers}</span>
                            <span className="qm-stat-label">Fornecedores</span>
                        </button>
                        <div className="qm-stat-card">
                            <div className="qm-stat-icon"><Package size={16} strokeWidth={2} /></div>
                            <span className="qm-stat-value">{productsWithBidsCount}<span className="qm-stat-value-denom">/{products.length}</span></span>
                            <span className="qm-stat-label">Produtos c/ lance</span>
                        </div>
                    </div>
                )}

                {/* ── Produtos section ── */}
                <MobileSection
                    title="Produtos"
                    icon={<Package size={15} strokeWidth={2} />}
                    count={sortedFilteredProducts.length}
                    filterSlot={mobileProductFilter}
                    defaultOpen={true}
                >
                    {dataLoading ? (
                        <div className="qm-empty">Carregando produtos...</div>
                    ) : sortedFilteredProducts.length === 0 ? (
                        hasActiveProductFilter ? (
                            <EmptyState
                                icon={<SearchX size={28} strokeWidth={1.75} />}
                                title="Nenhum produto encontrado"
                                description="Ajuste a situação ou tente outro termo de busca."
                                action={
                                    <button type="button" className="qm-empty-clear-btn" onClick={handleClearSearch}>
                                        <RotateCw size={14} strokeWidth={2} />
                                        Limpar filtros
                                    </button>
                                }
                            />
                        ) : (
                            <div className="qm-empty">Nenhum produto encontrado.</div>
                        )
                    ) : (
                        <div className="qm-cards-list">
                            {sortedFilteredProducts.map(p => (
                                <MobileProductCard key={p.productId} product={p} isScheduled={countdown.status === 'Scheduled'} />
                            ))}
                        </div>
                    )}
                </MobileSection>

                {/* ── Lances section ── */}
                {countdown.status !== 'Scheduled' && (
                    <MobileSection
                        title="Lances"
                        icon={<Gavel size={15} strokeWidth={2} />}
                        count={filteredBids.length}
                        filterSlot={mobileBidFilter}
                        defaultOpen={false}
                    >
                        {dataLoading ? (
                            <div className="qm-empty">Carregando lances...</div>
                        ) : filteredBids.length === 0 ? (
                            hasActiveBidFilter ? (
                                <EmptyState
                                    icon={<SearchX size={28} strokeWidth={1.75} />}
                                    title="Nenhum lance encontrado"
                                    description="Ajuste a situação ou tente outro termo de busca."
                                    action={
                                        <button type="button" className="qm-empty-clear-btn" onClick={handleClearBidSearch}>
                                            <RotateCw size={14} strokeWidth={2} />
                                            Limpar filtros
                                        </button>
                                    }
                                />
                            ) : (
                                <div className="qm-empty">Nenhum lance registrado.</div>
                            )
                        ) : (
                            <div className="qm-cards-list">
                                {filteredBids.map((b, i) => {
                                    const lowest = lowestBids[b.productId]
                                    const isLowest = lowest && b.price === lowest.price
                                    return <MobileBidCard key={i} bid={b} isLowest={isLowest} unitOfMeasure={unitByProductId[b.productId]} isClosed={countdown.status === 'Closed'} />
                                })}
                            </div>
                        )}
                    </MobileSection>
                )}

                {/* bottom safe-area padding */}
                <div style={{ height: 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)' }} />

                {showSuppliersPanel && (
                    <SuppliersPanel
                        suppliers={suppliersWithBidStatus}
                        onClose={() => setShowSuppliersPanel(false)}
                        isMobile={true}
                    />
                )}
            </div>
        )
    }

    /* ── Desktop layout ─────────────────────────────────────────── */
    const quotationStartFormatted = formatDateTime(quotation.quotationStart)
    const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

    const isClosed = countdown.status === 'Closed'
    const isActive = countdown.status === 'Active'
    const isScheduled = countdown.status === 'Scheduled'
    const hasActiveProductFilter = appliedSearch.word !== "" || bidFilter !== "all"

    const sectionCardCls = "bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-2xl)] [box-shadow:var(--shadow-card-soft)] p-5"

    return (
        <div className="text-[var(--color-text-body)]">

            {/* ── Header (padrão QuotationForm) ── */}
            <header className="sticky top-0 z-[100] flex items-center gap-4 px-6 h-[4.5rem] bg-[var(--color-surface-card)] border-b border-[var(--color-border-default)] flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] flex-shrink-0"
                    aria-label="Fechar"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>

                <div className="w-px h-8 bg-[var(--color-border-default)] flex-shrink-0" />

                <div className="min-w-0">
                    <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                        Monitoramento
                    </span>
                    <div className="flex items-center gap-2.5">
                        <h1 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)] leading-tight truncate">
                            Cotação #{quotation.quotationId}
                        </h1>
                        <span className={`qm-mobile-status-pill ${statusCls}`}>{statusLabel}</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Flag size={14} strokeWidth={2} className="text-[var(--color-success)]" />
                        Início · {quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)]">
                        <Calendar size={14} strokeWidth={2} className="text-[var(--color-danger)]" />
                        Fim · {quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"}
                    </span>
                    {isClosed && (
                        <>
                            <div className="w-px h-8 bg-[var(--color-border-default)]" />
                            <Button onClick={handlePrintPdf} className="flex items-center gap-2 whitespace-nowrap">
                                <FileDown size={16} strokeWidth={2} />
                                Lista de compras
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {/* ── Countdown banner (igual ao mobile) ── */}
            {!isClosed && (
                <div className={`qm-countdown-banner ${statusCls}`}>
                    <Clock size={22} strokeWidth={2} className="qm-countdown-icon" />
                    <div className="qm-countdown-text">
                        <span className="qm-countdown-label">{isActive ? 'Encerra em' : 'Começa em'}</span>
                        <span className="qm-countdown-time">{countdown.timeRemaining}</span>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-6 py-6">

            {/* ── Stats ── */}
            {!isScheduled && (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    <div className="flex items-center gap-3 bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-xs)] px-4 py-[0.8125rem]">
                        <div className="w-11 h-11 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white flex items-center justify-center">
                            <TrendingDown size={20} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-caption font-semibold uppercase tracking-[0.03em] text-[var(--color-accent)]">
                                {isClosed ? 'Valor Total' : 'Total estimado'}
                            </span>
                            <span className="block text-[1.5rem] font-extrabold leading-[1.2] text-[var(--color-text-heading)] [font-variant-numeric:tabular-nums] tracking-[-0.02em]">
                                {formattedTotalEstimated}
                            </span>
                        </div>
                    </div>
                    <MetaCard tone="muted" icon={<Gavel size={16} strokeWidth={2} />} label="Lances" value={bids.length} />
                    <MetaCard tone="muted" icon={<Users size={16} strokeWidth={2} />} label="Fornecedores" value={uniqueSuppliers} />
                    <MetaCard tone="muted" icon={<Package size={16} strokeWidth={2} />} label="Produtos com lance" value={`${productsWithBidsCount}/${products.length}`} />
                </div>
            )}

            {/* ── Main grid ── */}
            <div className="grid gap-5 items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                {/* Produtos */}
                <div className={sectionCardCls}>
                    <SectionHeader icon={<Package size={15} strokeWidth={2} />} label="Produtos" count={sortedFilteredProducts.length} />
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <MobileSearchInput
                            dense
                            value={searchWord}
                            onChange={e => { setSearchWord(e.target.value); setAppliedSearch({ field: "productName", word: e.target.value }) }}
                            onSearch={() => setAppliedSearch({ field: "productName", word: searchWord })}
                            onClear={handleClearSearch}
                            placeholder="Buscar produto"
                            ariaLabel="Buscar produto"
                        />
                        {!isScheduled && (
                            <div className="flex items-center gap-2">
                                {BID_PRESENCE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`mf-chip ${bidFilter === opt.value ? 'selected' : ''}`}
                                        onClick={() => setBidFilter(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {dataLoading ? (
                        <div className="qm-empty">Carregando produtos...</div>
                    ) : sortedFilteredProducts.length === 0 ? (
                        hasActiveProductFilter ? (
                            <EmptyState
                                icon={<SearchX size={28} strokeWidth={1.75} />}
                                title="Nenhum produto encontrado"
                                description="Ajuste a situação ou tente outro termo de busca."
                                action={
                                    <Button variant="secondary" onClick={handleClearSearch} className="flex items-center gap-1.5">
                                        <RotateCw size={14} strokeWidth={2} />
                                        Limpar filtros
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="qm-empty">Nenhum produto encontrado.</div>
                        )
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sortedFilteredProducts.map(p => (
                                <MobileProductCard key={p.productId} product={p} isScheduled={isScheduled} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Fornecedores + Lances */}
                <div className="flex flex-col gap-5">
                    <div className={sectionCardCls}>
                        <SectionHeader icon={<Users size={15} strokeWidth={2} />} label="Fornecedores" count={suppliersWithBidStatus.length} />
                        <SuppliersList suppliers={suppliersWithBidStatus} plain={isScheduled} />
                    </div>

                    {!isScheduled && (
                        <div className={sectionCardCls}>
                            <SectionHeader icon={<Gavel size={15} strokeWidth={2} />} label="Lances" count={filteredBids.length} />
                            <div className="mb-4">
                                <MobileFilterPanel
                                    filterOptions={BID_FILTER_OPTIONS}
                                    selectedField={bidSearchField}
                                    onSelectField={setBidSearchField}
                                    searchWord={bidSearchWord}
                                    onSearchWord={setBidSearchWord}
                                    onSearch={handleBidSearch}
                                    appliedWord={appliedBidSearch.word}
                                    onClear={handleClearBidSearch}
                                    extraChips={BID_STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`mf-chip ${bidStatusFilter === opt.value ? 'selected' : ''}`}
                                            onClick={() => setBidStatusFilter(opt.value)}
                                        >
                                            {opt.value === 'winning' && isClosed ? 'Vencedor' : opt.label}
                                        </button>
                                    ))}
                                />
                            </div>
                            {dataLoading ? (
                                <div className="qm-empty">Carregando lances...</div>
                            ) : filteredBids.length === 0 ? (
                                (appliedBidSearch.word !== "" || bidStatusFilter !== "all") ? (
                                    <EmptyState
                                        icon={<SearchX size={28} strokeWidth={1.75} />}
                                        title="Nenhum lance encontrado"
                                        description="Ajuste a situação para ver outros lances."
                                        action={
                                            <Button variant="secondary" onClick={handleClearBidSearch} className="flex items-center gap-1.5">
                                                <RotateCw size={14} strokeWidth={2} />
                                                Limpar filtros
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="qm-empty">Nenhum lance registrado.</div>
                                )
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredBids.map((b, i) => {
                                        const lowest = lowestBids[b.productId]
                                        const isLowest = lowest && b.price === lowest.price
                                        return <MobileBidCard key={i} bid={b} isLowest={isLowest} unitOfMeasure={unitByProductId[b.productId]} isClosed={isClosed} />
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    )
}

export default QuotationMonitor
