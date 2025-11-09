import { useCallback, useEffect, useMemo, useState } from 'react'
import useWebSocket from '../../hooks/useWebSocket'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import QuotationProductItem from './QuotationProductItem'
import './SupplierQuotation.css'

const SupplierQuotation = ({ participationId, quotationId }) => {

  const { request } = useFetch("http://localhost:8080/api/v1")
  const [products, setProducts] = useState([]) 
  const [bids, setBids] = useState([]) 
  const [lowestBids, setLowestBids] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
        <p>Total Products: <strong>{products.length}</strong>{" "} | Winning: <strong style={{color: "#1a7f37"}}>{winningCount}</strong>/{products.length}</p>

        <div className="supplier-products">
          {products.map(product => (
            <QuotationProductItem key={product.productId} product={product} participationId={participationId} currentLowestBid={lowestBids[product.productId] || null} />
          ))}
        </div>

        <div className="supplier-bids">
          <Table title="Your bids" columns={bidColumns} data={formattedBids} loading={loading} emptyMessage="You haven't placed any bids yet."/>
        </div>

      </div>
    )
}

export default SupplierQuotation