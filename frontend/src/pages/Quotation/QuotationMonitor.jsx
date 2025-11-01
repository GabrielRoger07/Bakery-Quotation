import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'
import Button from '../../components/Button'
import Table from '../../components/Table'

const QuotationMonitor = () => {

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('id')

    const navigate = useNavigate()
    const { request } = useFetch("http://localhost:8080/api/v1")

    const [quotation, setQuotation] = useState(null)
    const [products, setProducts] = useState([])
    const [stats, setStats] = useState({
        totalBids: 0,
        productsWithBids: [],
        timeRemaining: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            const quotationRes = await request("GET", `/quotations/${quotationId}`)

            if(quotationRes.ok){
                setQuotation(quotationRes.data)
            }

            const containsRes = await request("GET", `/contains/${quotationId}`)

            if(containsRes.ok){
                setProducts(containsRes.data)
            }
        }

        fetchData()
    }, [quotationId])

    useEffect(() => {
        if(!quotation) return

        const end = new Date(quotation.quotationEnd)
        const interval = setInterval(() => {
            const now = new Date()
            const diff = end - now
            if(diff <= 0){
                setStats(prev => ({...prev, timeRemaining: "Ended"}))
                clearInterval(interval)
            }else{
                const days = Math.floor(diff / 86400000)
                const hours = Math.floor(diff % 86400000 / 36000000)
                const mins = Math.floor((diff % 3600000) / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                setStats(prev => ({...prev, timeRemaining: `${days}days ${hours}h ${mins}m ${secs}s` }))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [quotation])

    const handleNewBid = useCallback(bid => {
        setProducts(prev => prev.map(p => p.productId === bid.productId ? {...p, lowestBid: bid.price, supplierName: bid.supplierName || "Unknown"} : p))
        setStats(prev => ({...prev, totalBids: prev.totalBids + 1, productsWithBids: [...new Set([...prev.productsWithBids, bid.productId])]}))
    }, [])

    useWebSocket(quotationId, handleNewBid)

    if(!quotation) return <p>Loading...</p>

    const productColumns = [
        {key: "productName", label: "Product"},
        {key: "quantity", label: "Quantity"},
        {key: "bonusLimit", label: "Bonus Limit"},
        {key: "lowestBid", label: "Lowest Bid"},
        {key: "supplierName", label: "Supplier"},
    ]

    const formattedProducts = products.map(p => ({
        ...p, 
        lowestBid: p.lowestBid ? `R$ ${p.lowestBid}` : "-", 
        supplierName: p.supplierName || "-"
    }))

    return (
        <div className="quotation-monitor-container">
            <div>
                <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
            <h2 className="text-xl font-semibold mb-2">Monitoring Quotation #{quotation.quotationId}</h2>
            
            <div className="stats">
                <div>Time remaining: {stats.timeRemaining}</div>
                <div>Total bids: {stats.totalBids}</div>
                <div>Products with bids: {stats.productsWithBids.length}</div>
            </div>

            <Table
                title="Quotation Products"
                columns={productColumns}
                data={formattedProducts}
                loading={false}
                emptyMessage="No products found for this quotation."
            />
        </div>
    )
}

export default QuotationMonitor