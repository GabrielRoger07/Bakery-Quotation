import { useCallback, useEffect, useMemo, useState } from 'react'
import useWebSocket from '../../hooks/useWebSocket'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import QuotationProductItem from './QuotationProductItem'
import './SupplierQuotation.css'

const SupplierQuotation = ({ participationId, quotationId }) => {

  const { request } = useFetch("http://localhost:8080/api/v1")
  const [products, setProducts] = useState([]) 
  const [bids, setBids] = useState([]) 
  const [lowestBids, setLowestBids] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false)

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)

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
        setError(resProducts.data?.message || "Failed to load products")
      }
    }

    fetchData()

  }, [quotationId, participationId])

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
    { key: "productName", label: "Product" },
    { key: "price", label: "Price" },
    { key: "quantity", label: "Quantity" },
    { key: "bonus", label: "Bonus" },
    { key: "pricePerUnit", label: "Price Per Unit"},
    { key: "createdAt", label: "Date/Time" },
    { key: "status", label: "Status" }
  ], [])

  const formattedBids = bids.map(b => {

    const lowestBid = lowestBids[b.productId]
    const isLowest = lowestBid && lowestBid.participationId === b.participationId && lowestBid.price === b.price

    return {
      ...b,
      price: `R$ ${b.price.toFixed(2)}`,
      pricePerUnit: `R$ ${(b.price / (b.quantity + b.bonus)).toFixed(2)}`,
      createdAt: new Date(b.createdAt).toLocaleString(),
      status: isLowest ? <span style={{color: "green"}}>Lowest</span> : <span style={{color: "red"}}>Outbid</span>
    }
  })

  const winningCount = Object.values(lowestBids).filter(
    bid => bid && bid.participationId === participationId
  ).length

  if(loading) return <p>Loading products...</p>
  if(error) return <p>{error}</p>
  if(!products.length) return <p>No products found for this quotation</p>

  return (
      <div className="supplier-quotation-container">
        <h2>Quotation #{quotationId}</h2>
        <div className="quotation-summary">
          <p>Total Products: <strong>{products.length}</strong></p>
          <Button onClick={() => setIsWinningModalOpen(true)}>Winning: {winningCount}/{products.length}</Button>
        </div>

        <div className="supplier-products">
          {products.map(product => (
            <QuotationProductItem key={product.productId} product={product} participationId={participationId} currentLowestBid={lowestBids[product.productId] || null} />
          ))}
        </div>

        <div className="supplier-bids">
          <Table title="Your bids" columns={bidColumns} data={formattedBids} loading={loading} emptyMessage="You haven't placed any bids yet."/>
        </div>

        <Modal isOpen={isWinningModalOpen} onClose={() => setIsWinningModalOpen(false)} title="Winning Bids">
          {winningCount > 0 ? (
            <ul className="winning-list">
              {Object.entries(lowestBids)
                .filter(([_, bid]) => bid && bid.participationId === participationId)
                .map(([productId, bid]) => {
                  const product = products.find(p => p.productId === Number(productId))
                  const pricePerUnit = (bid.price / (bid.quantity + bid.bonus)).toFixed(2)
                  return (
                    <li key={productId} className="winning-item">
                      <strong>{product?.productName}</strong> - R$ {bid.price.toFixed(2)} - R$ {pricePerUnit}/{product?.unitOfMeasure}
                    </li>
                  )
                })
              }
            </ul>
          ) : (
            <p>You are not winning any products right now.</p>
          )}
        </Modal>

      </div>
    )
}

export default SupplierQuotation