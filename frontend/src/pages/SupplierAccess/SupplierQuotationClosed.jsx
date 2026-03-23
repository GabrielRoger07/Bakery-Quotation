import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import useFetch from "../../hooks/useFetch"
import { ENV } from "../../config/env"
import Table from "../../components/Table"
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
                unitOfMeasure: product?.unitOfMeasure ?? "-",
                price: bid.price,
                quantity: bid.quantity,
                bonus: bid.bonus,
                pricePerUnit
            }
        })
    }, [lowestBids, products, participationId])

    const totalWinningValue = winningItems.reduce((sum, item) => sum + item.price, 0)

    const columns = useMemo(() => [
        { key: "productName", label: t("product")},
        { key: "quantity", label: t("quantity")},
        // { key: "bonus", label: t("bonus")},
        { key: "pricePerUnit", label: t("price_per_unit")},
        { key: "price", label: t("total_price")}
    ], [t])

    const formattedItems = winningItems.map(item => ({
        ...item,
        price: formatMoney(item.price, i18n.language),
        pricePerUnit: `${formatMoney(item.pricePerUnit, i18n.language)}/${item.unitOfMeasure}`
    }))

    if (loading) return <p>{t("loading_message")}</p>
    if (error) return <p>{error}</p>

    return (
        <div className="supplier-quotation-container">
            <h2>{t("quotation")} #{quotation.quotationId}</h2>
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
                        <Table
                            title={t("winning_bids")}
                            columns={columns}
                            data={formattedItems}
                            loading={false}
                            emptyMessage={t("not_won_bids")}
                        />

                        <div className="winning-total">
                            <strong>{t("total_value")}:</strong>{" "}
                            {formatMoney(totalWinningValue, i18n.language)}
                        </div>
                    </>
                )}

                <div style={{ marginTop: "1.5rem" }}>
                    <Button onClick={() => window.print()}>
                        {t("download_button")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SupplierQuotationClosed
