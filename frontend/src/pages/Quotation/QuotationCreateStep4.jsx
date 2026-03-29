import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import './QuotationCreate.css'

const QuotationCreateStep4 = ({ quotationData, onBack, onConfirm, loading }) => {
    const { t } = useTranslation()

    const formattedStart = useMemo(() => {
        if (!quotationData.start) return "-"
        return new Date(quotationData.start).toLocaleString()
    }, [quotationData.start])

    const formattedEnd = useMemo(() => {
        if (!quotationData.end) return "-"
        return new Date(quotationData.end).toLocaleString()
    }, [quotationData.end])

    const modeLabel = quotationData.isAuction
        ? t("quotation_mode_auction")
        : t("quotation_mode_single_proposal")

    return (
        <div className="step-products">
            <h2>{t("quotation_step_4")}</h2>

            <div className="review-section">
                <h4>{t("quotation_step_1")}</h4>
                <div className="review-info-grid">
                    <div className="review-info-item">
                        <span className="review-label">{t("quotation_start_date")}</span>
                        <span className="review-value">{formattedStart}</span>
                    </div>
                    <div className="review-info-item">
                        <span className="review-label">{t("quotation_end_date")}</span>
                        <span className="review-value">{formattedEnd}</span>
                    </div>
                    <div className="review-info-item">
                        <span className="review-label">{t("quotation_mode")}</span>
                        <span className="review-value">{modeLabel}</span>
                    </div>
                </div>
            </div>

            <div className="review-section">
                <h4>{t("products_added")} ({quotationData.products.length})</h4>
                {quotationData.products.length === 0 ? (
                    <p className="empty-state">{t("no_products_added")}</p>
                ) : (
                    <div className="review-table-wrapper">
                        <table className="review-table">
                            <thead>
                                <tr>
                                    <th>{t("product")}</th>
                                    <th>{t("description")}</th>
                                    <th className="review-num">{t("quantity")}</th>
                                    <th>{t("brand")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotationData.products.map(p => (
                                    <tr key={p.productId}>
                                        <td>{p.productName}</td>
                                        <td className="review-desc">{p.productDescription || "-"}</td>
                                        <td className="review-num">{p.quantity} UN</td>
                                        <td>{p.brand || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="review-section">
                <h4>{t("suppliers_added")} ({quotationData.suppliers.length})</h4>
                {quotationData.suppliers.length === 0 ? (
                    <p className="empty-state">{t("no_suppliers_added")}</p>
                ) : (
                    <ul className="review-suppliers-list">
                        {quotationData.suppliers.map(s => (
                            <li key={s.supplierId} className="review-supplier-item">
                                <strong>{s.supplierName}</strong>
                                <span>{s.employerName}</span>
                            </li>
                        ))}
                    </ul>
                )}
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
