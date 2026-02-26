import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'
import { formatDateTime } from '../../utils/formatDateTime'

const QuotationDetails = ({ quotation }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [products, setProducts] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        if(!quotation) return

        const load = async () => {
            const resProducts = await request("GET", `/contains/${quotation.quotationId}`)

            if(resProducts.ok){
                setProducts(resProducts.data)
                setError("")
            }else{
                setError(t("quotation_fetch_products_fail"))
            }

            const resSuppliers = await request("GET", `/participations/quotations/${quotation.quotationId}`)

            if(resSuppliers.ok){
                setSuppliers(resSuppliers.data)
                setError("")
            }else{
                setError(t("quotation_fetch_suppliers_fail"))
            }
        }

        load()
    }, [quotation, request, t])

    if(!quotation) return null

    const start = formatDateTime(quotation.quotationStart)
    const end = formatDateTime(quotation.quotationEnd)
    const quotationMode = quotation.isAuction ? t("quotation_mode_auction") : t("quotation_mode_single_proposal")

    return (
        <div className="quotation-details-container">
            {error && <Alert message={error}/>}

            <h3>{t("quotation")} {quotation.quotationId}</h3>
            <p><strong>{t("quotation_start")}: </strong>{" "} {start ? `${start.date} • ${start.time}` : "-"}</p>
            <p><strong>{t("quotation_end")}: </strong>{" "} {end ? `${end.date} • ${end.time}` : "-"}</p>
            <p><strong>{t("quotation_mode")}: </strong>{" "} {quotationMode}</p>

            <div className="details-section">
                <h4>{t("products_title_list")}</h4>
                {products.length === 0 ? (
                    <p>{t("quotation_no_products_linked")}</p>
                ) : (
                    <ul>
                        {products.map(p => (
                            <li key={p.productId}>
                                {p.productBarCodeNumber} - {p.productName} - Qtd: {p.quantity} ({p.unitOfMeasure})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="details-section">
                <h4>{t("suppliers_title_list")}</h4>
                {suppliers.length === 0 ? (
                    <p>{t("quotation_no_suppliers_linked")}</p>
                ) : (
                    <ul>
                        {suppliers.map(s => (
                            <li key={s.supplierId}>
                                {s.supplierName} ({s.employerName})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default QuotationDetails
