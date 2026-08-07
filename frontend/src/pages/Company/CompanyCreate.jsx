import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import useCharLimit from '@/hooks/useCharLimit'
import usePhoneMask from '@/hooks/usePhoneMask'
import useCnpjMask from '@/hooks/useCnpjMask'
import { charLimitMessage } from '@/utils/charLimitMessage'
import { ENV } from '@/config/env'

const CompanyCreate = () => {

    const { value: companyCnpj, handleChange: handleCnpjChange, handleBlur: handleCnpjBlur, getNumericValue: getCnpjRaw, isInvalid: isCnpjInvalid } = useCnpjMask("")
    const { value: companyName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(80, "Nome da Empresa")
    const { value: companyEmail, onChange: handleEmailChange, onBlur: handleEmailBlur, warning: emailWarning, isInvalid: isEmailInvalid } = useCharLimit(60, "E-mail da empresa")
    const { value: companyWhatsappNumber, handleChange: handleWhatsappChange, handleBlur: handleWhatsappBlur, getNumericValue: getWhatsappRaw, isInvalid: isWhatsappInvalid } = usePhoneMask("")
    const { value: companyPassword, onChange: handlePasswordChange, onBlur: handlePasswordBlur, warning: passwordWarning, isInvalid: isPasswordInvalid } = useCharLimit(255, "Senha", 6)

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate();

    const isDisabled = 
        nameWarning ||
        emailWarning ||
        passwordWarning ||
        !companyCnpj ||
        !companyName ||
        !companyEmail ||
        !companyWhatsappNumber ||
        !companyPassword ||
        isCnpjInvalid ||
        isWhatsappInvalid

    const handleCreateCompany = async (e) => {
        e.preventDefault();

        const email = companyEmail.trim()

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("E-mail inválido");
            setSuccess("");
            return;
        }

        setError("")

        const company = {
            companyCnpj: getCnpjRaw(),
            companyName: companyName.trim(),
            companyEmail: email,
            companyWhatsappNumber: getWhatsappRaw(),
            companyPassword
        }

        const res = await request("POST", "/companies/register", company)

        if(res.ok){
            setSuccess("Empresa cadastrada com sucesso!")
            setError("")
            setTimeout(() => navigate("/login"), 1000)
        }else{
            setSuccess("")
            setError("Não foi possível cadastrar a empresa. Por favor tente novamente.")
        }
    }

    return (
        <PageContainer variant="auth">
            <PageHeader title="Criar Conta" className="mb-1" />
            <form onSubmit={handleCreateCompany}>
                <Input label="CNPJ" type="text" inputMode="numeric" value={companyCnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} placeholder="Digite o CNPJ" isInvalid={isCnpjInvalid} error={isCnpjInvalid && "CNPJ inválido"} required />
                <Input label="Nome da Empresa" type="text" value={companyName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder="Digite o nome da empresa" isInvalid={isNameInvalid} error={charLimitMessage(nameWarning)} required />
                <Input label="E-mail da empresa" type="text" value={companyEmail} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="Digite o e-mail da empresa" isInvalid={isEmailInvalid} error={charLimitMessage(emailWarning)} required />
                <Input label="Número do Whatsapp" type="text" inputMode="numeric" value={companyWhatsappNumber} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder="Digite o número do Whatsapp" isInvalid={isWhatsappInvalid} error={isWhatsappInvalid && "Número de Whatsapp inválido"} required />
                <Input label="Senha" type="password" value={companyPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="Digite a senha" isInvalid={isPasswordInvalid} error={charLimitMessage(passwordWarning)} required />

                <Alert message={error} />
                <Alert variant="success" message={success} />
                <FormActions>
                    <Button type="submit" disabled={isDisabled} loading={loading}>Criar Conta</Button>
                </FormActions>
            </form>
            <p className="mt-5 mb-0 text-body text-[var(--color-text-muted)]">
                <Link to="/login" className="text-[var(--color-accent)] no-underline font-semibold hover:underline">Já possui uma conta? Entre!</Link>
            </p>
        </PageContainer>
    )
}

export default CompanyCreate