import React, { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'

const SupplierCreate = () => {

    const [workerName, setWorkerName] = useState("")
    const [workerEmail, setWorkerEmail] = useState("")
    const [workerWhatsappNumber, setWorkerWhatsappNumber] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [companyCnpj, setCompanyCnpj] = useState("")
    const [errors, setErrors] = useState("")
    const [success, setSuccess] = useState("")

    const validate = () => {
        const newErrors = {}
        if(!workerName) newErrors.workerName = "Name is required"
        if(!workerWhatsappNumber) newErrors.workerWhatsappNumber = "Whatsapp Number is required"
        if(!companyName) newErrors.companyName = "Company Name is required"
        return newErrors
    }

    const handleSupplierCreate = async(e) => {
        e.preventDefault();

        const validationErrors = validate();
        if(validationErrors.length > 0){
            setErrors(validationErrors)
            setSuccess("")
            return
        }

        if (workerEmail && !/\S+@\S+\.\S+/.test(workerEmail)) {
            setErrors("Email must be valid.");
            setSuccess("");
            return;
        }

        // chamada da api
        setSuccess("Supplier created successfully!")
        console.log({ workerName, workerEmail, workerWhatsappNumber, companyName, companyCnpj })
    }

    return (
        <div className="supplier-create-container">
            <form onSubmit={handleSupplierCreate}>
                <Input label="Name" type="text" name="workerName" value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="Enter Supplier Name"/>
                <Input label="Email" type="email" name="workerEmail" value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} placeholder="Enter Supplier Email"/>
                <Input label="Whatsapp Number" type="text" name="workerWhatsappNumber" value={workerWhatsappNumber} onChange={(e) => setWorkerWhatsappNumber(e.target.value)} placeholder="Enter Whatsapp Number"/>
                <Input label="Company Name" type="text" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter Company Name"/>
                <Input label="Company Cnpj" type="text" name="companyCnpj" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} placeholder="Enter Company Cnpj"/>
                <Alert message={errors}/>
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Administrator</Button>
            </form>
        </div>
    )
}

export default SupplierCreate