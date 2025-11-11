import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'

const SupplierCreate = ({ onClose, onSave }) => {

    const { value: supplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "Supplier Name")
    const { value: supplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "Supplier Email")
    const { value: supplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(45, "Company Name")
    const { value: employerCnpj, handleChange: handleEmployerCnpjChange, handleBlur: handleEmployerCnpjBlur, getNumericValue: getEmployerCnpjRaw, isInvalid: isEmployerCnpjInvalid } = useCnpjMask()

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch("http://localhost:8080/api/v1")

    const isDisabled = 
        supplierNameWarning ||
        employerNameWarning ||
        !supplierName ||
        !supplierWhatsappNumber ||
        !employerName ||
        !employerCnpj ||
        isSupplierWhatsappNumberInvalid ||
        isEmployerCnpjInvalid

    const handleSupplierCreate = async(e) => {
        e.preventDefault();

        if (supplierEmail && !/\S+@\S+\.\S+/.test(supplierEmail)) {
            setError("Email must be valid.");
            setSuccess("");
            return;
        }

        setError("")

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        const supplier = {
            supplierName,
            supplierEmail: supplierEmail || null,
            supplierWhatsappNumber: getSupplierWhatsappNumberRaw(),
            employerName,
            employerCnpj: getEmployerCnpjRaw(),
            companyCnpj: cnpj
        }

        const res = await request("POST", "/suppliers", supplier)

        if(res.ok){
            setSuccess("Supplier created successfully!")
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <form onSubmit={handleSupplierCreate}>
            <Input label="Supplier Name" type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder="Enter Supplier Name" isInvalid={isSupplierNameInvalid} required />
            {supplierNameWarning && <div className="warning">{supplierNameWarning}</div>}
            
            <Input label="Supplier Email" type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder="Enter Supplier Email" isInvalid={isSupplierEmailInvalid} />
            {supplierEmail && supplierEmailWarning && <div className="warning">{supplierEmailWarning}</div>}
            
            <Input label="Whatsapp Number" type="text" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder="Enter Whatsapp Number" isInvalid={isSupplierWhatsappNumberInvalid} required />
            {isSupplierWhatsappNumberInvalid && <div className="warning">Whatsapp number must be valid.</div>}

            <Input label="Company Name" type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder="Enter Company Name" isInvalid={isEmployerNameInvalid} required />
            {employerNameWarning && <div className="warning">{employerNameWarning}</div>}

            <Input label="Company Cnpj" type="text" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder="Enter Company CNPJ" isInvalid={isEmployerCnpjInvalid} required />
            {isEmployerCnpjInvalid && <div className="warning">Company CNPJ must be valid.</div>}

            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>Create Supplier</Button>
        </form>
    )
}

export default SupplierCreate