import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import { ENV } from '../../config/env'
import './SupplierQuotation.css'

const SupplierPage = () => {

    const { t } = useTranslation()
    const { companyCnpj } = useParams()
    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [participations, setParticipations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const token = Cookies.get("supplierAccessToken")
        if (!token) {
            navigate(`/supplier/login/${companyCnpj}`)
            return
        }

        const fetchParticipations = async () => {
            setLoading(true)
            const res = await request("GET", `/participations/supplier`)
            if (res.ok) {
                setParticipations(res.data.content)
                setError("")
            } else if (res.status !== 403) {
                setError(t("supplier_quotations_load_error"))
            }
            setLoading(false)
        }

        fetchParticipations()
    }, [companyCnpj, navigate, request, t])

    const getStatus = (start, end) => {
        const now = new Date()
        if (now < new Date(start)) return { label: t("quotation_scheduled"), className: "status-scheduled" }
        if (now > new Date(end)) return { label: t("quotation_closed"), className: "status-closed" }
        return { label: t("quotation_active"), className: "status-active" }
    }

    const handleSelect = (participation) => {
        navigate(`/supplier/quotation?quotationId=${participation.quotationId}&participationId=${participation.participationId}`)
    }

    if (loading) return (
        <div className="page-container supplier-quotation-container">
            <p>{t("loading_message")}</p>
        </div>
    )

    if (error) return (
        <div className="page-container supplier-quotation-container">
            <p>{error}</p>
        </div>
    )

    return (
        <div className="page-container supplier-quotation-container">
            <h2>{t("supplier_quotations_title")}</h2>

            {participations.length === 0 ? (
                <p>{t("supplier_quotations_empty")}</p>
            ) : (
                <div className="supplier-quotations-list">
                    {participations.map((p) => {
                        const status = getStatus(p.quotationStart, p.quotationEnd)
                        return (
                            <div
                                key={p.quotationId}
                                className="supplier-quotation-card"
                                onClick={() => handleSelect(p)}
                            >
                                <div className="supplier-quotation-card-header">
                                    <span className="supplier-quotation-card-id">
                                        {t("quotation")} {new Date(p.quotationStart).toLocaleDateString("pt-BR")} - #{p.quotationId}
                                    </span>
                                    <span className={`supplier-quotation-status ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="supplier-quotation-card-dates">
                                    <p>
                                        <strong>{t("start_uppercase")}:</strong>{" "}
                                        {new Date(p.quotationStart).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>{t("end_uppercase")}:</strong>{" "}
                                        {new Date(p.quotationEnd).toLocaleString()}
                                    </p>
                                </div>

                                <span className="supplier-quotation-card-action">
                                    {t("view")} →
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SupplierPage