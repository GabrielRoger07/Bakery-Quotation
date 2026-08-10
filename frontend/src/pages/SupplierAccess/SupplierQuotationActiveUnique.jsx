import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import { formatMoney } from '@/utils/formatMoney'
import { formatDateTime } from '@/utils/formatDateTime'
import { useCurrencyMask } from '@/hooks/useCurrencyMask'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import MetaCard from '@/components/MetaCard'
import Alert from '@/components/Alert'
import EmptyState from '@/components/EmptyState'
import BidResultTable from '@/components/BidResultTable'
import { ENV } from '@/config/env'
import {
    ChevronLeft, Clock, Package, Tag, CheckCircle2,
    AlertCircle, Send, FileCheck2, X, MinusCircle, Hourglass, Info, Flag, Calendar, XCircle
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

const unitLabel = (u) => UNIT_LABEL[u]?.[1] ?? u

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
                    <span className="saqu-input-brand-inline">
                        <Tag size={10} strokeWidth={2} />
                        {product.brand || <span className="italic">Marca não definida</span>}
                    </span>
                </div>
                <div className="saqu-input-qty-badge">
                    <span className="saqu-input-qty-label">Qtd</span>
                    <span className="saqu-input-qty-value">{product.quantity}</span>
                    <span className="saqu-input-qty-unit">{(product.unitOfMeasure).toUpperCase()}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 'S' : ''}</span>
                </div>
            </div>

            <div className="saqu-input-field-row">
                <div className="saqu-price-input-group">
                    <input
                        type="text"
                        className="saqu-price-input"
                        value={value}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                    />
                    <span className="saqu-price-input-unit">/ {unitLabel(product.unitOfMeasure)}</span>
                </div>
            </div>

            {hasPrice && (
                <div className="saqu-input-total-row">
                    <span className="saqu-input-total-label">Total: </span>
                    <span className="saqu-input-total-value">{formatMoney(getNumericValue() * Number(product.quantity))}</span>
                </div>
            )}
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
                    {product.productDescription && (
                        <span className="saqu-input-desc">{product.productDescription}</span>
                    )}
                    <span className="saqu-submitted-brand">
                        <Tag size={10} strokeWidth={2} />
                        {product.brand || <span className="italic">Marca não definida</span>}
                    </span>
                </div>
                <div className="saqu-submitted-qty">
                    <span className="saqu-submitted-qty-label">Qtd</span>
                    <span className="saqu-submitted-qty-value">{product.quantity}</span>
                    <span className="saqu-submitted-qty-unit">{(product.unitOfMeasure).toUpperCase()}{['bag', 'balde'].includes(product.unitOfMeasure) && product.quantity > 1 ? 'S' : ''}</span>
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
                                Após o envio, os valores não poderão ser alterados
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
                            <span className="saqu-bottom-cta-meta">
                                <span className="saqu-bottom-cta-total">{filledCount}/{products.length}</span> produto(s) com preço
                            </span>
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
    const quotationStartFormatted = quotation ? formatDateTime(quotation.quotationStart) : null
    const quotationEndFormatted = quotation ? formatDateTime(quotation.quotationEnd) : null
    const startText = quotationStartFormatted ? `${quotationStartFormatted.date}, ${quotationStartFormatted.time}` : "-"
    const endText = quotationEndFormatted ? `${quotationEndFormatted.date}, ${quotationEndFormatted.time}` : "-"

    const filledCount = products.filter(p => (numericPricesByProductId[p.productId] ?? 0) > 0).length

    const toBidItem = (product) => {
        const unitPrice = numericPricesByProductId[product.productId] ?? 0
        return {
            productId: product.productId,
            productName: product.productName,
            productDescription: product.productDescription || null,
            brand: product.brand || null,
            quantity: Number(product.quantity),
            bonus: 0,
            unitOfMeasure: product.unitOfMeasure,
            unitLabel: unitLabel(product.unitOfMeasure),
            pricePerUnit: unitPrice,
            price: unitPrice * Number(product.quantity),
            noPrice: unitPrice <= 0,
        }
    }

    const bidItems = products.map(toBidItem)
    const reviewItems = products
        .filter(p => !existingBidByProductId[p.productId])
        .map(toBidItem)

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
                    {quotation && (
                        <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                            {quotation.isAuction ? "Leilão reverso" : "Cotação única"}
                        </span>
                    )}
                    <div className="flex items-center gap-2.5">
                        <h1 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)] leading-tight truncate">
                            Cotação #{quotationId}
                        </h1>
                        <span className="qm-mobile-status-pill qm-status--active inline-flex items-center gap-1">
                            Ativo
                        </span>
                    </div>
                </div>

                {quotation && (
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
                )}
            </header>

            {/* ── Countdown banner (mesmo padrão compacto do mobile) ── */}
            {timeRemaining && timeRemaining !== 'Fechado' && (
                <div className="qm-countdown-banner qm-status--active top-[7.875rem]">
                    <Clock size={14} strokeWidth={2} />
                    <span>Encerra em</span>
                    <span className="qm-countdown-time">{timeRemaining}</span>
                </div>
            )}

            <div className="px-6 py-6">
                {loading ? (
                    <div className="sqc-loading-state">
                        <div className="sqc-loading-spinner" />
                        <span className="sqc-loading-text">Carregando produtos...</span>
                    </div>
                ) : (error && !products.length) ? (
                    <EmptyState
                        className="max-w-[34rem] mx-auto"
                        tone="danger"
                        icon={<XCircle size={28} strokeWidth={1.75} />}
                        title="Não foi possível carregar os produtos"
                        description={error}
                    />
                ) : !products.length ? (
                    <EmptyState
                        className="max-w-[34rem] mx-auto"
                        icon={<Package size={28} strokeWidth={1.75} />}
                        title="Nenhum produto nesta cotação"
                        description="Esta cotação ainda não tem produtos para cotar."
                    />
                ) : hasSubmittedBids ? (
                    <>
                        {/* ── Faixa de status: proposta enviada (mesma cor do mobile: saqu-status-banner--sent) ── */}
                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-highlight-soft)] border border-[var(--color-info-border)] mb-5">
                            <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] border-[1.5px] border-[var(--color-info-border)] text-[var(--color-accent)]">
                                <Hourglass size={18} strokeWidth={1.75} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <span className="block text-body font-bold text-[var(--color-text-heading)]">Proposta enviada — aguardando resultado</span>
                                <span className="block text-caption text-[var(--color-text-muted)]">
                                    {filledCount} de {products.length} produto{products.length === 1 ? '' : 's'} cotado{filledCount === 1 ? '' : 's'}
                                </span>
                            </div>
                            <FileCheck2 size={18} strokeWidth={1.75} className="text-[var(--color-accent)] shrink-0" />
                        </div>

                        {/* ── Cabeçalho da seção ── */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <Package size={22} strokeWidth={2} className="text-[var(--color-accent)] shrink-0" />
                            <h2 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)]">
                                Sua proposta
                            </h2>
                            <span className="inline-flex items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-2.5 py-1 text-caption font-semibold text-[var(--color-text-muted)] whitespace-nowrap">
                                {products.length} produto{products.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <BidResultTable items={bidItems} totalValue={submittedGrandTotal} totalLabel="Valor potencial" statusBar />
                    </>
                ) : (
                    <>
                        {/* ── Faixa de status: proposta não enviada (mesma cor do mobile: saqu-status-banner--pending) ── */}
                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)] mb-5">
                            <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] border-[1.5px] border-[var(--color-highlight-border)] text-[var(--color-accent)]">
                                <Send size={18} strokeWidth={1.75} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <span className="block text-body font-bold text-[var(--color-text-heading)]">Proposta não enviada</span>
                                <span className="block text-caption text-[var(--color-text-muted)]">
                                    Após o envio, os valores não poderão ser alterados
                                </span>
                            </div>
                        </div>

                        {/* ── Cabeçalho da seção ── */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <Package size={22} strokeWidth={2} className="text-[var(--color-accent)] shrink-0" />
                            <h2 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)]">
                                Preencher preços
                            </h2>
                            <span className="inline-flex items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-2.5 py-1 text-caption font-semibold text-[var(--color-text-muted)] whitespace-nowrap">
                                {products.length} produto{products.length === 1 ? '' : 's'}
                            </span>
                        </div>
                        <p className="m-0 mb-4 text-body text-[var(--color-text-secondary)]">
                            Defina o preço unitário dos produtos que deseja ofertar e envie sua proposta. Itens sem preço não serão incluídos.
                        </p>

                        <BidResultTable
                            items={bidItems}
                            editable
                            onPriceChange={handleNumericPriceChange}
                            totalValue={submittedGrandTotal}
                            totalLabel="Valor potencial"
                        />

                        <Alert message={error} variant="error" className="mt-4 mb-0" />
                        <Alert message={success} variant="success" className="mt-4 mb-0" />

                        <div className="mt-5 flex justify-end">
                            <Button onClick={handleReview} disabled={submitting}>
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
                    <p className="m-0 text-body text-[var(--color-text-secondary)]">Confira os preços antes de confirmar o envio.</p>

                    <BidResultTable items={reviewItems} totalValue={grandTotal} totalLabel="Valor potencial" showAvatar={false} />

                    {skippedProducts.length > 0 && (
                        <p className="m-0 px-[0.8rem] py-[0.6rem] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-[var(--radius-md)] text-body text-[var(--color-warning-strong)]">
                            {skippedProducts.length === 1
                                ? "1 produto sem preço preenchido não será incluído na proposta."
                                : `${skippedProducts.length} produtos sem preço preenchido não serão incluídos na proposta.`}
                        </p>
                    )}

                    <div className="flex justify-center gap-[0.6rem] pt-1 max-md:flex-col-reverse max-md:[&>button]:w-full">
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
