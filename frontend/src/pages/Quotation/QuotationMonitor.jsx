import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'
import Button from '../../components/Button'
import Table from '../../components/Table'
import './QuotationMonitor.css'
import { ENV } from '../../config/env'

const QuotationMonitor = () => {

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('id')

    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [quotation, setQuotation] = useState(null)
    const [products, setProducts] = useState([])
    const [bids, setBids] = useState([])

    const [stats, setStats] = useState({
        totalBids: 0,
        uniqueSuppliers: 0,
        productsWithBids: [],
        timeRemaining: '',
        status: ''
    })

    useEffect(() => {
        const fetchQuotationData = async () => {
            const quotationRes = await request("GET", `/quotations/${quotationId}`)

            if(quotationRes.ok){
                setQuotation(quotationRes.data)
            }

            const participationRes = await request("GET", `/participations/quotations/${quotationId}`)

            if(participationRes.ok){
                setStats(prev => ({...prev, uniqueSuppliers: participationRes.data.length}))
            }

            const containsRes = await request("GET", `/contains/${quotationId}`)

            if(containsRes.ok){
                setProducts(containsRes.data)
            }

            const bidsRes = await request("GET", `/bids/quotations/${quotationId}`)
            if(bidsRes.ok){
                setBids(bidsRes.data)
            }
        }

        fetchQuotationData()
    }, [quotationId])

    useEffect(() => {
        if(!quotation) return

        const start = new Date(quotation.quotationStart)
        const end = new Date(quotation.quotationEnd)

        const updateCountdown = () => {
            const now = new Date()
            if(now < start){
                const diff = start - now
                setStats(prev => ({...prev, status: 'Scheduled', timeRemaining: formatTime(diff)}))
            }else if(now >= start && now <= end){
                const diff = end - now
                setStats(prev => ({...prev, status: 'Active', timeRemaining: formatTime(diff)}))
            }else{
                setStats(prev => ({...prev, status: 'Closed', timeRemaining: 'Closed'}))
            }
        }

        const formatTime = (ms) => {
            const days = Math.floor(ms / 86400000)
            const hours = Math.floor(ms % 86400000 / 36000000)
            const mins = Math.floor((ms % 3600000) / 60000)
            const secs = Math.floor((ms % 60000) / 1000)
            return days > 0 ? `${days} days ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`
        }

        updateCountdown() 

        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
        
    }, [quotation])

    useEffect(() => {
        if(bids.length === 0) return

        const productsWithBids = [...new Set(bids.map(b => b.productId))]

        setStats(prev => ({
            ...prev, totalBids: bids.length, productsWithBids
        }))

    }, [bids])

    useEffect(() => {
        if(products.length === 0 || bids.length === 0) return

        const lowestBids = {}

        for(const bid of bids){
            const pricePerUnit = bid.price / (bid.quantity + bid.bonus)
            if(!lowestBids[bid.productId] || pricePerUnit < lowestBids[bid.productId].pricePerUnit){
                lowestBids[bid.productId] = { 
                    price: bid.price, 
                    quantity: bid.quantity, 
                    bonus: bid.bonus, 
                    supplierName: bid.supplierName,
                    employerName: bid.employerName,
                    employerCnpj: bid.employerCnpj,
                    pricePerUnit 
                }
            }
        }

        setProducts(prev => prev.map(p => {
            const lowest = lowestBids[p.productId]
            return lowest ? {
                ...p, 
                lowestBid: lowest.price, 
                bonus: lowest.bonus, 
                pricePerUnit: lowest.pricePerUnit,
                supplierName: lowest.supplierName || "-",
                employerName: lowest.employerName || "-",
                employerCnpj: lowest.employerCnpj || "-"
            } : 
            {
                ...p,
                lowestBid: null,
                bonus: "-",
                pricePerUnit: "-",
                supplierName: "-",
                employerName: "-",
                employerCnpj: "-"
            }
        }))
    }, [products.length, bids.length])

    const handleNewBid = useCallback(bid => {

        const pricePerUnit = bid.price / (bid.quantity + bid.bonus)

        setBids(prev => [bid, ...prev])
        setProducts(prev => 
            prev.map(p => 
                p.productId === bid.productId 
                    ? {
                        ...p, 
                        ...( !p.pricePerUnit || pricePerUnit < p.pricePerUnit
                            ? {
                                lowestBid: bid.price,
                                bonus: bid.bonus,
                                pricePerUnit,
                                supplierName: bid.supplierName,
                                employerName: bid.employerName,
                                employerCnpj: bid.employerCnpj
                            } : {}
                        )
                    } 
                    : p
                )
            )
    }, [])

    useWebSocket(quotationId, handleNewBid)

    const productColumns = useMemo(() => [
        {key: "productName", label: "Product"},
        {key: "productBarCodeNumber", label: "Barcode Number"},
        {key: "lowestBid", label: "Lowest Bid"},
        {key: "quantity", label: "Quantity"},
        {key: "bonus", label: "Bonus"},
        {key: "pricePerUnit", label: "Price Per Unit"},
        {key: "supplierName", label: "Supplier"},
        {key: "employerName", label: "Company"},
        {key: "employerCnpj", label: "Company CNPJ"},
    ], [])

    const bidColumns = useMemo(() => [
        {key: "supplierName", label: "Supplier"},
        {key: "employerName", label: "Company"},
        {key: "employerCnpj", label: "Company CNPJ"},
        {key: "productName", label: "Product"},
        {key: "productBarCodeNumber", label: "Barcode Number"},
        {key: "price", label: "Total Price"},
        {key: "quantity", label: "Quantity"},
        {key: "bonus", label: "Bonus"},
        {key: "pricePerUnit", label: "Price Per Unit"},
        {key: "status", label: "Status"},
        {key: "createdAt", label: "Date/Hour"},
    ], [])

    const formattedProducts = products.map(p => ({
        ...p, 
        lowestBid: p.lowestBid ? `R$ ${p.lowestBid.toFixed(2)}` : "-",
        bonus: p.bonus ?? "-",
        pricePerUnit: p.pricePerUnit && p.pricePerUnit !== "-" ? `R$ ${p.pricePerUnit.toFixed(2)}` : "-",
        supplierName: p.supplierName || "-",
        employerName: p.employerName || "-",
        employerCnpj: p.employerCnpj || "-"
    }))

    const formattedBids = bids.map(b => {

        const lowest = products.find(p => p.productId === b.productId)?.lowestBid
        const isLowest = lowest && b.price === lowest

        return {
            ...b, 
            price: `R$ ${b.price.toFixed(2)}`, 
            pricePerUnit: `R$ ${((b.price) / (b.quantity + b.bonus)).toFixed(2)}`,
            createdAt: new Date(b.createdAt).toLocaleString(),
            status: isLowest ? <span>Lowest</span> : <span>Outbid</span>
        }
    })

    if(!quotation) return <p>Loading...</p>

    return (
        <div className="quotation-monitor-container">
            <div className="monitor-header">
                <Button onClick={() => navigate(-1)}>Back</Button>
                <h2>Monitoring Quotation #{quotation.quotationId}</h2>
            </div>

            {quotation && (
            <div className="quotation-info">
                <p><strong>Start:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
            </div>
            )}
            
            <div className="monitor-stats">
                <div>Status: {stats.status}</div>
                {(stats.status === 'Active' || stats.status === 'Scheduled') && <div>Time remaining: {stats.timeRemaining}</div>}
                <div>Total bids: {stats.totalBids}</div>
                <div>Suppliers: {stats.uniqueSuppliers}</div>
                <div>Products with bids: {stats.productsWithBids.length}/{products.length}</div>
            </div>

            <div className="monitor-sections">
                    <Table
                        title="Quotation Products"
                        columns={productColumns}
                        data={formattedProducts}
                        loading={false}
                        emptyMessage="No products found for this quotation."
                    />

                    <Table
                        title="Bids"
                        columns={bidColumns}
                        data={formattedBids}
                        loading={false}
                        emptyMessage="No bids found for this quotation."
                    />
            </div>
        </div>
    )
}

export default QuotationMonitor