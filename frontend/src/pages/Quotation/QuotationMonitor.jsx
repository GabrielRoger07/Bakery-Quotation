import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import Table from '../../components/Table'
import './QuotationMonitor.css'
import { ENV } from '../../config/env'
import { formatCnpj } from '../../utils/formatCnpj'
import { formatMoney } from '../../utils/formatMoney'
import { X, FileDown } from 'lucide-react'
import Cookies from 'js-cookie'

const QuotationMonitor = () => {

    const { t, i18n } = useTranslation()

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('id')

    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [quotation, setQuotation] = useState(null)
    const [products, setProducts] = useState([])
    const [bids, setBids] = useState([])

    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState({ field: "", word: "" })
    const [bidFilter, setBidFilter] = useState("all")

    const [bidSearchField, setBidSearchField] = useState("")
    const [bidSearchWord, setBidSearchWord] = useState("")
    const [appliedBidSearch, setAppliedBidSearch] = useState({ field: "", word: "" })

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
    }, [quotationId, request])

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
        if(bids.length === 0) return

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

        setProducts(prev => {
            if(prev.length === 0) return prev

            return prev.map(p => {
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
            })
        })
    }, [bids])

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
        // {key: "productBarCodeNumber", label: t("barcode_number")},
        {key: "quantity", label: t("quantity")},
        {key: "brand", label: t("brand")},
        // {key: "bonus", label: t("bonus")},
        {key: "lowestBid", label: t("lowest_bid")},
        {key: "pricePerUnit", label: t("price_per_unit")},
        {key: "supplierName", label: t("supplier")},
        {key: "employerName", label: t("company")},
        {key: "employerCnpj", label: t("company_cnpj")},
    ], [t])

    const bidColumns = useMemo(() => [
        {key: "productName", label: t("product")},
        // {key: "productBarCodeNumber", label: t("barcode_number")},
        {key: "quantity", label: t("quantity")},
        // {key: "bonus", label: t("bonus")},
        {key: "supplierName", label: t("supplier")},
        {key: "employerName", label: t("company")},
        {key: "employerCnpj", label: t("company_cnpj")},
        {key: "price", label: t("total_price")},
        {key: "pricePerUnit", label: t("price_per_unit")},
        {key: "createdAt", label: t("date_hour")},
        {key: "status", label: "Status"},
    ], [t])

    const handleSearch = useCallback(() => {
        setAppliedSearch({ field: searchField, word: searchWord })
    }, [searchField, searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchField("")
        setSearchWord("")
        setAppliedSearch({ field: "", word: "" })
        setBidFilter("all")
    }, [])

    const filteredProducts = useMemo(() => {
        let result = products

        if (appliedSearch.word) {
            const term = appliedSearch.word.toLowerCase()
            if (!appliedSearch.field || appliedSearch.field === "productName") {
                result = result.filter(p => p.productName?.toLowerCase().includes(term))
            } else {
                const matchingProductIds = new Set(
                    bids
                        .filter(b => b[appliedSearch.field]?.toString().toLowerCase().includes(term))
                        .map(b => b.productId)
                )
                result = result.filter(p => matchingProductIds.has(p.productId))
            }
        }

        if (bidFilter === "with") {
            const productIdsWithBids = new Set(bids.map(b => b.productId))
            result = result.filter(p => productIdsWithBids.has(p.productId))
        } else if (bidFilter === "without") {
            const productIdsWithBids = new Set(bids.map(b => b.productId))
            result = result.filter(p => !productIdsWithBids.has(p.productId))
        }

        return result
    }, [products, bids, appliedSearch, bidFilter])

    const handleBidSearch = useCallback(() => {
        setAppliedBidSearch({ field: bidSearchField, word: bidSearchWord })
    }, [bidSearchField, bidSearchWord])

    const handleClearBidSearch = useCallback(() => {
        setBidSearchField("")
        setBidSearchWord("")
        setAppliedBidSearch({ field: "", word: "" })
    }, [])

    const filteredBids = useMemo(() => {
        const matchingProductIds = new Set(filteredProducts.map(p => p.productId))
        let result = bids.filter(b => matchingProductIds.has(b.productId))

        if (appliedBidSearch.word) {
            const term = appliedBidSearch.word.toLowerCase()
            const field = appliedBidSearch.field
            if (!field || field === "productName") {
                result = result.filter(b => b.productName?.toLowerCase().includes(term))
            } else {
                result = result.filter(b => b[field]?.toString().toLowerCase().includes(term))
            }
        }

        return result
    }, [bids, filteredProducts, appliedBidSearch])

    const filterToolbar = useMemo(() => (
        <>
            <div className="search-select-wrapper">
                <select value={searchField} onChange={e => setSearchField(e.target.value)} className="custom-select">
                    <option value="">{t("select_field")}</option>
                    <option value="productName">{t("product_name")}</option>
                    <option value="supplierName">{t("supplier_name_label")}</option>
                    <option value="employerName">{t("employer_name")}</option>
                    <option value="employerCnpj">{t("employer_cnpj")}</option>
                </select>
                <span className="select-arrow"></span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("enter_search")}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <div className="segmented-control">
                <button className={`segmented-btn${bidFilter === "all" ? " segmented-active" : ""}`} onClick={() => setBidFilter("all")}>{t("filter_all")}</button>
                <button className={`segmented-btn${bidFilter === "with" ? " segmented-active" : ""}`} onClick={() => setBidFilter("with")}>{t("filter_with_bids")}</button>
                <button className={`segmented-btn${bidFilter === "without" ? " segmented-active" : ""}`} onClick={() => setBidFilter("without")}>{t("filter_without_bids")}</button>
            </div>
            <Button onClick={handleSearch}>{t("search_button")}</Button>
            {(appliedSearch.word || bidFilter !== "all") && (
                <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>
            )}
        </>
    ), [searchField, searchWord, appliedSearch, bidFilter, handleSearch, handleClearSearch, t])

    const bidFilterToolbar = useMemo(() => (
        <>
            <div className="search-select-wrapper">
                <select value={bidSearchField} onChange={e => setBidSearchField(e.target.value)} className="custom-select">
                    <option value="">{t("select_field")}</option>
                    <option value="productName">{t("product_name")}</option>
                    <option value="supplierName">{t("supplier_name_label")}</option>
                    <option value="employerName">{t("employer_name")}</option>
                    <option value="employerCnpj">{t("employer_cnpj")}</option>
                </select>
                <span className="select-arrow"></span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={bidSearchWord}
                onChange={e => setBidSearchWord(e.target.value)}
                placeholder={t("enter_search")}
                onKeyDown={e => { if (e.key === "Enter") handleBidSearch() }}
            />
            <Button onClick={handleBidSearch}>{t("search_button")}</Button>
            {appliedBidSearch.word && (
                <Button variant="danger" onClick={handleClearBidSearch}><X size={16} /></Button>
            )}
        </>
    ), [bidSearchField, bidSearchWord, appliedBidSearch, handleBidSearch, handleClearBidSearch, t])

    const formattedProducts = [...filteredProducts]
        .sort((a, b) => a.productName?.localeCompare(b.productName, i18n.language))
        .map(p => ({
        ...p,
        brand: p.brand || "-",
        lowestBid: p.lowestBid ? formatMoney(p.lowestBid, i18n.language) : "-",
        bonus: p.bonus ?? "-",
        pricePerUnit: p.pricePerUnit && p.pricePerUnit !== "-" ? formatMoney(p.pricePerUnit, i18n.language) : "-",
        supplierName: p.supplierName || "-",
        employerName: p.employerName || "-",
        employerCnpj: p.employerCnpj && p.employerCnpj !== "-" ? formatCnpj(p.employerCnpj) : "-"
    }))

    const formattedBids = filteredBids.map(b => {

        const lowest = products.find(p => p.productId === b.productId)?.lowestBid
        const isLowest = lowest && b.price === lowest

        return {
            ...b, 
            price: formatMoney(b.price, i18n.language), 
            pricePerUnit: formatMoney((b.price) / (b.quantity + b.bonus), i18n.language),
            employerCnpj: b.employerCnpj ? formatCnpj(b.employerCnpj) : "-",
            createdAt: new Date(b.createdAt).toLocaleString(),
            status: isLowest ? <span style={{color: "green"}}>{t("lowest")}</span> : <span style={{color: "red"}}>{t("outbid")}</span>
        }
    })

    const totalEstimated = products.reduce((sum, p) => {
        if(!p.lowestBid || p.lowestBid === "-") return sum
        return sum + p.lowestBid
    }, 0)

    const formattedTotalEstimated = formatMoney(totalEstimated, i18n.language)

    const handlePrintPdf = useCallback(async () => {
        const token = Cookies.get('accessToken')
        const response = await fetch(`${ENV.API_BASE_URL}/quotations/${quotationId}/report`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) return
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cotacao-${quotationId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }, [quotationId])

    if(!quotation) return <p>{t("loading_message")}</p>

    return (
        <div className="quotation-monitor-container">
            <div className={`monitor-header${stats.status === 'Closed' ? ' monitor-header--with-action' : ''}`}>
                <Button onClick={() => navigate(-1)}>{t("back_button")}</Button>
                <h2>{t("monitoring_quotation")} #{quotation.quotationId}</h2>
                <div className="header-action-slot">
                    {stats.status === 'Closed' && (
                        <Button onClick={handlePrintPdf} variant="success" className="export-report-btn">
                            <FileDown size={16} />
                            {t("export_report_button")}
                        </Button>
                    )}
                </div>
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
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== "" || bidFilter !== "all"}
                    />

                    <Table
                        title={t("bids_title_list")}
                        columns={bidColumns}
                        data={formattedBids}
                        loading={false}
                        emptyMessage={t("empty_bids_quotation")}
                        toolbar={bidFilterToolbar}
                        filterActive={appliedBidSearch.word !== ""}
                    />
            </div>
        </div>
    )
}

export default QuotationMonitor
