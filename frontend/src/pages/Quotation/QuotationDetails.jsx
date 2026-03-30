import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'
import { formatDateTime } from '../../utils/formatDateTime'
import { CalendarClock, CalendarCheck, Gavel, Package, Users, Tag } from 'lucide-react'

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

            <div className="qd-meta-grid">
                <div className="qd-meta-card">
                    <div className="qd-meta-icon">
                        <CalendarClock size={18} />
                    </div>
                    <div className="qd-meta-content">
                        <span className="qd-meta-label">{t("quotation_start")}</span>
                        <span className="qd-meta-value">{start ? start.date : "-"}</span>
                        {start && <span className="qd-meta-sub">{start.time}</span>}
                    </div>
                </div>

                <div className="qd-meta-card">
                    <div className="qd-meta-icon">
                        <CalendarCheck size={18} />
                    </div>
                    <div className="qd-meta-content">
                        <span className="qd-meta-label">{t("quotation_end")}</span>
                        <span className="qd-meta-value">{end ? end.date : "-"}</span>
                        {end && <span className="qd-meta-sub">{end.time}</span>}
                    </div>
                </div>

                <div className="qd-meta-card">
                    <div className="qd-meta-icon">
                        <Gavel size={18} />
                    </div>
                    <div className="qd-meta-content">
                        <span className="qd-meta-label">{t("quotation_mode")}</span>
                        <span className="qd-meta-value">{quotationMode}</span>
                    </div>
                </div>
            </div>

            <div className="details-section">
                <div className="qd-section-header">
                    <Package size={16} />
                    <h4>{t("products_title_list")}</h4>
                    <span className="qd-count">{products.length}</span>
                </div>
                {products.length === 0 ? (
                    <p className="qd-empty">{t("quotation_no_products_linked")}</p>
                ) : (
                    <ul>
                        {products.map(p => (
                            <li key={p.productId} className="qd-product-item">
                                <span className="qd-product-name">{p.productName}</span>
                                <div className="qd-product-details">
                                    <span className="qd-product-qty">{p.quantity} UN</span>
                                    <span className="qd-product-detail-sep" aria-hidden="true" />
                                    {p.brand ? (
                                        <span className="qd-product-brand">
                                            <Tag size={12} />
                                            {p.brand}
                                        </span>
                                    ) : (
                                        <span className="qd-product-brand qd-product-brand--empty">
                                            {t("brand_not_defined")}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="details-section">
                <div className="qd-section-header">
                    <Users size={16} />
                    <h4>{t("suppliers_title_list")}</h4>
                    <span className="qd-count">{suppliers.length}</span>
                </div>
                {suppliers.length === 0 ? (
                    <p className="qd-empty">{t("quotation_no_suppliers_linked")}</p>
                ) : (
                    <ul>
                        {suppliers.map(s => (
                            <li key={s.supplierId} className="qd-supplier-item">
                                <div className="qd-supplier-avatar">
                                    {s.supplierName.charAt(0).toUpperCase()}
                                </div>
                                <div className="qd-supplier-info">
                                    <span className="qd-supplier-name">{s.supplierName}</span>
                                    <span className="qd-supplier-employer">{s.employerName}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default QuotationDetails
