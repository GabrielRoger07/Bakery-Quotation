import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
import { ENV } from '../../config/env'

const SupplierAccessToken = () => {

    const { t } = useTranslation()

    const navigate = useNavigate()
    const { companyCnpj } = useParams()

    const [supplierWhatsappNumber, setSupplierWhatsappNumber] = useState("")
    const [supplierPassword, setSupplierPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch(ENV.API_BASE_URL)

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!supplierWhatsappNumber || !supplierPassword) {
            setError(t("fill_all_fields"))
            return
        }

        setError("")

        const body = {
            supplierWhatsappNumber,
            supplierPassword
        }

        const res = await request("POST", `/suppliers/login/${companyCnpj}`, body)

        if (res.ok) {
            setSuccess(t("login_success"))
            setError("")
            Cookies.set("supplierAccessToken", res.data.accessToken)
            setTimeout(() => navigate(`/supplier/quotations/${companyCnpj}`), 1000)
        } else {
            setSuccess("")
            setError(res.status === 401 ? t("supplier_login_error") : t("connection_lost"))
        }
    }

    if (!companyCnpj) return <p>{t("supplier_login_invalid_url")}</p>

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>{t("supplier_login_title")}</h1>
                <p className="auth-subtitle">{t("supplier_login_subtitle")}</p>
                <form onSubmit={handleLogin}>
                    <Input
                        label={t("supplier_whatsapp")}
                        type="text"
                        value={supplierWhatsappNumber}
                        onChange={e => setSupplierWhatsappNumber(e.target.value)}
                        placeholder={t("enter_supplier_whatsapp")}
                    />
                    <Input
                        label={t("password")}
                        type="password"
                        value={supplierPassword}
                        onChange={e => setSupplierPassword(e.target.value)}
                        placeholder={t("enter_password")}
                    />
                    <Alert message={error} />
                    {success && <div className="success">{success}</div>}
                    <Button type="submit" loading={loading}>{t("login")}</Button>
                </form>
            </div>
        </div>
    )
}

export default SupplierAccessToken
