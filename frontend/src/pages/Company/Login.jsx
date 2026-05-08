import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { ENV } from '@/config/env'

const Login = () => {
    
    const [companyEmail, setCompanyEmail] = useState("")
    const [companyPassword, setCompanyPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!companyEmail || !companyPassword) { setError("Preencha todos os campos"); return }
        if (!/\S+@\S+\.\S+/.test(companyEmail)) { setError("E-mail inválido"); return }
        setError("")
        const res = await request("POST", "/companies/login", { companyEmail, companyPassword })
        if (res.ok) {
            setSuccess("Login realizado com sucesso!")
            setError("")
            Cookies.set("accessToken", res.data.accessToken, { secure: true, sameSite: "Strict" })
            setTimeout(() => navigate("/suppliers"), 1000)
        } else {
            setSuccess("")
            setError(res.status === 401 ? "E-mail ou senha inválidos" : "Serviço temporariamente indisponível. Por favor, tente novamente mais tarde")
        }
    }

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <h1 className="text-[1.5rem] mb-1 text-[var(--color-text-strong)] font-extrabold tracking-[-0.03em] leading-[1.15]">Entrar</h1>
                <form onSubmit={handleLogin}>
                    <Input label={"E-mail"} type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder={"Digite seu e-mail"} />
                    <Input label={"Senha"} type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder={"Digite sua senha"} />
                    <Alert message={error} />
                    {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}
                    <Button type="submit" loading={loading}>Entrar</Button>
                </form>
                <p className="mt-5 mb-0 text-[0.875rem] text-[var(--color-text-muted)]">
                    <Link to="/register" className="text-[var(--color-accent)] no-underline font-semibold hover:underline">Nova empresa? Criar conta!</Link>
                </p>
            </div>
        </div>
    )
}

export default Login