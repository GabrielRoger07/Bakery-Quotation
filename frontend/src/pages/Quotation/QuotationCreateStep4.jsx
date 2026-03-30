import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import { formatDateTime } from '../../utils/formatDateTime'
import { CalendarClock, CalendarCheck, Gavel, Package, Users, Tag } from 'lucide-react'
import './QuotationCreate.css'
import './QuotationList.css'

const QuotationCreateStep4 = ({ quotationData, onBack, onConfirm, loading }) => {
    const { t } = useTranslation()

    const start = useMemo(() => formatDateTime(quotationData.start), [quotationData.start])
    const end = useMemo(() => formatDateTime(quotationData.end), [quotationData.end])

    const modeLabel = quotationData.isAuction
        ? t("quotation_mode_auction")
        : t("quotation_mode_single_proposal")

    return (
        <div className="step-products">
            <h2>{t("quotation_step_4")}</h2>

            <div className="quotation-details-container">
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
                            <span className="qd-meta-value">{modeLabel}</span>
                        </div>
                    </div>
                </div>

                <div className="details-section">
                    <div className="qd-section-header">
                        <Package size={16} />
                        <h4>{t("products_title_list")}</h4>
                        <span className="qd-count">{quotationData.products.length}</span>
                    </div>
                    {quotationData.products.length === 0 ? (
                        <p className="qd-empty">{t("no_products_added")}</p>
                    ) : (
                        <ul>
                            {quotationData.products.map(p => (
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
                        <span className="qd-count">{quotationData.suppliers.length}</span>
                    </div>
                    {quotationData.suppliers.length === 0 ? (
                        <p className="qd-empty">{t("no_suppliers_added")}</p>
                    ) : (
                        <ul>
                            {quotationData.suppliers.map(s => (
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

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={onConfirm} disabled={loading}>
                    {loading ? t("saving_message") : t("save_button")}
                </Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep4
