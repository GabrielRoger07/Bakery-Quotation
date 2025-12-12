import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import Table from '../../components/Table'
import './QuotationMonitor.css'
import { ENV } from '../../config/env'

const QuotationMonitor = () => {

    const { t } = useTranslation()

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

    const formatTime = (ms) => {
        const days = Math.floor(ms / 86400000)
        const hours = Math.floor(ms % 86400000 / 3600000)
        const mins = Math.floor((ms % 3600000) / 60000)
        const secs = Math.floor((ms % 60000) / 1000)
        return days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`
    }

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
        {key: "productName", label: t("product")},
        {key: "productBarCodeNumber", label: t("barcode_number")},
        {key: "lowestBid", label: t("lowest_bid")},
        {key: "quantity", label: t("quantity")},
        {key: "bonus", label: t("bonus")},
        {key: "pricePerUnit", label: t("price_per_unit")},
        {key: "supplierName", label: t("supplier")},
        {key: "employerName", label: t("company")},
        {key: "employerCnpj", label: t("company_cnpj")},
    ], [])

    const bidColumns = useMemo(() => [
        {key: "supplierName", label: t("supplier")},
        {key: "employerName", label: t("company")},
        {key: "employerCnpj", label: t("company_cnpj")},
        {key: "productName", label: t("product")},
        {key: "productBarCodeNumber", label: t("barcode_number")},
        {key: "price", label: t("total_price")},
        {key: "quantity", label: t("quantity")},
        {key: "bonus", label: t("bonus")},
        {key: "pricePerUnit", label: t("price_per_unit")},
        {key: "status", label: "Status"},
        {key: "createdAt", label: t("date_hour")},
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
            status: isLowest ? <span>{t("lowest")}</span> : <span>{t("outbid")}</span>
        }
    })

    const totalEstimated = products.reduce((sum, p) => {
        if(!p.lowestBid || p.lowestBid === "-") return sum
        return sum + p.lowestBid
    }, 0)

    const formattedTotalEstimated = `R$ ${totalEstimated.toFixed(2)}`

    if(!quotation) return <p>{t("loading_message")}</p>

    return (
        <div className="quotation-monitor-container">
            <div className="monitor-header">
                <Button onClick={() => navigate(-1)}>{t("back_button")}</Button>
                <h2>{t("monitoring_quotation")} #{quotation.quotationId}</h2>
            </div>

            {quotation && (
            <div className="quotation-info">
                <p><strong>{t("start_uppercase")}:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                <p><strong>{t("end_uppercase")}:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
            </div>
            )}
            
            <div className="monitor-stats">
                <div>Status: {stats.status === 'Active' ? t("quotation_active") : stats.status === 'Scheduled' ? t("quotation_scheduled") : t("quotation_closed")}</div>
                {(stats.status === 'Active' || stats.status === 'Scheduled') && <div>{t("time_remaining")}: {stats.timeRemaining}</div>}
                <div>{t("total_bids")}: {stats.totalBids}</div>
                <div>{t("navbar_suppliers")}: {stats.uniqueSuppliers}</div>
                <div>{t("products_with_bids")}: {stats.productsWithBids.length}/{products.length}</div>
                <div className="total-highlight"><strong>Total:</strong> {formattedTotalEstimated}</div>
            </div>

            <div className="monitor-sections">
                    <Table
                        title={t("products_title_list")}
                        columns={productColumns}
                        data={formattedProducts}
                        loading={false}
                        emptyMessage={t("empty_products_quotation")}
                    />

                    <Table
                        title={t("bids_title_list")}
                        columns={bidColumns}
                        data={formattedBids}
                        loading={false}
                        emptyMessage={t("empty_bids_products")}
                    />
            </div>
        </div>
    )
}

export default QuotationMonitor