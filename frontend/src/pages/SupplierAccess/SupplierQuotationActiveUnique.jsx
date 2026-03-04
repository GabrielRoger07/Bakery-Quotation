import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { ENV } from '../../config/env'
import './SupplierQuotation.css'

const SupplierQuotationActiveUnique = ({ quotationId, participationId }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [quotation, setQuotation] = useState(null)
    const [participation, setParticipation] = useState(null)
    const [products, setProducts] = useState([])
    const [existingBids, setExistingBids] = useState([])
    const [pricesByProductId, setPricesByProductId] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [timeRemaining, setTimeRemaining] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError("")

            const quotationRes = await request("GET", `/quotations/${quotationId}`)
            const participationRes = await request("GET", `/participations/${participationId}`)
            const productsRes = await request("GET", `/contains/${quotationId}`)
            const bidsRes = await request("GET", `/bids/participations/${participationId}`)

            if(!quotationRes.ok || !productsRes.ok){
                setError(t("load_products_failed"))
                setLoading(false)
                return
            }

            const fetchedQuotation = quotationRes.data
            const fetchedProducts = productsRes.data ?? []
            const fetchedBids = bidsRes.ok ? bidsRes.data ?? [] : []

            setQuotation(fetchedQuotation)
            setParticipation(participationRes.ok ? participationRes.data : null)
            setProducts(fetchedProducts)
            setExistingBids(fetchedBids)

            const initialPrices = {}

            for(const product of fetchedProducts){
                const existingBid = fetchedBids.find(bid => bid.productId === product.productId)
                initialPrices[product.productId] = existingBid ? String(existingBid.price) : ""
            }

            setPricesByProductId(initialPrices)
            setLoading(false)
        }

        fetchData()
    }, [participationId, quotationId, request, t])

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
            if(!acc[bid.productId]){
                acc[bid.productId] = bid
            }
            return acc
        }, {})
    }, [existingBids])

    const isFullySubmitted = products.length > 0 && products.every(product => existingBidByProductId[product.productId])

    const handlePriceChange = (productId, rawValue) => {
        const value = rawValue === "" ? "" : rawValue.replace(",", ".")
        setPricesByProductId(prev => ({ ...prev, [productId]: value }))
    }

    const handleSubmit = async () => {
        setError("")
        setSuccess("")

        const pendingProducts = products.filter(product => !existingBidByProductId[product.productId])
        if(pendingProducts.length === 0){
            setError(t("single_proposal_already_submitted"))
            return
        }

        const invalidProduct = pendingProducts.find(product => {
            const parsedPrice = Number(pricesByProductId[product.productId])
            return !Number.isFinite(parsedPrice) || parsedPrice <= 0
        })

        if(invalidProduct){
            setError(t("single_proposal_price_required"))
            return
        }

        setSubmitting(true)

        const payloads = pendingProducts.map(product => ({
            participationId,
            productId: product.productId,
            price: (Number(pricesByProductId[product.productId]) * Number(product.quantity)),
            quantity: Number(product.quantity),
            bonus: 0
        }))

        const submitRes = await request("POST", "/bids/batch", payloads)
        if(!submitRes.ok){
            setSubmitting(false)
            setError(t("single_proposal_submit_error"))
            return
        }

        const bidsRes = await request("GET", `/bids/participations/${participationId}`)
        if(bidsRes.ok){
            setExistingBids(bidsRes.data ?? [])
        }

        setSubmitting(false)
        setSuccess(t("single_proposal_submit_success"))
    }

    if(loading) return <p>{t("loading_products")}</p>
    if(error && !products.length) return <p>{error}</p>
    if(!products.length) return <p>{t("no_products_quotation")}</p>

    return (
        <div className="supplier-quotation-container">
            <h2>{t("quotation")} #{quotationId}</h2>

            {participation?.supplierName && (
                <p className="supplier-name">{t("supplier")}: {participation.supplierName}</p>
            )}

            {quotation && (
                <div className="quotation-info">
                    <p><strong>{t("start_uppercase")}:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                    <p><strong>{t("end_uppercase")}:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
                </div>
            )}

            <div className="quotation-summary">
                <p>{t("total_products")}: <strong>{products.length}</strong></p>
                {timeRemaining && <p>{t("time_remaining")}: {timeRemaining}</p>}
            </div>

            <div className="single-proposal-card">
                <p className="single-proposal-helper">{t("single_proposal_instruction")}</p>

                <div className="single-proposal-list">
                    {products.map(product => {
                        const hasBid = Boolean(existingBidByProductId[product.productId])
                        return (
                            <div key={product.productId} className="single-proposal-item">
                                <div className="single-proposal-item-meta">
                                    <strong>{product.productName}</strong>
                                    <span>{t("quantity")}: {product.quantity} {product.unitOfMeasure}</span>
                                </div>

                                <Input
                                    label={t("single_proposal_price_label") + `${product.unitOfMeasure}:`}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={pricesByProductId[product.productId] ?? ""}
                                    onChange={(e) => handlePriceChange(product.productId, e.target.value)}
                                    disabled={hasBid || isFullySubmitted}
                                    placeholder="0.00"
                                />
                            </div>
                        )
                    })}
                </div>

                {error && <p className="bid-feedback bid-feedback-error">{error}</p>}
                {success && <p className="bid-feedback bid-feedback-success">{success}</p>}

                <div className="single-proposal-actions">
                    {isFullySubmitted ? (
                        <p className="single-proposal-submitted">{t("single_proposal_already_submitted")}</p>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? t("single_proposal_submitting") : t("single_proposal_submit")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SupplierQuotationActiveUnique
