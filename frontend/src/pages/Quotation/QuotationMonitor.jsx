import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useWebSocket from '../../hooks/useWebSocket'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import Table from '../../components/Table'
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
        {key: "quantity", label: t("quantity")},
        {key: "brand", label: t("brand")},
        {key: "lowestBid", label: t("lowest_bid")},
        {key: "pricePerUnit", label: t("price_per_unit")},
        {key: "supplierName", label: t("supplier")},
        {key: "employerName", label: t("company")},
        {key: "employerCnpj", label: t("company_cnpj")},
    ], [t])

    const bidColumns = useMemo(() => [
        {key: "productName", label: t("product")},
        {key: "quantity", label: t("quantity")},
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

    const segBtnCls = (active) => [
        'px-3 py-[0.4rem] text-[0.875rem] font-medium font-sans border-none cursor-pointer whitespace-nowrap transition-[background-color,color] duration-[160ms] not-last:border-r not-last:border-[var(--color-border)]',
        active
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-surface-0)] text-[var(--color-text-neutral)] hover:bg-[var(--color-surface-1)]',
    ].join(' ')

    const filterToolbar = useMemo(() => (
        <>
            <div className="relative">
                <select value={searchField} onChange={e => setSearchField(e.target.value)} className="toolbar-select">
                    <option value="">{t("select_field")}</option>
                    <option value="productName">{t("product_name")}</option>
                    <option value="supplierName">{t("supplier_name_label")}</option>
                    <option value="employerName">{t("employer_name")}</option>
                    <option value="employerCnpj">{t("employer_cnpj")}</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </div>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("enter_search")}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <div className="flex border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
                <button className={segBtnCls(bidFilter === "all")} onClick={() => setBidFilter("all")}>{t("filter_all")}</button>
                <button className={segBtnCls(bidFilter === "with")} onClick={() => setBidFilter("with")}>{t("filter_with_bids")}</button>
                <button className={segBtnCls(bidFilter === "without")} onClick={() => setBidFilter("without")}>{t("filter_without_bids")}</button>
            </div>
            <Button onClick={handleSearch}>{t("search_button")}</Button>
            {(appliedSearch.word || bidFilter !== "all") && (
                <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>
            )}
        </>
    ), [searchField, searchWord, appliedSearch, bidFilter, handleSearch, handleClearSearch, t])

    const bidFilterToolbar = useMemo(() => (
        <>
            <div className="relative">
                <select value={bidSearchField} onChange={e => setBidSearchField(e.target.value)} className="toolbar-select">
                    <option value="">{t("select_field")}</option>
                    <option value="productName">{t("product_name")}</option>
                    <option value="supplierName">{t("supplier_name_label")}</option>
                    <option value="employerName">{t("employer_name")}</option>
                    <option value="employerCnpj">{t("employer_cnpj")}</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
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
            status: isLowest
                ? <span className="text-[var(--color-success)] font-semibold">{t("lowest")}</span>
                : <span className="text-[var(--color-danger)] font-semibold">{t("outbid")}</span>
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
        <div className="page-wrapper text-[var(--color-text-primary)]">
            {/* Header */}
            <div className={`grid items-center w-full mb-[1.125rem] ${stats.status === 'Closed' ? 'grid-cols-[auto_1fr_auto] max-[768px]:grid-cols-[auto_1fr_auto] max-[768px]:grid-rows-[auto_auto] max-[768px]:gap-x-2 max-[768px]:gap-y-4' : 'grid-cols-[auto_1fr_auto]'}`}>
                <Button onClick={() => navigate(-1)}>{t("back_button")}</Button>
                <h2 className={`m-0 text-center text-[1.25rem] font-bold text-[var(--color-text-strong)] tracking-[-0.02em] max-[768px]:text-[1.125rem] ${stats.status === 'Closed' ? 'max-[768px]:col-span-full max-[768px]:row-start-2' : ''}`}>
                    {t("monitoring_quotation")} #{quotation.quotationId}
                </h2>
                <div className="flex justify-end min-w-0">
                    {stats.status === 'Closed' && (
                        <Button
                            onClick={handlePrintPdf}
                            variant="success"
                            className="flex items-center gap-[0.375rem] whitespace-nowrap [animation:exportAppear_0.3s_ease]"
                        >
                            <FileDown size={16} />
                            {t("export_report_button")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Quotation info */}
            <div className="flex justify-center items-center gap-6 bg-[var(--color-surface-0)] border border-[var(--color-border)] [box-shadow:var(--shadow-xs)] px-[1.125rem] py-3 rounded-[var(--radius-lg)] mb-4 text-[0.875rem] text-[var(--color-text-neutral)] w-full max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.375rem]">
                <p className="m-0"><strong>{t("start_uppercase")}:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
                <p className="m-0"><strong>{t("end_uppercase")}:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-6 gap-3 bg-[var(--color-surface-0)] w-full px-[1.125rem] py-[1.125rem] rounded-[var(--radius-xl)] border border-[var(--color-border)] [box-shadow:var(--shadow-card-soft)] mb-[1.375rem] text-center max-[1080px]:grid-cols-3 max-[768px]:grid-cols-2 max-[520px]:grid-cols-1">
                {[
                    { label: `Status: ${stats.status === 'Active' ? t("quotation_active") : stats.status === 'Scheduled' ? t("quotation_scheduled") : t("quotation_closed")}` },
                    ...(stats.status === 'Active' || stats.status === 'Scheduled' ? [{ label: `${t("time_remaining")}: ${stats.timeRemaining}` }] : []),
                    { label: `${t("total_bids")}: ${stats.totalBids}` },
                    { label: `${t("navbar_suppliers")}: ${stats.uniqueSuppliers}` },
                    { label: `${t("products_with_bids")}: ${stats.productsWithBids.length}/${products.length}` },
                    { label: `Total: ${formattedTotalEstimated}`, highlight: true },
                ].map((item, i) => (
                    <div key={i} className={`rounded-[var(--radius-lg)] border px-2 py-[0.875rem] text-[1rem] font-semibold flex items-center justify-center text-center min-h-[4.5rem] transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)] ${item.highlight ? 'bg-[var(--color-highlight-lighter)] border-[var(--color-highlight-border)] text-[var(--color-accent)] font-bold text-[1.125rem]' : 'bg-[var(--color-surface-1)] border-[var(--color-border-lighter)] text-[var(--color-text-neutral-strong)]'}`}>
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Tables */}
            <div className="flex flex-col items-center w-full gap-1">
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
