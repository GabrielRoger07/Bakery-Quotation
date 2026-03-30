import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import { formatMoney } from '../../utils/formatMoney'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import SingleProposalProductRow from './SingleProposalProductRow'
import { ENV } from '../../config/env'
import './SupplierQuotation.css'

const DRAFT_KEY_PREFIX = "draft_prices_"

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
            setProducts(fetchedProducts)
            setExistingBids(fetchedBids)

            const savedDraft = JSON.parse(localStorage.getItem(storageKey) || '{}')
            const initialPrices = {}
            for(const product of fetchedProducts){
                const existingBid = fetchedBids.find(bid => bid.productId === product.productId)
                initialPrices[product.productId] = existingBid
                    ? existingBid.price
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
        <div className="supplier-quotation-container">
            <h2>{t("quotation")} {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotationId}</h2>

            {quotation && (
                <div className="quotation-info">
                    <p><strong>{t("start_uppercase")}:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                    <p><strong>{t("end_uppercase")}:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
                </div>
            )}

            <div className="quotation-summary">
                <p>{t("total_products")}: <strong>{products.length}</strong></p>
                {hasSubmittedBids && (<span className="single-proposal-submitted">{t("single_proposal_already_submitted")}</span>)}
                {timeRemaining && <p>{t("time_remaining")}: {timeRemaining}</p>}
            </div>

            <div className="single-proposal-card">
                {hasSubmittedBids ? (
                    <>
                        <div className="proposal-review-table-wrapper">
                            <table className="proposal-review-table">
                                <thead>
                                    <tr>
                                        <th>{t("single_proposal_col_product")}</th>
                                        <th className="proposal-review-num">{t("single_proposal_col_brand")}</th>
                                        <th className="proposal-review-num">{t("single_proposal_col_qty")}</th>
                                        <th className="proposal-review-num">{t("single_proposal_col_unit_price")}</th>
                                        <th className="proposal-review-num">{t("single_proposal_col_total")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => {
                                        const unitPrice = numericPricesByProductId[product.productId] ?? 0
                                        const total = unitPrice * Number(product.quantity)

                                        if(unitPrice > 0) {
                                            return (
                                                <tr key={product.productId}>
                                                    <td>{product.productName}</td>
                                                    {product.brand === null ? <td className="proposal-review-num proposal-review-dash">—</td> : <td className="proposal-review-num">{product.brand}</td>}
                                                    <td className="proposal-review-num">{product.quantity} UN</td>
                                                    <td className="proposal-review-num">{formatMoney(unitPrice, i18n.language)}</td>
                                                    <td className="proposal-review-num proposal-review-total">{formatMoney(total, i18n.language)}</td>
                                                </tr>
                                            )
                                        }

                                        return (
                                            <tr key={product.productId} className="proposal-review-row-skipped">
                                                <td>
                                                    <span>{product.productName}</span>
                                                    <span className="proposal-review-no-price-badge">{t("single_proposal_no_price_badge")}</span>
                                                </td>
                                                {product.brand === null ? <td className="proposal-review-num proposal-review-dash">—</td> : <td className="proposal-review-num">{product.brand}</td>}
                                                <td className="proposal-review-num">{product.quantity} UN</td>
                                                <td className="proposal-review-num proposal-review-dash">—</td>
                                                <td className="proposal-review-num proposal-review-dash">—</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="proposal-review-grand-label">{t("potencial_value")}</td>
                                        <td className="proposal-review-num proposal-review-grand-total">{formatMoney(submittedGrandTotal, i18n.language)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="single-proposal-helper">{t("single_proposal_instruction")}</p>

                        <div className="single-proposal-list">
                            {products.map(product => (
                                <SingleProposalProductRow
                                    key={product.productId}
                                    product={product}
                                    initialNumericValue={numericPricesByProductId[product.productId] ?? 0}
                                    onNumericChange={handleNumericPriceChange}
                                />
                            ))}
                        </div>

                        {error && <p className="bid-feedback bid-feedback-error">{error}</p>}
                        {success && <p className="bid-feedback bid-feedback-success">{success}</p>}

                        <div className="single-proposal-actions">
                            <Button onClick={handleReview} disabled={submitting}>
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
                <div className="proposal-review">
                    <p className="proposal-review-intro">{t("single_proposal_review_intro")}</p>

                    <div className="proposal-review-table-wrapper">
                    <table className="proposal-review-table">
                        <thead>
                            <tr>
                                <th>{t("single_proposal_col_product")}</th>
                                <th className="proposal-review-num">{t("single_proposal_col_brand")}</th>
                                <th className="proposal-review-num">{t("single_proposal_col_qty")}</th>
                                <th className="proposal-review-num">{t("single_proposal_col_unit_price")}</th>
                                <th className="proposal-review-num">{t("single_proposal_col_total")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.filter(p => !existingBidByProductId[p.productId]).map(product => {
                                const unitPrice = numericPricesByProductId[product.productId] ?? 0
                                const isSkipped = unitPrice <= 0

                                if(isSkipped) return (
                                    <tr key={product.productId} className="proposal-review-row-skipped">
                                        <td>
                                            <span className="proposal-review-skipped-name">{product.productName}</span>
                                            <span className="proposal-review-no-price-badge">{t("single_proposal_no_price_badge")}</span>
                                        </td>
                                        {product.brand === null ? <td className="proposal-review-num proposal-review-dash">—</td> : <td className="proposal-review-num">{product.brand}</td>}
                                        <td className="proposal-review-num">{product.quantity} UN</td>
                                        <td className="proposal-review-num proposal-review-dash">—</td>
                                        <td className="proposal-review-num proposal-review-dash">—</td>
                                    </tr>
                                )

                                const total = unitPrice * Number(product.quantity)
                                return (
                                    <tr key={product.productId}>
                                        <td>{product.productName}</td>
                                        {product.brand === null ? <td className="proposal-review-num proposal-review-dash">—</td> : <td className="proposal-review-num">{product.brand}</td>}
                                        <td className="proposal-review-num">{product.quantity} UN</td>
                                        <td className="proposal-review-num">{formatMoney(unitPrice, i18n.language)}</td>
                                        <td className="proposal-review-num proposal-review-total">{formatMoney(total, i18n.language)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="proposal-review-grand-label">{t("potencial_value")}</td>
                                <td className="proposal-review-num proposal-review-grand-total">{formatMoney(grandTotal, i18n.language)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    </div>

                    {skippedProducts.length > 0 && (
                        <p className="proposal-review-skipped-warning">
                            {skippedProducts.length === 1
                                ? t("single_proposal_skipped_warning_one")
                                : t("single_proposal_skipped_warning_other", { count: skippedProducts.length })}
                        </p>
                    )}

                    <div className="proposal-review-actions">
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
