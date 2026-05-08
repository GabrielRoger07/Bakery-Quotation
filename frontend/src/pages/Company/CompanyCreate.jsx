import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import useCharLimit from '@/hooks/useCharLimit'
import usePhoneMask from '@/hooks/usePhoneMask'
import useCnpjMask from '@/hooks/useCnpjMask'
import { ENV } from '@/config/env'

const CompanyCreate = () => {

    const { value: companyCnpj, handleChange: handleCnpjChange, handleBlur: handleCnpjBlur, getNumericValue: getCnpjRaw, isInvalid: isCnpjInvalid } = useCnpjMask("")
    const { value: companyName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(80, "Nome da Empresa")
    const { value: companyEmail, onChange: handleEmailChange, onBlur: handleEmailBlur, warning: emailWarning, isInvalid: isEmailInvalid } = useCharLimit(60, "E-mail da empresa")
    const { value: companyWhatsappNumber, handleChange: handleWhatsappChange, handleBlur: handleWhatsappBlur, getNumericValue: getWhatsappRaw, isInvalid: isWhatsappInvalid } = usePhoneMask("")
    const { value: companyPassword, onChange: handlePasswordChange, onBlur: handlePasswordBlur, warning: passwordWarning, isInvalid: isPasswordInvalid } = useCharLimit(255, "Senha", 6)

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)
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

        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError("E-mail inválido");
            setSuccess("");
            return;
        }

        setError("")

        const company = {
            companyCnpj: getCnpjRaw(),
            companyName,
            companyEmail,
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
        <div className="auth-bg">
            <div className="auth-card">
                <h1 className="text-[1.5rem] mb-1 text-[var(--color-text-strong)] font-extrabold tracking-[-0.03em] leading-[1.15]">Criar Conta</h1>
                <form onSubmit={handleCreateCompany}>
                    <Input label="CNPJ" type="text" value={companyCnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} placeholder={"Digite o CNPJ"} isInvalid={isCnpjInvalid} required />
                    {isCnpjInvalid && <div className="text-[var(--color-danger-strong)] text-[0.8125rem] font-medium -mt-1 mb-[0.625rem]">CNPJ inválido</div>}

                    <Input label={"Nome da Empresa"} type="text" value={companyName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={"Digite o nome da empresa"} isInvalid={isNameInvalid} required />
                    {nameWarning && (
                        <div className="text-[var(--color-danger-strong)] text-[0.8125rem] font-medium -mt-1 mb-[0.625rem]">
                            {nameWarning.type === "too_short" && `É permitido ter no mínimo ${nameWarning.min} caracteres para ${nameWarning.fieldName}.`}
                            {nameWarning.type === "too_long" && `É permitido ter no máximo ${nameWarning.max} caracteres para ${nameWarning.fieldName}.`}
                        </div>
                    )}

                    <Input label={"E-mail da empresa"} type="text" value={companyEmail} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder={"Digite o e-mail da empresa"} isInvalid={isEmailInvalid} required />
                    {emailWarning && (
                        <div className="text-[var(--color-danger-strong)] text-[0.8125rem] font-medium -mt-1 mb-[0.625rem]">
                            {emailWarning.type === "too_short" && `É permitido ter no mínimo ${emailWarning.min} caracteres para ${emailWarning.fieldName}.`}
                            {emailWarning.type === "too_long" && `É permitido ter no máximo ${emailWarning.max} caracteres para ${emailWarning.fieldName}.`}
                        </div>
                    )}

                    <Input label={"Número do Whatsapp"} type="text" value={companyWhatsappNumber} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder={"Digite o número do Whatsapp"} isInvalid={isWhatsappInvalid} required />
                    {isWhatsappInvalid && <div className="text-[var(--color-danger-strong)] text-[0.8125rem] font-medium -mt-1 mb-[0.625rem]">Número de Whatsapp inválido</div>}

                    <Input label={"Senha"} type="password" value={companyPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder={"Digite a senha"} isInvalid={isPasswordInvalid} required />
                    {passwordWarning && (
                        <div className="text-[var(--color-danger-strong)] text-[0.8125rem] font-medium -mt-1 mb-[0.625rem]">
                            {passwordWarning.type === "too_short" && `É permitido ter no mínimo ${passwordWarning.min} caracteres para ${passwordWarning.fieldName}.`}
                            {passwordWarning.type === "too_long" && `É permitido ter no máximo ${passwordWarning.max} caracteres para ${passwordWarning.fieldName}.`}
                        </div>
                    )}

                    <Alert message={error} />
                    {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}
                    <Button type="submit" disabled={isDisabled}>Criar Conta</Button>
                </form>
                <p className="mt-5 mb-0 text-[0.875rem] text-[var(--color-text-muted)]">
                    <Link to="/login" className="text-[var(--color-accent)] no-underline font-semibold hover:underline">Já possui uma conta? Entre!</Link>
                </p>
            </div>
        </div>
    )
}

export default CompanyCreate