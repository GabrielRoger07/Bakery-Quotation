import React, { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'

const AdministratorCreate = () => {

    const [workerName, setWorkerName] = useState("")
    const [workerEmail, setWorkerEmail] = useState("")
    const [workerWhatsappNumber, setWorkerWhatsappNumber] = useState("")
    const [workerPassword, setWorkerPassword] = useState("")
    const [position, setPosition] = useState("")
    const [companyCnpj, setCompanyCnpj] = useState("")
    const [errors, setErrors] = useState("")
    const [success, setSuccess] = useState("")

    const validate = () => {
        const newErrors = {}
        if(!workerName) newErrors.workerName = "Name is required"
        if(!workerEmail) newErrors.workerEmail = "Email is required"
        if(!workerWhatsappNumber) newErrors.workerWhatsappNumber = "Whatsapp Number is required"
        if(!workerPassword) newErrors.workerPassword = "Password is required"
        if(!companyCnpj) newErrors.companyCnpj = "Company CNPJ is required"
        return newErrors
    }

    const handleCreateAdministrator = async (e) => {
        e.preventDefault()

        const validationErrors = validate()
        if(validationErrors.length > 0){
            setErrors(validationErrors)
            setSuccess("")
        }

        if (workerEmail && !/\S+@\S+\.\S+/.test(workerEmail)) {
            setErrors("Email must be valid.");
            setSuccess("");
            return;
        }

        // chamada da api
        setSuccess("Administrator created successfully!")
        console.log({ workerName, workerEmail, workerPassword, workerWhatsappNumber, position, companyCnpj })
    }

    return (
        <div className="administrator-create-container">
            <form onSubmit={handleCreateAdministrator}>
                <Input label="Name" type="text" name="workerName" value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="Enter Worker Name"/>
                <Input label="Email" type="email" name="workerEmail" value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} placeholder="Enter Worker Email"/>
                <Input label="Whatsapp Number" type="text" name="workerWhatsappNumber" value={workerWhatsappNumber} onChange={(e) => setWorkerName(e.target.value)} placeholder="Enter Worker Name"/>
                <Input label="Password" type="password" name="workerPassword" value={workerPassword} onChange={(e) => setWorkerPassword(e.target.value)} placeholder="Enter Worker Password"/>
                <Input label="Position" type="text" name="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Enter Worker Position"/>
                <Input label="Company CNPJ" type="text" name="companyCnpj" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} placeholder="Enter Company CNPJ"/>
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Administrator</Button>
            </form>
        </div>
    )
}

export default AdministratorCreate