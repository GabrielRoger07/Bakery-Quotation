import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
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
        
        const email = companyEmail.trim()
        if (!email || !companyPassword) { setError("Preencha todos os campos"); return }
        if (!/^\S+@\S+\.\S+$/.test(email)) { setError("E-mail inválido"); return }
        setError("")

        const body = {
            companyEmail: email,
            companyPassword
        }

        const res = await request("POST", "/companies/login", body)
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
        <PageContainer variant="auth">
            <PageHeader title="Entrar" className="mb-1" />
            <form onSubmit={handleLogin}>
                <Input label="E-mail" type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="Digite seu e-mail" />
                <Input label="Senha" type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder="Digite sua senha" />
                <Alert message={error} />
                <Alert variant="success" message={success} />
                <Button type="submit" loading={loading}>Entrar</Button>
            </form>
            <p className="mt-5 mb-0 text-body text-[var(--color-text-muted)]">
                <Link to="/register" className="text-[var(--color-accent)] no-underline font-semibold hover:underline">Nova empresa? Criar conta!</Link>
            </p>
        </PageContainer>
    )
}

export default Login