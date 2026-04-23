import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import { formatMoney } from '../../utils/formatMoney'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import SingleProposalProductRow from './SingleProposalProductRow'
import { ENV } from '../../config/env'

const DRAFT_KEY_PREFIX = "draft_prices_"

const thCls = "text-left px-[0.6rem] py-2 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)] border-b-2 border-[var(--color-border)]"
const thNumCls = `${thCls} text-right`
const tdCls = "px-[0.6rem] py-[0.55rem] text-[var(--color-text-default)] border-b border-[var(--color-border-lighter)] align-middle"
const tdNumCls = `${tdCls} text-right whitespace-nowrap`

const SupplierQuotationActiveUnique = ({ quotationId, participationId }) => {
    const { t, i18n } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError("")

            const quotationRes = await request("GET", `/quotations/${quotationId}`)
            const productsRes = await request("GET", `/contains/${quotationId}`)
            const bidsRes = await request("GET", `/bids/participations/${participationId}`)

            if(!quotationRes.ok || !productsRes.ok){
                setError(t("load_products_failed"))
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
    }, [participationId, quotationId, request, t, storageKey])

    useEffect(() => {
        if(!quotation) return

        const end = new Date(quotation.quotationEnd)

        const updateCountdown = () => {
            const now = new Date()
            const diff = end - now

            if(diff <= 0){
                setTimeRemaining(t("quotation_closed"))
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
    }, [quotation, t])

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
            setError(t("single_proposal_no_prices"))
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
            setError(t("single_proposal_submit_error"))
            return
        }

        const bidsRes = await request("GET", `/bids/participations/${participationId}`)
        if(bidsRes.ok) setExistingBids(bidsRes.data ?? [])

        localStorage.removeItem(storageKey)
        setSubmitting(false)
        setSuccess(t("single_proposal_submit_success"))
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

    if(loading) return <p>{t("loading_products")}</p>
    if(error && !products.length) return <p>{error}</p>
    if(!products.length) return <p>{t("no_products_quotation")}</p>

    return (
        <div className="page-wrapper text-[var(--color-text-primary)]">
            <h2 className="text-[var(--color-text-strong)] text-[1.25rem] m-0">
                {t("quotation")} {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotationId}
            </h2>

            {quotation && (
                <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-0)] border border-[var(--color-border)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] mt-[0.3rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.4rem]">
                    <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-strong)]">{t("start_uppercase")}:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                    <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-strong)]">{t("end_uppercase")}:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
                </div>
            )}

            <div className="flex items-center justify-between gap-4 w-full bg-[var(--color-surface-0)] px-4 py-[0.88rem] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] mb-[1.1rem] max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3">
                <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">{t("total_products")}: <strong>{products.length}</strong></p>
                {hasSubmittedBids && <span className="text-[0.875rem] font-semibold text-[var(--color-success-strong)]">{t("single_proposal_already_submitted")}</span>}
                {timeRemaining && <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">{t("time_remaining")}: {timeRemaining}</p>}
            </div>

            <div className="w-full bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] p-4">
                {hasSubmittedBids ? (
                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <table className="w-full border-collapse text-[0.875rem]">
                            <thead>
                                <tr>
                                    <th className={thCls}>{t("single_proposal_col_product")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_brand")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_qty")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_unit_price")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_total")}</th>
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
                                                <td className={tdNumCls}>{product.quantity} UN</td>
                                                <td className={tdNumCls}>{formatMoney(unitPrice, i18n.language)}</td>
                                                <td className={`${tdNumCls} font-medium text-[var(--color-text-strong)]`}>{formatMoney(total, i18n.language)}</td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={product.productId} className="opacity-50 [&>td]:bg-[var(--color-surface-1)]">
                                            <td className={tdCls}>
                                                <span>{product.productName}</span>
                                                <span className="inline-flex items-center ml-[0.45rem] px-[0.45rem] py-[0.1rem] text-[0.75rem] font-semibold tracking-[0.02em] text-[var(--color-warning-strong)] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-full align-middle whitespace-nowrap leading-[1.4]">{t("single_proposal_no_price_badge")}</span>
                                            </td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} UN</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border)]">{t("potencial_value")}</td>
                                    <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border)]">{formatMoney(submittedGrandTotal, i18n.language)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <>
                        <p className="m-0 mb-[0.85rem] text-[0.875rem] text-[var(--color-text-secondary)]">{t("single_proposal_instruction")}</p>

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

                        <div className="mt-[0.8rem] flex justify-end max-[768px]:justify-stretch">
                            <Button onClick={handleReview} disabled={submitting} className="max-[768px]:w-full">
                                {submitting ? t("single_proposal_submitting") : t("single_proposal_submit")}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title={t("single_proposal_review_title")}
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0 text-[0.875rem] text-[var(--color-text-secondary)]">{t("single_proposal_review_intro")}</p>

                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <table className="w-full border-collapse text-[0.875rem]">
                            <thead>
                                <tr>
                                    <th className={thCls}>{t("single_proposal_col_product")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_brand")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_qty")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_unit_price")}</th>
                                    <th className={thNumCls}>{t("single_proposal_col_total")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.filter(p => !existingBidByProductId[p.productId]).map(product => {
                                    const unitPrice = numericPricesByProductId[product.productId] ?? 0
                                    const isSkipped = unitPrice <= 0

                                    if(isSkipped) return (
                                        <tr key={product.productId} className="opacity-50 [&>td]:bg-[var(--color-surface-1)]">
                                            <td className={tdCls}>
                                                <span>{product.productName}</span>
                                                <span className="inline-flex items-center ml-[0.45rem] px-[0.45rem] py-[0.1rem] text-[0.75rem] font-semibold tracking-[0.02em] text-[var(--color-warning-strong)] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-full align-middle whitespace-nowrap leading-[1.4]">{t("single_proposal_no_price_badge")}</span>
                                            </td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} UN</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                            <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td>
                                        </tr>
                                    )

                                    const total = unitPrice * Number(product.quantity)
                                    return (
                                        <tr key={product.productId}>
                                            <td className={tdCls}>{product.productName}</td>
                                            {product.brand === null || product.brand === "" ? <td className={`${tdNumCls} text-[var(--color-text-muted)]`}>—</td> : <td className={tdNumCls}>{product.brand}</td>}
                                            <td className={tdNumCls}>{product.quantity} UN</td>
                                            <td className={tdNumCls}>{formatMoney(unitPrice, i18n.language)}</td>
                                            <td className={`${tdNumCls} font-medium text-[var(--color-text-strong)]`}>{formatMoney(total, i18n.language)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border)]">{t("potencial_value")}</td>
                                    <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border)]">{formatMoney(grandTotal, i18n.language)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {skippedProducts.length > 0 && (
                        <p className="m-0 px-[0.8rem] py-[0.6rem] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-warning-strong)]">
                            {skippedProducts.length === 1
                                ? t("single_proposal_skipped_warning_one")
                                : t("single_proposal_skipped_warning_other", { count: skippedProducts.length })}
                        </p>
                    )}

                    <div className="flex justify-end gap-[0.6rem] pt-1 max-[768px]:flex-col-reverse max-[768px]:[&>button]:w-full">
                        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                            {t("single_proposal_cancel")}
                        </Button>
                        <Button variant="success" onClick={handleConfirmSubmit} loading={submitting}>
                            {t("single_proposal_confirm_submit")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default SupplierQuotationActiveUnique
