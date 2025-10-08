import React, { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'

const SupplierCreate = () => {

    const [supplierName, setSupplierName] = useState("")
    const [supplierEmail, setSupplierEmail] = useState("")
    const [supplierWhatsappNumber, setSupplierWhatsappNumber] = useState("")
    const [employerName, setEmployerName] = useState("")
    const [employerCnpj, setEmployerCnpj] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {}
        if(!supplierName) newErrors.supplierName = "Supplier name is required"
        if(!supplierWhatsappNumber) newErrors.supplierWhatsappNumber = "Supplier whatsapp number is required"
        if(!employerName) newErrors.employerName = "Employer name is required"
        return newErrors
    }

    const handleSupplierCreate = async(e) => {
        e.preventDefault();

        const validationErrors = validate();
        if(validationErrors.length > 0){
            setError(validationErrors)
            setSuccess("")
            return
        }

        if (supplierEmail && !/\S+@\S+\.\S+/.test(supplierEmail)) {
            setError("Email must be valid.");
            setSuccess("");
            return;
        }

        setError("")

        // chamar a api
        const supplier = {

            supplierName,
            supplierEmail,
            supplierWhatsappNumber,
            employerName,
            employerCnpj,
            companyCnpj: "05203425000111"
        }

        const res = await request("POST", "/suppliers", supplier)

        if(res.ok){
            setSuccess("Supplier created successfully!")
            setError("")
            setTimeout(() => navigate("/suppliers"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <div className="supplier-create-container">
        <h1>Supplier Create</h1>
            <form onSubmit={handleSupplierCreate}>
                <Input label="Name" type="text" name="supplierName" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Enter Supplier Name"/>
                <Input label="Email" type="email" name="supplierEmail" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} placeholder="Enter Supplier Email"/>
                <Input label="Whatsapp Number" type="text" name="supplierWhatsappNumber" value={supplierWhatsappNumber} onChange={(e) => setSupplierWhatsappNumber(e.target.value)} placeholder="Enter Whatsapp Number"/>
                <Input label="Company Name" type="text" name="employerName" value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Enter Employer Company Name"/>
                <Input label="Company Cnpj" type="text" name="employerCnpj" value={employerCnpj} onChange={(e) => setEmployerCnpj(e.target.value)} placeholder="Enter Employer Company Cnpj"/>
                <Alert message={error}/>
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Supplier</Button>
            </form>
        </div>
    )
}

export default SupplierCreate