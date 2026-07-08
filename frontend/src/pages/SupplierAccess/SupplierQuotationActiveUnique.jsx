import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import { formatMoney } from '@/utils/formatMoney'
import { formatDateTime } from '@/utils/formatDateTime'
import { useCurrencyMask } from '@/hooks/useCurrencyMask'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import MetaCard from '@/components/MetaCard'
import SingleProposalProductRow from '@/pages/SupplierAccess/SingleProposalProductRow'
import { ENV } from '@/config/env'
import {
    ChevronLeft, Clock, Package, Tag, CheckCircle2,
    AlertCircle, Send, FileCheck2, X, MinusCircle, Hourglass, Info, Flag, Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DRAFT_KEY_PREFIX = "draft_prices_"

const UNIT_LABEL = {
    L:     ['o', 'litro'],
    KG:    ['o', 'quilo'],
    FD:    ['o', 'fardo'],
    PCT:   ['o', 'pacote'],
    balde: ['o', 'balde'],
    CX:    ['a', 'caixa'],
    UND:   ['a', 'unidade'],
    bag:   ['a', 'bag'],
}

const unitLabel = (u) => {
    const [article, name] = UNIT_LABEL[u] ?? ['o', u]
    return (
        <span>
            Preço d{article} <span className="font-bold text-[var(--color-accent)]">{name}</span>
        </span>
    )
}

const thCls = "text-left px-[0.6rem] py-2 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)] border-b-2 border-[var(--color-border-default)]"
const thNumCls = `${thCls} text-right`
const tdCls = "px-[0.6rem] py-[0.55rem] text-[var(--color-text-body)] border-b border-[var(--color-border-faint)] align-middle"
const tdNumCls = `${tdCls} text-right whitespace-nowrap`

/* ── Mobile sub-components ──────────────────────────────────────── */

const MobileProductInputCard = ({ product, initialNumericValue, onNumericChange, index }) => {
    const { value, handleChange, getNumericValue, setValue } = useCurrencyMask()
    const hasPrice = getNumericValue() > 0

    useEffect(() => {
        if (initialNumericValue > 0) {
            setValue(formatMoney(initialNumericValue))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        onNumericChange(product.productId, getNumericValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div
            className={`saqu-input-card ${hasPrice ? 'saqu-input-card--filled' : ''}`}
            style={{ animationDelay: `${index * 55}ms` }}
        >
            <div className="saqu-input-card-header">
                <div className="saqu-input-info">
                    <span className="saqu-input-name">{product.productName}</span>
                    {product.productDescription && (
                        <span className="saqu-input-desc">{product.productDescription}</span>
                    )}
                    <div className="saqu-input-meta-row">
                        <span className="saqu-input-brand-inline">
                            <Tag size={10} strokeWidth={2} />
                            {product.brand || <span className="italic">Marca não definida</span>}
                        </span>
                        <div className="saqu-input-qty-badge">
                            <span className="saqu-input-qty-label">Qtd</span>
                            <span className="saqu-input-qty-value">{product.quantity} {(product.unitOfMeasure).toUpperCase()}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 'S' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="saqu-input-field-row">
                <span className="saqu-input-field-label">{unitLabel(product.unitOfMeasure)}</span>
                <input
                    type="text"
                    className={`saqu-price-input ${hasPrice ? 'saqu-price-input--filled' : ''}`}
                    value={value}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                />
            </div>
        </div>
    )
}

const MobileSubmittedCard = ({ product, unitPrice, index }) => {
    const hasPrice = unitPrice > 0
    const total = unitPrice * Number(product.quantity)

    return (
        <div
            className={`saqu-submitted-card ${hasPrice ? 'saqu-submitted-card--priced' : 'saqu-submitted-card--empty'}`}
            style={{ animationDelay: `${index * 55}ms` }}
        >
            <div className="saqu-submitted-header">
                <div className="saqu-submitted-info">
                    <span className="saqu-submitted-name">{product.productName}</span>
                    <div className="saqu-submitted-meta-row">
                        <span className="saqu-submitted-brand">
                            <Tag size={10} strokeWidth={2} />
                            {product.brand || <span className="italic">Marca não definida</span>}
                        </span>
                        <div className="saqu-submitted-qty">
                            <span className="saqu-submitted-qty-label">Qtd</span>
                            <span className="saqu-submitted-qty-value">{product.quantity} {(product.unitOfMeasure).toUpperCase()}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 'S' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {hasPrice ? (
                <div className="saqu-submitted-prices">
                    <div className="saqu-submitted-price-cell">
                        <span className="saqu-submitted-price-label">Unitário</span>
                        <span className="saqu-submitted-price-value">{formatMoney(unitPrice)}/{product.unitOfMeasure}</span>
                    </div>
                    <div className="saqu-submitted-price-cell saqu-submitted-price-cell--total">
                        <span className="saqu-submitted-price-label">Total</span>
                        <span className="saqu-submitted-price-value saqu-submitted-price-value--total">{formatMoney(total)}</span>
                    </div>
                </div>
            ) : (
                <div className="saqu-submitted-no-price">
                    <MinusCircle size={14} strokeWidth={2.5} style={{ flexShrink: 0, color: 'var(--color-warning-strong)' }} />
                    <span>Não cotado</span>
                </div>
            )}
        </div>
    )
}

/* Bottom sheet de confirmação nativo mobile */
const MobileConfirmSheet = ({
    isOpen, onClose, products, existingBidByProductId,
    numericPricesByProductId, skippedProducts, grandTotal,
    onConfirm, submitting
}) => (
    <>
        <div
            className={`saqu-sheet-backdrop ${isOpen ? 'open' : ''}`}
            onClick={onClose}
        />
        <div className={`saqu-confirm-sheet ${isOpen ? 'open' : ''}`}>
            <div className="saqu-sheet-handle" />
            <div className="saqu-sheet-header">
                <span className="saqu-sheet-title">Revisar proposta</span>
                <button className="saqu-sheet-close" onClick={onClose} type="button">
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>

            <div className="saqu-sheet-body">
                <p className="saqu-sheet-intro">Confira os valores antes de confirmar o envio.</p>

                <div className="saqu-sheet-items">
                    {products.filter(p => !existingBidByProductId[p.productId]).map((product) => {
                        const unitPrice = numericPricesByProductId[product.productId] ?? 0
                        const isSkipped = unitPrice <= 0
                        const total = unitPrice * Number(product.quantity)

                        return (
                            <div key={product.productId} className={`saqu-review-row ${isSkipped ? 'saqu-review-row--skipped' : ''}`}>
                                <div className="saqu-review-row-top">
                                    <span className="saqu-review-row-name">{product.productName}</span>
                                    {isSkipped ? (
                                        <span className="saqu-review-no-price-pill">Sem preço</span>
                                    ) : (
                                        <span className="saqu-review-total">{formatMoney(total)}</span>
                                    )}
                                </div>
                                <div className="saqu-review-row-bottom">
                                    <span className="saqu-review-row-meta">
                                        {product.quantity} {(product.unitOfMeasure)}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 's' : ''}
                                        {' · '}
                                        {product.brand || <span className="italic">Marca não definida</span>}
                                    </span>
                                    {!isSkipped && (
                                        <span className="saqu-review-row-unit">
                                            {formatMoney(unitPrice)}<span className="saqu-review-row-unit-label">/{product.unitOfMeasure}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {skippedProducts.length > 0 && (
                    <div className="saqu-sheet-warning">
                        <AlertCircle size={15} strokeWidth={2} />
                        <span>
                            {skippedProducts.length === 1
                                ? '1 produto sem preço preenchido não será incluído na proposta.'
                                : `${skippedProducts.length} produtos sem preço não serão incluídos.`}
                        </span>
                    </div>
                )}

                <div className="saqu-sheet-total-row">
                    <span className="saqu-sheet-total-label">Valor potencial</span>
                    <span className="saqu-sheet-total-value">{formatMoney(grandTotal)}</span>
                </div>
            </div>

            <div className="saqu-sheet-footer">
                <button className="saqu-sheet-cancel-btn" onClick={onClose} type="button">
                    Cancelar
                </button>
                <button
                    className="saqu-sheet-confirm-btn"
                    onClick={onConfirm}
                    disabled={submitting}
                    type="button"
                >
                    {submitting ? (
                        <span className="saqu-btn-spinner" />
                    ) : (
                        <Send size={16} strokeWidth={2.5} />
                    )}
                    {submitting ? 'Enviando...' : 'Confirmar e enviar'}
                </button>
            </div>
        </div>
    </>
)

/* ── Main component ──────────────────────────────────────────────── */

const SupplierQuotationActiveUnique = ({ quotationId, participationId }) => {
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const storageKey = `${DRAFT_KEY_PREFIX}${quotationId}_${participationId}`

    const [quotation, setQuotation] = useState(null)
    const [products, setProducts] = useState([])
    const [existingBids, setExistingBids] = useState([])
    const [numericPricesByProductId, setNumericPricesByProductId] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [timeRemaining, setTimeRemaining] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [productsToSubmit, setProductsToSubmit] = useState([])
    const [skippedProducts, setSkippedProducts] = useState([])
    const [hintOpen, setHintOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError("")

            const quotationRes = await request("GET", `/quotations/${quotationId}`)
            const productsRes = await request("GET", `/contains/${quotationId}`)
            const bidsRes = await request("GET", `/bids/participations/${participationId}`)

            if(!quotationRes.ok || !productsRes.ok){
                setError("Falha em carregar produtos")
                setLoading(false)
                return
            }

            const fetchedProducts = productsRes.data ?? []
            const fetchedBids = bidsRes.ok ? bidsRes.data ?? [] : []

            setQuotation(quotationRes.data)
            setProducts([...fetchedProducts].sort((a, b) => a.productName.localeCompare(b.productName)))
            setExistingBids(fetchedBids)

            const savedDraft = JSON.parse(localStorage.getItem(storageKey) || '{}')
            const initialPrices = {}
            for(const product of fetchedProducts){
                const existingBid = fetchedBids.find(bid => bid.productId === product.productId)
                initialPrices[product.productId] = existingBid
                    ? (existingBid.price / existingBid.quantity)
                    : (savedDraft[product.productId] ?? 0)
            }

            setNumericPricesByProductId(initialPrices)
            setLoading(false)
        }

        fetchData()
    }, [participationId, quotationId, request, storageKey])

    useEffect(() => {
        if(!quotation) return

        const end = new Date(quotation.quotationEnd)

        const updateCountdown = () => {
            const now = new Date()
            const diff = end - now

            if(diff <= 0){
                setTimeRemaining("Fechado")
                return
            }

            const days = Math.floor(diff / 86400000)
            const hours = Math.floor((diff % 86400000) / 3600000)
            const mins = Math.floor((diff % 3600000) / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setTimeRemaining(days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`)
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [quotation])

    const existingBidByProductId = useMemo(() => {
        return existingBids.reduce((acc, bid) => {
            if(!acc[bid.productId]) acc[bid.productId] = bid
            return acc
        }, {})
    }, [existingBids])

    const hasSubmittedBids = existingBids.length > 0

    const handleNumericPriceChange = useCallback((productId, numericValue) => {
        setNumericPricesByProductId(prev => {
            const updated = { ...prev, [productId]: numericValue }
            const draft = {}
            for(const [id, price] of Object.entries(updated)){
                if(price > 0 && !existingBidByProductId[id]) draft[id] = price
            }
            localStorage.setItem(storageKey, JSON.stringify(draft))
            return updated
        })
    }, [existingBidByProductId, storageKey])

    const handleReview = () => {
        setError("")
        setSuccess("")

        const pendingProducts = products.filter(p => !existingBidByProductId[p.productId])

        const validProducts = pendingProducts.filter(
            p => (numericPricesByProductId[p.productId] ?? 0) > 0
        )

        if(validProducts.length === 0){
            setError("Preencha o preço de pelo menos um produto antes de enviar.")
            return
        }

        setProductsToSubmit(validProducts)
        setSkippedProducts(pendingProducts.filter(p => !validProducts.includes(p)))
        setShowConfirmModal(true)
    }

    const handleConfirmSubmit = async () => {
        setSubmitting(true)

        const payloads = productsToSubmit.map(product => ({
            participationId,
            productId: product.productId,
            price: (numericPricesByProductId[product.productId] ?? 0) * Number(product.quantity),
            quantity: Number(product.quantity),
            bonus: 0
        }))

        const submitRes = await request("POST", "/bids/batch", payloads)
        setShowConfirmModal(false)

        if(!submitRes.ok){
            setSubmitting(false)
            setError("Falha ao enviar a proposta. Verifique os preços e tente novamente.")
            return
        }

        const bidsRes = await request("GET", `/bids/participations/${participationId}`)
        if(bidsRes.ok) setExistingBids(bidsRes.data ?? [])

        localStorage.removeItem(storageKey)
        setSubmitting(false)
        setSuccess("Proposta única enviada com sucesso!")
    }

    const grandTotal = useMemo(() => {
        return productsToSubmit.reduce((sum, product) => {
            return sum + ((numericPricesByProductId[product.productId] ?? 0) * Number(product.quantity))
        }, 0)
    }, [productsToSubmit, numericPricesByProductId])

    const submittedGrandTotal = useMemo(() => {
        return products.reduce((sum, product) => {
            return sum + ((numericPricesByProductId[product.productId] ?? 0) * Number(product.quantity))
        }, 0)
    }, [products, numericPricesByProductId])

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
                        <span className="qm-mobile-title">Cotação #{quotationId}</span>
                        <span className="qm-mobile-status-pill qm-status--active">Ativo</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>
                <div className="sqc-loading-state">
                    <div className="sqc-loading-spinner" />
                    <span className="sqc-loading-text">Carregando produtos...</span>
                </div>
            </div>
        )

        if (error && !products.length) return (
            <div className="qm-mobile-root">
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotationId}</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>
                <div className="empty-state" style={{ margin: '2rem 1rem' }}>
                    <div className="empty-icon"><AlertCircle size={22} strokeWidth={1.5} /></div>
                    <p>{error}</p>
                </div>
            </div>
        )

        const filledCount = products.filter(p => (numericPricesByProductId[p.productId] ?? 0) > 0).length

        return (
            <div className="qm-mobile-root">
                {/* Sticky header */}
                <div className="qm-mobile-header">
                    <button className="qm-mobile-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="qm-mobile-header-center">
                        <span className="qm-mobile-title">Cotação #{quotationId}</span>
                        <span className="qm-mobile-status-pill qm-status--active">Ativo</span>
                    </div>
                    <div style={{ width: '2.25rem' }} />
                </div>

                {/* Countdown banner */}
                {timeRemaining && timeRemaining !== 'Fechado' && (
                    <div className="qm-countdown-banner qm-status--active">
                        <Clock size={14} strokeWidth={2} />
                        <span>Encerra em</span>
                        <span className="qm-countdown-time">{timeRemaining}</span>
                    </div>
                )}

                {/* Dates info */}
                {quotation && (
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
                )}

                {/* Status card: proposta enviada ou progresso de preenchimento */}
                {hasSubmittedBids ? (
                    <div className="saqu-status-banner saqu-status-banner--sent">
                        <div className="saqu-status-banner-icon">
                            <Hourglass size={18} strokeWidth={1.75} />
                        </div>
                        <div className="saqu-status-banner-body">
                            <span className="saqu-status-banner-title">Proposta enviada — aguardando resultado</span>
                            <span className="saqu-status-banner-sub">
                                {products.filter(p => (numericPricesByProductId[p.productId] ?? 0) > 0).length} produto(s) cotado(s)
                            </span>
                        </div>
                        <FileCheck2 size={18} strokeWidth={1.75} className="saqu-status-banner-check" />
                    </div>
                ) : (
                    <div className="saqu-status-banner saqu-status-banner--pending">
                        <div className="saqu-status-banner-icon saqu-status-banner-icon--pending">
                            <Send size={18} strokeWidth={1.75} />
                        </div>
                        <div className="saqu-status-banner-body">
                            <span className="saqu-status-banner-title">Proposta não enviada</span>
                            <span className="saqu-status-banner-sub">
                                {filledCount}/{products.length} produto(s) com preço
                            </span>
                        </div>
                    </div>
                )}

                {/* Products section */}
                <div className="qm-section" style={{ animationDelay: '0.15s' }}>
                    <div className="qm-section-header" style={{ cursor: 'default' }}>
                        <div className="qm-section-header-left">
                            <span className="qm-section-icon">
                                <Package size={15} strokeWidth={2} />
                            </span>
                            <span className="qm-section-title">
                                {hasSubmittedBids ? 'Sua proposta' : 'Preencher preços'}
                            </span>
                            <span className="qm-section-count">{products.length}</span>
                        </div>
                        {!hasSubmittedBids && (
                            <button
                                className={`saqu-hint-btn${hintOpen ? ' saqu-hint-btn--active' : ''}`}
                                onClick={() => setHintOpen(v => !v)}
                                aria-label="Como funciona"
                            >
                                <Info size={15} strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    {!hasSubmittedBids && hintOpen && (
                        <div className="saqu-hint-balloon">
                            Defina o preço unitário dos produtos que deseja ofertar e envie sua proposta. Itens sem preço não serão incluídos.
                        </div>
                    )}

                    <div className="qm-section-body">

                        <div className="qm-cards-list">
                            {hasSubmittedBids
                                ? products.map((product, i) => (
                                    <MobileSubmittedCard
                                        key={product.productId}
                                        product={product}
                                        unitPrice={numericPricesByProductId[product.productId] ?? 0}
                                        index={i}
                                    />
                                ))
                                : products.map((product, i) => (
                                    <MobileProductInputCard
                                        key={product.productId}
                                        product={product}
                                        initialNumericValue={numericPricesByProductId[product.productId] ?? 0}
                                        onNumericChange={handleNumericPriceChange}
                                        index={i}
                                    />
                                ))
                            }
                        </div>

                        {/* Total footer quando proposta enviada */}
                        {hasSubmittedBids && submittedGrandTotal > 0 && (
                            <div className="sqc-total-footer">
                                <span className="sqc-total-label">Valor potencial</span>
                                <span className="sqc-total-value">{formatMoney(submittedGrandTotal)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                    <div className="saqu-alert saqu-alert--error">
                        <AlertCircle size={15} strokeWidth={2} />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="saqu-alert saqu-alert--success">
                        <CheckCircle2 size={15} strokeWidth={2} />
                        <span>{success}</span>
                    </div>
                )}

                {/* CTA fixo no bottom quando preenchendo */}
                {!hasSubmittedBids && (
                    <div className="saqu-bottom-cta">
                        <div className="saqu-bottom-cta-inner">
                            <button
                                className="saqu-submit-btn"
                                onClick={handleReview}
                                disabled={submitting || filledCount === 0}
                                type="button"
                            >
                                <Send size={17} strokeWidth={2.5} />
                                Revisar e enviar proposta
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ height: hasSubmittedBids
                    ? 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)'
                    : 'calc(4.25rem + env(safe-area-inset-bottom) + 6rem)'
                }} />

                {/* Bottom sheet de confirmação */}
                <MobileConfirmSheet
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    products={products}
                    existingBidByProductId={existingBidByProductId}
                    numericPricesByProductId={numericPricesByProductId}
                    skippedProducts={skippedProducts}
                    grandTotal={grandTotal}
                    onConfirm={handleConfirmSubmit}
                    submitting={submitting}
                />
            </div>
        )
    }

    /* ── Desktop layout ──────────────────────────────────────────── */
    if(loading) return <p>Carregando produtos...</p>
    if(error && !products.length) return <p>{error}</p>
    if(!products.length) return <p>Nenhum produto encontrado para essa cotação</p>

    return (
        <div className="page-wrapper text-[var(--color-text-body)]">
            <h2 className="text-[var(--color-text-heading)] text-[1.25rem] m-0">
                Cotação {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotationId}
            </h2>

            {quotation && (
                <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-card)] border border-[var(--color-border-default)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] mt-[0.3rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-md:flex-col max-md:items-start max-md:gap-[0.4rem]">
                    <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-heading)]">Início:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                    <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-heading)]">Fim:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
                </div>
            )}

            <div className="flex items-center justify-between gap-4 w-full bg-[var(--color-surface-card)] px-4 py-[0.88rem] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] mb-[1.1rem] max-md:flex-col max-md:items-start max-md:gap-3">
                <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">Total de Produtos: <strong>{products.length}</strong></p>
                {hasSubmittedBids && <span className="text-[0.875rem] font-semibold text-[var(--color-success-strong)]">Sua proposta já foi enviada para esta cotação.</span>}
                {timeRemaining && <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">Tempo Restante: {timeRemaining}</p>}
            </div>

            <div className="w-full bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] p-4">
                {hasSubmittedBids ? (
                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <table className="w-full border-collapse text-[0.875rem]">
                            <thead>
                                <tr>
                                    <th className={thCls}>Produto</th>
                                    <th className={thNumCls}>Marca</th>
                                    <th className={thNumCls}>Qtd.</th>
                                    <th className={thNumCls}>Preço unit.</th>
                                    <th className={thNumCls}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => {
                                    const unitPrice = numericPricesByProductId[product.productId] ?? 0
                                    const total = unitPrice * Number(product.quantity)

                                    if(unitPrice > 0) {
                                        return (
                                            <tr key={product.productId}>
                                                <td className={tdCls}>{product.productName}</td>
                                                {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                                <td className={tdNumCls}>{product.quantity} {product.unitOfMeasure}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 's' : ''}</td>
                                                <td className={tdNumCls}>{formatMoney(unitPrice)}/{product.unitOfMeasure}</td>
                                                <td className={`${tdNumCls} font-medium text-[var(--color-text-heading)]`}>{formatMoney(total)}</td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={product.productId} className="opacity-50 [&>td]:bg-[var(--color-surface-subtle)]">
                                            <td className={tdCls}>
                                                <span>{product.productName}</span>
                                                <span className="inline-flex items-center ml-[0.45rem] px-[0.45rem] py-[0.1rem] text-[0.75rem] font-semibold tracking-[0.02em] text-[var(--color-warning-strong)] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-full align-middle whitespace-nowrap leading-[1.4]">Sem preço</span>
                                            </td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} {product.unitOfMeasure}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 's' : ''}</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border-default)]">Valor Potencial</td>
                                    <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border-default)]">{formatMoney(submittedGrandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <>
                        <p className="m-0 mb-[0.85rem] text-[0.875rem] text-[var(--color-text-secondary)]">
                            Defina o preço unitário dos produtos que deseja ofertar e envie sua proposta. Itens sem preço não serão incluídos.
                        </p>

                        <div className="flex flex-col gap-3">
                            {products.map(product => (
                                <SingleProposalProductRow
                                    key={product.productId}
                                    product={product}
                                    initialNumericValue={numericPricesByProductId[product.productId] ?? 0}
                                    onNumericChange={handleNumericPriceChange}
                                />
                            ))}
                        </div>

                        {error && <p className="mt-2 mb-[0.45rem] pt-2 text-center text-[0.875rem] text-[var(--color-danger-strong)]">{error}</p>}
                        {success && <p className="mt-2 mb-[0.45rem] pt-2 text-center text-[0.875rem] text-[var(--color-success-strong)]">{success}</p>}

                        <div className="mt-[0.8rem] flex justify-end max-md:justify-stretch">
                            <Button onClick={handleReview} disabled={submitting} className="max-md:w-full">
                                {submitting ? "Enviando proposta..." : "Revisar e enviar proposta"}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title={"Revisar proposta"}
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0 text-[0.875rem] text-[var(--color-text-secondary)]">Confira os preços antes de confirmar o envio.</p>

                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <table className="w-full border-collapse text-[0.875rem]">
                            <thead>
                                <tr>
                                    <th className={thCls}>Produto</th>
                                    <th className={thNumCls}>Marca</th>
                                    <th className={thNumCls}>Qtd.</th>
                                    <th className={thNumCls}>Preço unit.</th>
                                    <th className={thNumCls}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.filter(p => !existingBidByProductId[p.productId]).map(product => {
                                    const unitPrice = numericPricesByProductId[product.productId] ?? 0
                                    const isSkipped = unitPrice <= 0

                                    if(isSkipped) return (
                                        <tr key={product.productId} className="opacity-50 [&>td]:bg-[var(--color-surface-subtle)]">
                                            <td className={tdCls}>
                                                <span>{product.productName}</span>
                                                <span className="inline-flex items-center ml-[0.45rem] px-[0.45rem] py-[0.1rem] text-[0.75rem] font-semibold tracking-[0.02em] text-[var(--color-warning-strong)] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-full align-middle whitespace-nowrap leading-[1.4]">Sem preço</span>
                                            </td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} {product.unitOfMeasure}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 's' : ''}</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                        </tr>
                                    )

                                    const total = unitPrice * Number(product.quantity)
                                    return (
                                        <tr key={product.productId}>
                                            <td className={tdCls}>{product.productName}</td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} {product.unitOfMeasure}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 's' : ''}</td>
                                            <td className={tdNumCls}>{formatMoney(unitPrice)}/{product.unitOfMeasure}</td>
                                            <td className={`${tdNumCls} font-medium text-[var(--color-text-heading)]`}>{formatMoney(total)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border-default)]">Valor Potencial</td>
                                    <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border-default)]">{formatMoney(grandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {skippedProducts.length > 0 && (
                        <p className="m-0 px-[0.8rem] py-[0.6rem] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-warning-strong)]">
                            {skippedProducts.length === 1
                                ? "1 produto sem preço preenchido não será incluído na proposta."
                                : `${skippedProducts.length} produtos sem preço preenchido não serão incluídos na proposta.`}
                        </p>
                    )}

                    <div className="flex justify-end gap-[0.6rem] pt-1 max-md:flex-col-reverse max-md:[&>button]:w-full">
                        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="success" onClick={handleConfirmSubmit} loading={submitting}>
                            Confirmar e enviar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SupplierQuotationActiveUnique
