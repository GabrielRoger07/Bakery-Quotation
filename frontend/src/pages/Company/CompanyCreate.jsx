import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
import useCharLimit from '../../hooks/useCharLimit'

const CompanyCreate = () => {

    const { value: companyCnpj, onChange: handleCnpjChange, onBlur: handleCnpjBlur, warning: cnpjWarning } = useCharLimit(14, "CNPJ")
    const { value: companyName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning } = useCharLimit(45, "Company Name")
    const { value: companyEmail, onChange: handleEmailChange, onBlur: handleEmailBlur, warning: emailWarning } = useCharLimit(60, "Company Email")
    const { value: companyWhatsappNumber, onChange: handleWhatsappChange, onBlur: handleWhatsappBlur, warning: whatsappWarning } = useCharLimit(16, "Whatsapp Number")
    const { value: companyPassword, onChange: handlePasswordChange, onBlur: handlePasswordBlur, warning: passwordWarning } = useCharLimit(255, "Company Password")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const isDisabled = 
        cnpjWarning ||
        nameWarning ||
        emailWarning ||
        whatsappWarning ||
        passwordWarning ||
        !companyCnpj ||
        !companyName ||
        !companyEmail ||
        !companyWhatsappNumber ||
        !companyPassword

    const handleCreateCompany = async (e) => {
        e.preventDefault();

        /*
        if(!companyCnpj || !companyName || !companyWhatsappNumber || !companyEmail || !companyPassword){
            setError("All fields are required")
            setSuccess("")
            return
        }
        */

        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError("Email must be valid.");
            setSuccess("");
            return;
        }

        setError("")

        const company = {
            companyCnpj,
            companyName,
            companyEmail,
            companyWhatsappNumber,
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
                    <Input label="CNPJ" type="text" value={companyCnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} placeholder="Enter CNPJ" required />
                    {cnpjWarning && <div className="warning">{cnpjWarning}</div>}

                    <Input label="Company Name" type="text" value={companyName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder="Enter Company Name" required />
                    {nameWarning && <div className="warning">{nameWarning}</div>}

                    <Input label="Company E-mail" type="text" value={companyEmail} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="Enter Company Email" required />
                    {emailWarning && <div className="warning">{emailWarning}</div>}

                    <Input label="Whatsapp Number" type="text" value={companyWhatsappNumber} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder="Enter Whatsapp Number" required />
                    {whatsappWarning && <div className="warning">{whatsappWarning}</div>}

                    <Input label="Company Password" type="password" value={companyPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="Enter Password" required />
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