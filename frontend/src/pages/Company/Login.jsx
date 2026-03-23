import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
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
        e.preventDefault();

        if(!companyEmail || !companyPassword){
            setError(t("fill_all_fields"));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError(t("invalid_email"));
            return;
        }

        setError("")

        const login = {
            companyEmail,
            companyPassword
        }

        const res = await request("POST", "/companies/login", login)

        if(res.ok){
            setSuccess(t("login_success"))
            setError("")
            const accessToken = res.data.accessToken
            Cookies.set("accessToken", accessToken, { secure: true, sameSite: "Strict" })
            setTimeout(() => navigate("/suppliers"), 1000)
        }else{
            setSuccess("")
            setError(res.status === 401 ? t("login_error") : t("connection_lost"))
        }
    }

    return (
        <div className='auth-container'>
            <div className='auth-box'>
                <h1>{t("login")}</h1>
                <form onSubmit={handleLogin}>
                    <Input label={t("email")} type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder={t("enter_email")} />
                    <Input label={t("password")} type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder={t("enter_password")} />
                    <Alert message={error} />
                    {success && <div className="success">{success}</div>}
                    <Button type="submit" loading={loading}>{t("login")}</Button>
                </form>
                {/*
                <p><a href="#">Forgot your password?</a></p>
                */}
                <p>
                    <Link to="/register">{t("new_company")}</Link>
                </p>
            </div>
        </div>
    )
}

export default Login