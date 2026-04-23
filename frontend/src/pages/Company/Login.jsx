import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'

const Login = () => {
    const { t } = useTranslation()

    const [companyEmail, setCompanyEmail] = useState("")
    const [companyPassword, setCompanyPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!companyEmail || !companyPassword) { setError(t("fill_all_fields")); return }
        if (!/\S+@\S+\.\S+/.test(companyEmail)) { setError(t("invalid_email")); return }
        setError("")
        const res = await request("POST", "/companies/login", { companyEmail, companyPassword })
        if (res.ok) {
            setSuccess(t("login_success"))
            setError("")
            Cookies.set("accessToken", res.data.accessToken, { secure: true, sameSite: "Strict" })
            setTimeout(() => navigate("/suppliers"), 1000)
        } else {
            setSuccess("")
            setError(res.status === 401 ? t("login_error") : t("connection_lost"))
        }
    }

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <h1 className="text-[1.5rem] mb-1 text-[var(--color-text-strong)] font-extrabold tracking-[-0.03em] leading-[1.15]">{t("login")}</h1>
                <form onSubmit={handleLogin}>
                    <Input label={t("email")} type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder={t("enter_email")} />
                    <Input label={t("password")} type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder={t("enter_password")} />
                    <Alert message={error} />
                    {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}
                    <Button type="submit" loading={loading}>{t("login")}</Button>
                </form>
                <p className="mt-5 mb-0 text-[0.875rem] text-[var(--color-text-muted)]">
                    <Link to="/register" className="text-[var(--color-accent)] no-underline font-semibold hover:underline">{t("new_company")}</Link>
                </p>
            </div>
        </div>
    )
}

export default Login