import { useCallback, useEffect, useMemo, useState } from 'react'
import useWebSocket from '../../hooks/useWebSocket'
import useFetch from '../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import QuotationProductItem from './QuotationProductItem'
import './SupplierQuotation.css'
import { ENV } from '../../config/env'

const SupplierQuotation = ({ participationId, quotationId }) => {

  const { t, i18n } = useTranslation()

  const { request } = useFetch(ENV.API_BASE_URL)

  const [quotation, setQuotation] = useState(null)
  const [participation, setParticipation] = useState(null)
  const [products, setProducts] = useState([]) 
  const [bids, setBids] = useState([]) 
  const [lowestBids, setLowestBids] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")

  const locale = i18n.language === "pt" ? "pt-BR" : "en-US"
  const formatDecimal = (value) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0))

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)

      const resQuotation = await request("GET", `/quotations/${quotationId}`)

      if(resQuotation.ok){
        setQuotation(resQuotation.data)
      }

      const resParticipation = await request("GET", `/participations/${participationId}`)

      if(resParticipation.ok){
        setParticipation(resParticipation.data)
      }

      const resBids = await request("GET", `/bids/participations/${participationId}`)

      if(resBids.ok){
        setBids(resBids.data)
      }

      const resProducts = await request("GET", `/contains/${quotationId}`)
      setLoading(false)

      if(resProducts.ok){
        setProducts(resProducts.data)
        setError("")

        resProducts.data.forEach(async (product) => {
          const bidRes = await request("GET", `/bids/lowest?quotationId=${quotationId}&productId=${product.productId}`)

          if(bidRes.ok){
            setLowestBids(prev => ({...prev, [product.productId]: bidRes.data}))
          }
        })

      }else{
        setError(t("load_products_failed"))
      }
    }

    fetchData()

  }, [quotationId, participationId, request, t])

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
      const hours = Math.floor((diff  % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [quotation, t])

  const handleNewBid = useCallback((bid) => {

    if(bid.participationId === participationId){
      setBids(prev => [bid, ...prev])
    }

    setLowestBids(prev => {
      const currentLowest = prev[bid.productId]
      if(!currentLowest || bid.price < currentLowest.price){
        return {...prev, [bid.productId]: bid }
      }
      return prev
    })
  }, [participationId])

  useWebSocket(quotationId, handleNewBid)

  const bidColumns = useMemo(() => [
    { key: "productName", label: t("product") },
    { key: "productBarCodeNumber", label: t("barcode_number") },
    { key: "price", label: t("total_price") },
    { key: "quantity", label: t("quantity") },
    { key: "bonus", label: t("bonus") },
    { key: "pricePerUnit", label: t("price_per_unit")},
    { key: "createdAt", label: t("date_hour") },
    { key: "status", label: "Status" }
  ], [t])

  const formattedBids = bids.map(b => {

    const lowestBid = lowestBids[b.productId]
    const isLowest = lowestBid && lowestBid.participationId === b.participationId && lowestBid.price === b.price

    return {
      ...b,
      price: `R$ ${formatDecimal(b.price)}`,
      pricePerUnit: `R$ ${formatDecimal(b.price / (b.quantity + b.bonus))}`,
      createdAt: new Date(b.createdAt).toLocaleString(),
      status: isLowest ? <span style={{color: "green"}}>{t("lowest")}</span> : <span style={{color: "red"}}>{t("outbid")}</span>
    }
  })

  const winningCount = Object.values(lowestBids).filter(
    bid => bid && bid.participationId === participationId
  ).length

  const totalWinningValue = Object.values(lowestBids)
    .filter(bid => bid && bid.participationId === participationId)
    .reduce((sum, bid) => sum + bid.price, 0)

  if(loading) return <p>{t("loading_products")}</p>
  if(error) return <p>{error}</p>
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
          <div className="winning-section">
            <span className="winning-text">
              {t("winning")}: {winningCount}/{products.length}
            </span>
            <Button onClick={() => setIsWinningModalOpen(true)}>{t("view")}</Button>
          </div>
        </div>

        <div className="supplier-products">
          {products.map(product => (
            <QuotationProductItem key={product.productId} product={product} participationId={participationId} currentLowestBid={lowestBids[product.productId] || null} />
          ))}
        </div>

        <div className="supplier-bids">
          <Table title={t("your_bids")} columns={bidColumns} data={formattedBids} loading={loading} emptyMessage={t("empty_bids")}/>
        </div>

        <Modal isOpen={isWinningModalOpen} onClose={() => setIsWinningModalOpen(false)} title={t("winning_bids")}>
          <div className="winning-modal-content">
            {winningCount > 0 ? (
              <>
              <ul className="winning-list">
                {Object.entries(lowestBids)
                  .filter(([_, bid]) => bid && bid.participationId === participationId)
                  .map(([productId, bid]) => {
                    const product = products.find(p => p.productId === Number(productId))
                    const pricePerUnit = formatDecimal(bid.price / (bid.quantity + bid.bonus))
                    return (
                      <li key={productId} className="winning-item">
                        <strong>{product?.productName}</strong> - R$ {formatDecimal(bid.price)} - R$ {pricePerUnit}/{product?.unitOfMeasure}
                      </li>
                    )
                  })
                }
              </ul>
              <div className="winning-total">
                <strong>{t("total_value")}: </strong>R$ {formatDecimal(totalWinningValue)}
              </div>
              </>
            ) : (
              <p>{t("not_winning_bids")}</p>
            )}
          </div>
        </Modal>

      </div>
    )
}

export default SupplierQuotation
