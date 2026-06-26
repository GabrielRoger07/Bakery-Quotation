import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { ENV } from '@/config/env'

const SupplierAccessToken = () => {

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
            setError("Preencha todos os campos")
            return
        }

        setError("")

        const body = {
            supplierWhatsappNumber,
            supplierPassword
        }

        const res = await request("POST", `/suppliers/login/${companyCnpj}`, body)

        if (res.ok) {
            setSuccess("Login realizado com sucesso!")
            setError("")
            Cookies.set("supplierAccessToken", res.data.accessToken, { secure: true, sameSite: "Strict" })
            Cookies.set("supplierCompanyCnpj", companyCnpj, { secure: true, sameSite: "Strict" })
            setTimeout(() => navigate(`/supplier/quotations/${companyCnpj}`), 1000)
        } else {
            setSuccess("")
            setError(res.status === 401 ? "Whatsapp ou senha inválidos" : "Serviço temporariamente indisponível. Por favor, tente novamente mais tarde")
        }
    }

    if (!companyCnpj) return <p>URL de acesso inválida</p>

    return (
        <PageContainer variant="auth">
            <PageHeader
                title="Acesso do Fornecedor"
                subtitle="Entre com suas credenciais para acessar as cotações."
            />
            <form onSubmit={handleLogin}>
                <Input
                    label={"Whatsapp"}
                    type="text"
                    value={supplierWhatsappNumber}
                    onChange={e => setSupplierWhatsappNumber(e.target.value)}
                    placeholder={"Digite o Whatsapp do fornecedor"}
                />
                <Input
                    label={"Senha"}
                    type="password"
                    value={supplierPassword}
                    onChange={e => setSupplierPassword(e.target.value)}
                    placeholder={"Digite sua senha"}
                />
                <Alert message={error} />
                <Alert variant="success" message={success} />
                <Button type="submit" loading={loading}>Entrar</Button>
            </form>
        </PageContainer>
    )
}

export default SupplierAccessToken
