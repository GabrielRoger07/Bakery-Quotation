import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import useWebSocket from '@/hooks/useWebSocket'
import useIsMobile from '@/hooks/useIsMobile'
import { useMobilePage } from '@/contexts/MobilePageContext'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Table from '@/components/Table'
import EmptyState from '@/components/EmptyState'
import MetaCard from '@/components/MetaCard'
import { ENV } from '@/config/env'
import { formatCnpj } from '@/utils/formatCnpj'
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
                        <button type="button" className="mf-input-clear" onClick={() => onSearchWord("")} aria-label="Limpar texto">
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

const MobileProductCard = ({ product }) => {
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
                        <span className={`qm-mobile-status-pill qm-product-lance-badge ${hasLance ? 'qm-status--active' : 'qm-status--closed'}`}>
                            {hasLance ? 'Com lance' : 'Sem lance'}
                        </span>
                    </div>
                </div>
                <div className={`qm-product-qty-badge`}>
                    <span className="qm-product-qty-label">Qtd</span>
                    <span className="qm-product-qty-value">{product.quantity}</span>
                </div>
            </div>

            {hasLance && (
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
                                    ? formatMoney(product.pricePerUnit)
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

const MobileBidCard = ({ bid, isLowest }) => {
    const createdAt = formatDateTime(bid.createdAt)

    return (
        <div className={`qm-bid-card ${isLowest ? 'qm-bid-card--winning' : 'qm-bid-card--losing'}`}>
            <div className="qm-bid-card-header">
                <div className="qm-bid-card-product">
                    <span className="qm-bid-product-name">{bid.productName}</span>
                    <div className="qm-bid-qty-row">
                        <span className="qm-bid-qty-label">Qtd</span>
                        <span className="qm-bid-qty-badge">{bid.quantity}</span>
                        {bid.bonus > 0 && (
                            <span className="qm-bid-bonus-badge">+{bid.bonus} bônus</span>
                        )}
                    </div>
                </div>
                <span className={`qm-bid-status-badge ${isLowest ? 'winning' : 'losing'}`}>
                    {isLowest ? 'Vencendo' : 'Superado'}
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

/* ── Suppliers panel (sheet mobile / Modal desktop) ─────────────── */
const SuppliersPanel = ({ suppliers, onClose, isMobile }) => {
    const withBid    = suppliers.filter(s => s.hasBid)
    const withoutBid = suppliers.filter(s => !s.hasBid)

    const row = (s, i) => (
        <div key={s.participationId} className="sqm-row" style={{ animationDelay: `${i * 35}ms` }}>
            <div className={`sqm-row-avatar ${s.hasBid ? 'sqm-row-avatar--active' : ''}`}>
                <Building2 size={15} strokeWidth={1.75} />
            </div>
            <div className="sqm-row-info">
                <span className="sqm-row-name">{s.supplierName}</span>
                {s.employerName && <span className="sqm-row-employer">{s.employerName}</span>}
            </div>
            <div className={`sqm-row-badge ${s.hasBid ? 'sqm-row-badge--active' : 'sqm-row-badge--pending'}`}>
                {s.hasBid
                    ? <><CheckCircle2 size={11} strokeWidth={2.5} />{s.bidCount} lance{s.bidCount !== 1 ? 's' : ''}</>
                    : <><MinusCircle size={11} strokeWidth={2} />Sem lance</>
                }
            </div>
        </div>
    )

    const body = (
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

    const [searchField, setSearchField] = useState("")
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

    const productColumns = useMemo(() => [
        {key: "productName", label: "Produto"},
        {key: "quantity", label: "Quantidade"},
        {key: "brand", label: "Marca"},
        {key: "lowestBid", label: "Menor Lance"},
        {key: "pricePerUnit", label: "Preço Unitário"},
        {key: "supplierName", label: "Fornecedor"},
        {key: "employerName", label: "Empresa"},
        {key: "employerCnpj", label: "CNPJ da Empresa"},
    ], [])

    const bidColumns = useMemo(() => [
        {key: "productName", label: "Produto"},
        {key: "quantity", label: "Quantidade"},
        {key: "supplierName", label: "Fornecedor"},
        {key: "employerName", label: "Empresa"},
        {key: "employerCnpj", label: "CNPJ da Empresa"},
        {key: "price", label: "Preço Total"},
        {key: "pricePerUnit", label: "Preço Unitário"},
        {key: "createdAt", label: "Data/Hora"},
        {key: "status", label: "Status"},
    ], [])

    const handleSearch = useCallback(() => {
        setAppliedSearch({ field: searchField, word: searchWord })
    }, [searchField, searchWord])

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
        const matchingProductIds = new Set(filteredProducts.map(p => p.productId))
        let result = bids.filter(b => matchingProductIds.has(b.productId))

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
    }, [bids, filteredProducts, appliedBidSearch, bidStatusFilter, lowestBids])

    const segBtnCls = (active) => [
        'px-3 py-[0.4rem] text-[0.875rem] font-medium font-sans border-none cursor-pointer whitespace-nowrap transition-[background-color,color] duration-[160ms] not-last:border-r not-last:border-[var(--color-border-default)]',
        active
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-surface-card)] text-[var(--color-text-neutral)] hover:bg-[var(--color-surface-subtle)]',
    ].join(' ')

    const filterToolbar = useMemo(() => (
        <>
            <div className="relative">
                <select value={searchField} onChange={e => setSearchField(e.target.value)} className="toolbar-select">
                    <option value="">Selecione</option>
                    <option value="productName">Nome do Produto</option>
                    <option value="supplierName">Nome do Fornecedor</option>
                    <option value="employerName">Nome da Empresa</option>
                    <option value="employerCnpj">CNPJ da Empresa</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={"Digite o campo"}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <div className="flex border border-[var(--color-border-default)] rounded-[var(--radius-md)] overflow-hidden">
                <button className={segBtnCls(bidFilter === "all")} onClick={() => setBidFilter("all")}>Todos</button>
                <button className={segBtnCls(bidFilter === "with")} onClick={() => setBidFilter("with")}>Com lance</button>
                <button className={segBtnCls(bidFilter === "without")} onClick={() => setBidFilter("without")}>Sem lance</button>
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
            {(appliedSearch.word || bidFilter !== "all") && (
                <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>
            )}
        </>
    ), [searchField, searchWord, appliedSearch, bidFilter, handleSearch, handleClearSearch])

    const bidFilterToolbar = useMemo(() => (
        <>
            <div className="relative">
                <select value={bidSearchField} onChange={e => setBidSearchField(e.target.value)} className="toolbar-select">
                    <option value="">Selecione</option>
                    <option value="productName">Nome do Produto</option>
                    <option value="supplierName">Nome do Fornecedor</option>
                    <option value="employerName">Nome da Empresa</option>
                    <option value="employerCnpj">CNPJ da Empresa</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={bidSearchWord}
                onChange={e => setBidSearchWord(e.target.value)}
                placeholder={"Digite o campo"}
                onKeyDown={e => { if (e.key === "Enter") handleBidSearch() }}
            />
            <Button onClick={handleBidSearch}>Buscar</Button>
            {appliedBidSearch.word && (
                <Button variant="danger" onClick={handleClearBidSearch}><X size={16} /></Button>
            )}
        </>
    ), [bidSearchField, bidSearchWord, appliedBidSearch, handleBidSearch, handleClearBidSearch])

    const formattedProducts = [...filteredProducts]
        .sort((a, b) => a.productName?.localeCompare(b.productName))
        .map(p => ({
        ...p,
        brand: p.brand || "-",
        lowestBid: p.lowestBid ? formatMoney(p.lowestBid) : "-",
        bonus: p.bonus ?? "-",
        pricePerUnit: p.pricePerUnit && p.pricePerUnit !== "-" ? formatMoney(p.pricePerUnit) : "-",
        supplierName: p.supplierName || "-",
        employerName: p.employerName || "-",
        employerCnpj: p.employerCnpj && p.employerCnpj !== "-" ? formatCnpj(p.employerCnpj) : "-"
    }))

    const formattedBids = filteredBids.map(b => {
        const lowest = lowestBids[b.productId]
        const isLowest = lowest && b.price === lowest.price

        return {
            ...b,
            price: formatMoney(b.price),
            pricePerUnit: formatMoney((b.price) / (b.quantity + b.bonus)),
            employerCnpj: b.employerCnpj ? formatCnpj(b.employerCnpj) : "-",
            createdAt: new Date(b.createdAt).toLocaleString(),
            status: isLowest
                ? <span className="text-[var(--color-success)] font-semibold">Vencendo</span>
                : <span className="text-[var(--color-danger)] font-semibold">Superado</span>
        }
    })

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
                extraChips={BID_PRESENCE_OPTIONS.map(opt => (
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
                {/* ── Sticky header (só quando há botão de exportar) ── */}
                {countdown.status === 'Closed' && (
                    <div className="qm-mobile-header justify-end">
                        <button
                            className="qm-mobile-export-btn"
                            onClick={handlePrintPdf}
                            aria-label="Exportar PDF"
                        >
                            <FileDown size={18} strokeWidth={2} />
                        </button>
                    </div>
                )}

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
                <div className="qm-stats-grid">
                    <div className="qm-stat-card qm-stat-card--total">
                        <div className="qm-stat-icon"><TrendingDown size={16} strokeWidth={2} /></div>
                        <div className="qm-stat-total-text">
                            <span className="qm-stat-label">Total estimado</span>
                            <span className="qm-stat-value">{formattedTotalEstimated}</span>
                        </div>
                    </div>
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

                {/* ── Produtos section ── */}
                <MobileSection
                    title="Produtos"
                    icon={<Package size={15} strokeWidth={2} />}
                    count={sortedFilteredProducts.length}
                    filterSlot={mobileProductFilter}
                    defaultOpen={true}
                >
                    {sortedFilteredProducts.length === 0 ? (
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
                                <MobileProductCard key={p.productId} product={p} />
                            ))}
                        </div>
                    )}
                </MobileSection>

                {/* ── Lances section ── */}
                <MobileSection
                    title="Lances"
                    icon={<Gavel size={15} strokeWidth={2} />}
                    count={filteredBids.length}
                    filterSlot={mobileBidFilter}
                    defaultOpen={false}
                >
                    {filteredBids.length === 0 ? (
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
                                return <MobileBidCard key={i} bid={b} isLowest={isLowest} />
                            })}
                        </div>
                    )}
                </MobileSection>

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

    /* ── Desktop layout (unchanged) ─────────────────────────────── */
    const quotationStartFormatted = formatDateTime(quotation.quotationStart)
    const quotationEndFormatted = formatDateTime(quotation.quotationEnd)

    return (
        <div className="page-wrapper text-[var(--color-text-body)]">
            {/* Header */}
            <div className={`grid items-center w-full mb-[1.125rem] ${countdown.status === 'Closed' ? 'grid-cols-[auto_1fr_auto] max-md:grid-cols-[auto_1fr_auto] max-md:grid-rows-[auto_auto] max-md:gap-x-2 max-md:gap-y-4' : 'grid-cols-[auto_1fr_auto]'}`}>
                <Button onClick={() => navigate(-1)}>Voltar</Button>
                <h2 className={`m-0 text-center text-[1.25rem] font-bold text-[var(--color-text-heading)] tracking-[-0.02em] max-md:text-[1.125rem] ${countdown.status === 'Closed' ? 'max-md:col-span-full max-md:row-start-2' : ''}`}>
                    Monitoramento Cotação #{quotation.quotationId}
                </h2>
                <div className="flex justify-end min-w-0">
                    {countdown.status === 'Closed' && (
                        <Button
                            onClick={handlePrintPdf}
                            variant="success"
                            className="flex items-center gap-[0.375rem] whitespace-nowrap [animation:exportAppear_0.3s_ease]"
                        >
                            <FileDown size={16} />
                            Exportar Relatório
                        </Button>
                    )}
                </div>
            </div>

            {/* Quotation info */}
            <div className="flex justify-center items-center gap-6 bg-[var(--color-surface-card)] border border-[var(--color-border-default)] [box-shadow:var(--shadow-xs)] px-[1.125rem] py-3 rounded-[var(--radius-lg)] mb-4 text-[0.875rem] text-[var(--color-text-neutral)] w-full max-md:flex-col max-md:items-start max-md:gap-[0.375rem]">
                <p className="m-0"><strong>Início:</strong> {quotationStartFormatted ? `${quotationStartFormatted.date} ${quotationStartFormatted.time}` : "-"}</p>
                <p className="m-0"><strong>Fim:</strong> {quotationEndFormatted ? `${quotationEndFormatted.date} ${quotationEndFormatted.time}` : "-"}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-6 gap-3 bg-[var(--color-surface-card)] w-full px-[1.125rem] py-[1.125rem] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] [box-shadow:var(--shadow-card-soft)] mb-[1.375rem] text-center max-[1080px]:grid-cols-3 max-md:grid-cols-2 max-[520px]:grid-cols-1">
                {[
                    { label: `Status: ${countdown.status === 'Active' ? "Ativo" : countdown.status === 'Scheduled' ? "Agendado" : "Fechado"}` },
                    ...(countdown.status === 'Active' || countdown.status === 'Scheduled' ? [{ label: `"Tempo Restante": ${countdown.timeRemaining}` }] : []),
                    { label: `Total de Lances: ${bids.length}` },
                    { label: `Fornecedores: ${uniqueSuppliers}`, clickable: true },
                    { label: `Produtos com lances: ${productsWithBidsCount}/${products.length}` },
                    { label: `Total: ${formattedTotalEstimated}`, highlight: true },
                ].map((item, i) => (
                    <div
                        key={i}
                        onClick={item.clickable ? () => setShowSuppliersPanel(true) : undefined}
                        className={`rounded-[var(--radius-lg)] border px-2 py-[0.875rem] text-[1rem] font-semibold flex items-center justify-center text-center min-h-[4.5rem] transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)] ${item.highlight ? 'bg-[var(--color-highlight-lighter)] border-[var(--color-highlight-border)] text-[var(--color-accent)] font-bold text-[1.125rem]' : 'bg-[var(--color-surface-subtle)] border-[var(--color-border-faint)] text-[var(--color-text-neutral)]'} ${item.clickable ? 'cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-highlight-lighter)] hover:text-[var(--color-accent)]' : ''}`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Tables */}
            <div className="flex flex-col items-center w-full gap-1">
                <Table
                    title={"Produtos"}
                    columns={productColumns}
                    data={formattedProducts}
                    loading={false}
                    emptyMessage={"Nenhum produto encontrado para essa cotação."}
                    toolbar={filterToolbar}
                    filterActive={appliedSearch.word !== "" || bidFilter !== "all"}
                />

                <Table
                    title={"Lances"}
                    columns={bidColumns}
                    data={formattedBids}
                    loading={false}
                    emptyMessage={"Nenhum lance encontrado para essa cotação."}
                    toolbar={bidFilterToolbar}
                    filterActive={appliedBidSearch.word !== ""}
                />
            </div>

            {showSuppliersPanel && (
                <SuppliersPanel
                    suppliers={suppliersWithBidStatus}
                    onClose={() => setShowSuppliersPanel(false)}
                    isMobile={false}
                />
            )}
        </div>
    )
}

export default QuotationMonitor
