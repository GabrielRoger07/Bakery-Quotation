import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import useFetch from "../../hooks/useFetch"
import { ENV } from "../../config/env"
import Button from "../../components/Button"
import "./SupplierQuotation.css"
import { formatMoney } from "../../utils/formatMoney"

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


    if (loading) return <p>{t("loading_message")}</p>
    if (error) return <p>{error}</p>

    return (
        <div className="supplier-quotation-container">
            <h2>{t("quotation")} {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotation.quotationId}</h2>
            <h3>{t("quotation_closed")}</h3>

            <div className="quotation-info">
                <p>
                    <strong>{t("start_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationStart).toLocaleString()}
                </p>
                <p>
                    <strong>{t("end_uppercase")}:</strong>{" "}
                    {new Date(quotation.quotationEnd).toLocaleString()}
                </p>
            </div>

            <div className="winning-content">
                {winningItems.length === 0 ? (
                    <p>{t("not_won_bids")}</p>
                ) : (
                    <>
                        

                        <div className="single-proposal-card">
                            <h4 className="winning-bids-title">{t("winning_bids")}</h4>
                            <div className="proposal-review-table-wrapper">
                                <table className="proposal-review-table">
                                    <thead>
                                        <tr>
                                            <th>{t("product")}</th>
                                            <th>{t("brand")}</th>
                                            <th className="proposal-review-num">{t("quantity")}</th>
                                            <th className="proposal-review-num">{t("price_per_unit")}</th>
                                            <th className="proposal-review-num">{t("total_price")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {winningItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.productName}</td>
                                                <td>
                                                    {item.brand
                                                        ? item.brand
                                                        : <span className="proposal-review-brand--empty">-</span>
                                                    }
                                                </td>
                                                <td className="proposal-review-num">{item.quantity} UN</td>
                                                <td className="proposal-review-num">{formatMoney(item.pricePerUnit, i18n.language)}/UN</td>
                                                <td className="proposal-review-num proposal-review-total">{formatMoney(item.price, i18n.language)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={4} className="proposal-review-grand-label">{t("total_value")}</td>
                                            <td className="proposal-review-num proposal-review-grand-total">{formatMoney(totalWinningValue, i18n.language)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                <div className="winning-actions">
                    <Button onClick={() => window.print()}>
                        {t("export_report_button")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SupplierQuotationClosed
