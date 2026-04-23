import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import useFetch from "../../hooks/useFetch"
import { ENV } from "../../config/env"
import Button from "../../components/Button"
import { formatMoney } from "../../utils/formatMoney"
import Cookies from "js-cookie"

const thCls = "text-left px-[0.6rem] py-2 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)] border-b-2 border-[var(--color-border)]"
const thNumCls = `${thCls} text-right`
const tdCls = "px-[0.6rem] py-[0.55rem] text-[var(--color-text-default)] border-b border-[var(--color-border-lighter)] align-middle"
const tdNumCls = `${tdCls} text-right whitespace-nowrap`

const SupplierQuotationClosed = ({ quotation, participationId }) => {

    const { t, i18n } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [products, setProducts] = useState([])
    const [lowestBids, setLowestBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchFinalResults = async () => {
            setLoading(true)

            const resProducts = await request("GET", `/contains/${quotation.quotationId}`)
            if(!resProducts.ok) {
                setError(t("load_products_failed"))
                setLoading(false)
                return
            }

            const productsData = resProducts.data
            setProducts(productsData)

            const bidsMap = {}

            for(const product of productsData){
                const bidRes = await request("GET", `/bids/lowest?quotationId=${quotation.quotationId}&productId=${product.productId}`)

                if(bidRes.ok && bidRes.data){
                    bidsMap[product.productId] = bidRes.data
                }
            }

            setLowestBids(bidsMap)
            setLoading(false)
        }

        fetchFinalResults()
    }, [quotation.quotationId, request, t])

    const winningItems = useMemo(() => {
        return Object.entries(lowestBids)
        .filter(([_, bid]) => bid && bid.participationId === participationId)
        .map(([productId, bid]) => {
            const product = products.find(p => p.productId === Number(productId))
            const pricePerUnit = bid.price / (bid.quantity + bid.bonus)

            return {
                productName: product?.productName ?? "-",
                brand: product?.brand || null,
                price: bid.price,
                quantity: bid.quantity,
                bonus: bid.bonus,
                pricePerUnit
            }
        })
    }, [lowestBids, products, participationId])

    const totalWinningValue = winningItems.reduce((sum, item) => sum + item.price, 0)

    const handleDownloadReport = useCallback(async () => {
        const token = Cookies.get('supplierAccessToken')
        const response = await fetch(`${ENV.API_BASE_URL}/participations/${participationId}/report`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) return
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lances-${participationId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }, [participationId])

    if (loading) return <p>{t("loading_message")}</p>
    if (error) return <p>{error}</p>

    return (
        <div className="page-wrapper text-[var(--color-text-primary)]">
            <h2 className="text-[var(--color-text-strong)] text-[1.25rem] m-0">
                {t("quotation")} {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotation.quotationId}
            </h2>
            <h3 className="text-[var(--color-text-secondary)] mt-1 mb-4">{t("quotation_closed")}</h3>

            <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-0)] border border-[var(--color-border)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.4rem]">
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-strong)]">{t("start_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationStart).toLocaleString()}
                </p>
                <p className="m-0 text-[1rem]">
                    <strong className="text-[1.125rem] text-[var(--color-text-strong)]">{t("end_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationEnd).toLocaleString()}
                </p>
            </div>

            <div className="flex flex-col items-center flex-grow justify-center pb-60 w-full">
                {winningItems.length === 0 ? (
                    <p className="text-[var(--color-text-secondary)]">{t("not_won_bids")}</p>
                ) : (
                    <div className="w-full bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] p-4">
                        <h4 className="m-0 mb-3 text-[var(--color-text-strong)]">{t("winning_bids")}</h4>
                        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                            <table className="w-full border-collapse text-[0.875rem]">
                                <thead>
                                    <tr>
                                        <th className={thCls}>{t("product")}</th>
                                        <th className={thCls}>{t("brand")}</th>
                                        <th className={thNumCls}>{t("quantity")}</th>
                                        <th className={thNumCls}>{t("price_per_unit")}</th>
                                        <th className={thNumCls}>{t("total_price")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winningItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className={tdCls}>{item.productName}</td>
                                            <td className={tdCls}>
                                                {item.brand ? item.brand : <span className="text-[var(--color-text-muted)] italic">-</span>}
                                            </td>
                                            <td className={tdNumCls}>{item.quantity} UN</td>
                                            <td className={tdNumCls}>{formatMoney(item.pricePerUnit, i18n.language)}/UN</td>
                                            <td className={`${tdNumCls} font-medium text-[var(--color-text-strong)]`}>{formatMoney(item.price, i18n.language)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="px-[0.6rem] py-[0.6rem] text-right text-[0.875rem] text-[var(--color-text-secondary)] font-semibold border-t-2 border-[var(--color-border)]">{t("total_value")}</td>
                                        <td className="px-[0.6rem] py-[0.6rem] text-right text-[1rem] text-[var(--color-accent-strong)] font-bold whitespace-nowrap border-t-2 border-[var(--color-border)]">{formatMoney(totalWinningValue, i18n.language)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <Button onClick={handleDownloadReport}>
                        {t("export_report_button")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SupplierQuotationClosed
