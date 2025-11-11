import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'

const CompanyCreate = () => {

    const { value: companyCnpj, handleChange: handleCnpjChange, handleBlur: handleCnpjBlur, getNumericValue: getCnpjRaw, isInvalid: isCnpjInvalid } = useCnpjMask("")
    const { value: companyName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(45, "Company Name")
    const { value: companyEmail, onChange: handleEmailChange, onBlur: handleEmailBlur, warning: emailWarning, isInvalid: isEmailInvalid } = useCharLimit(60, "Company Email")
    const { value: companyWhatsappNumber, handleChange: handleWhatsappChange, handleBlur: handleWhatsappBlur, getNumericValue: getWhatsappRaw, isInvalid: isWhatsappInvalid } = usePhoneMask("")
    const { value: companyPassword, onChange: handlePasswordChange, onBlur: handlePasswordBlur, warning: passwordWarning, isInvalid: isPasswordInvalid } = useCharLimit(255, "Company Password")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const isDisabled = 
        nameWarning ||
        emailWarning ||
        passwordWarning ||
        !companyCnpj ||
        !companyName ||
        !companyEmail ||
        !companyWhatsappNumber ||
        !companyPassword

    const handleCreateCompany = async (e) => {
        e.preventDefault();

        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError("Email must be valid.");
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
            setSuccess("Company created successfully!")
            setError("")
            setTimeout(() => navigate("/"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Create Company</h1>
                <form onSubmit={handleCreateCompany}>
                    <Input label="CNPJ" type="text" value={companyCnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} placeholder="Enter CNPJ" isInvalid={isCnpjInvalid} required />
                    {isCnpjInvalid && <div className="warning">CNPJ must be valid.</div>}

                    <Input label="Company Name" type="text" value={companyName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder="Enter Company Name" isInvalid={isNameInvalid} required />
                    {nameWarning && <div className="warning">{nameWarning}</div>}

                    <Input label="Company E-mail" type="text" value={companyEmail} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="Enter Company Email" isInvalid={isEmailInvalid} required />
                    {emailWarning && <div className="warning">{emailWarning}</div>}

                    <Input label="Whatsapp Number" type="text" value={companyWhatsappNumber} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder="Enter Whatsapp Number" isInvalid={isWhatsappInvalid} required />
                    {isWhatsappInvalid && <div className="warning">Whatsapp number must be valid.</div>}

                    <Input label="Company Password" type="password" value={companyPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="Enter Password" isInvalid={isPasswordInvalid} required />
                    {passwordWarning && <div className="warning">{passwordWarning}</div>}

                    <Alert message={error} />
                    {success && <div className="success">{success}</div>}
                    <Button type="submit" disabled={isDisabled}>Create Company</Button>
                </form>
                <p>
                    <Link to="/login">Already have an account? Login!</Link>
                </p>
            </div>
        </div>
    )
}

export default CompanyCreate