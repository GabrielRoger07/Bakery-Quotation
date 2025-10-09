import React, { useState } from 'react'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'

const CompanyCreate = () => {

    const [companyCnpj, setCompanyCnpj] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [companyEmail, setCompanyEmail] = useState("")
    const [companyWhatsappNumber, setCompanyWhatsappNumber] = useState("")
    const [companyPassword, setCompanyPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const handleCreateCompany = async (e) => {
        e.preventDefault();

        if(!companyCnpj || !companyName || !companyWhatsappNumber || !companyEmail || !companyPassword){
            setError("All fields are required")
            setSuccess("")
            return
        }

        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError("Email must be valid.");
            setSuccess("");
            return;
        }

        setError("")

        // chamar a api
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
        <div className="company-create-container">
            <h1>Create Company</h1>
            <form onSubmit={handleCreateCompany}>
                <Input label="CNPJ" type="text" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} placeholder="Enter CNPJ"/>
                <Input label="Company Name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter Company Name"/>
                <Input label="Company E-mail" type="text" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="Enter Company Email"/>
                <Input label="Whatsapp Number" type="text" value={companyWhatsappNumber} onChange={(e) => setCompanyWhatsappNumber(e.target.value)} placeholder="Enter Whatsapp Number"/>
                <Input label="Company Password" type="password" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder="Enter Password"/>
                <Alert message={error} />
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Company</Button>
            </form>
        </div>
    )
}

export default CompanyCreate