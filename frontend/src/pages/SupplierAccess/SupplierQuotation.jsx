import React, { useCallback, useEffect, useState } from 'react'
import QuotationProductItem from './QuotationProductItem'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'

const SupplierQuotation = ({ participationId, quotationId }) => {

  const { request } = useFetch("http://localhost:8080/api/v1")
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [lowestBids, setLowestBids] = useState([])

  useEffect(() => {

    const fetchProducts = async () => {
      setLoading(true)
      const res = await request("GET", `/contains/${quotationId}`)
      setLoading(false)

      if(res.ok){
        setProducts(res.data)
        setError("")

        res.data.forEach(async (product) => {
          console.log("valor de product id: " + product.productId)
          const bidRes = await request("GET", `/bids/lowest?participationId=${participationId}&productId=${product.productId}`)

          if(bidRes.ok){
            setLowestBids(prev => ({...prev, [product.productId]: bidRes.data}))
          }
        })

      }else{
        setError(res.data?.message || "Failed to load products")
      }
    }

    fetchProducts()

  }, [quotationId, participationId])

  const handleNewBid = useCallback((bid) => {
    console.log("oi")
    console.log(bid)
    setLowestBids(prev => {
      console.log("valor de prev: ", prev)
      console.log("valor de currentLowest: ", prev[bid.productId])
      const currentLowest = prev[bid.productId]
      //console.log("valor de currentLowest: " + currentLowest)
      if(!currentLowest || bid.price < currentLowest.price){
        return {...prev, [bid.productId]: bid }
      }
      //console.log("valor de prev aqui: " + prev)
      return prev
    })
  }, [])

  useWebSocket(quotationId, handleNewBid)

  if(loading) return <p>Loading products...</p>
  if(error) return <p>{error}</p>
  if(!products.length) return <p>No products found for this quotation</p>

  return (
      <div className="supplier-quotation">
        <h2>Quotation Products</h2>
        {products.map(product => (
          <QuotationProductItem key={product.productId} product={product} participationId={participationId} currentLowestBid={lowestBids[product.productId] || null} />
        ))}
      </div>
    )
}

export default SupplierQuotation