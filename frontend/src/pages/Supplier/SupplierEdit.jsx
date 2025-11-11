import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'
import { formatPhone } from '../../utils/formatPhone'
import { formatCnpj } from '../../utils/formatCnpj'

const SupplierEdit = ({supplier, onSave, onClose}) => {
    
    const { request } = useFetch("http://localhost:8080/api/v1")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { value: supplierName, setValue: setSupplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "Supplier Name")
    const { value: supplierEmail, setValue: setSupplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "Supplier Email")
    const { value: supplierWhatsappNumber, setValue: setSupplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, setValue: setEmployerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(45, "Company Name")
    const { value: employerCnpj, setValue: setEmployerCnpj, handleChange: handleEmployerCnpjChange, handleBlur: handleEmployerCnpjBlur, getNumericValue: getEmployerCnpjRaw, isInvalid: isEmployerCnpjInvalid } = useCnpjMask()

    useEffect(() => {
        if(supplier){
            setSupplierName(supplier.supplierName || "")
            setSupplierEmail(supplier.supplierEmail || "")
            setSupplierWhatsappNumber(formatPhone(supplier.supplierWhatsappNumber || ""))
            setEmployerName(supplier.employerName || "")
            setEmployerCnpj(formatCnpj(supplier.employerCnpj || ""))
        }
    }, [supplier])

    const isDisabled = 
        supplierNameWarning ||
        employerNameWarning ||
        !supplierName ||
        !supplierWhatsappNumber ||
        !employerName ||
        !employerCnpj ||
        isSupplierWhatsappNumberInvalid ||
        isEmployerCnpjInvalid

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!supplier) return

        if (supplierEmail && !/\S+@\S+\.\S+/.test(supplierEmail)) {
            setError("Email must be valid.");
            setSuccess("");
            return;
        }

        setError("")

        const body = {
            supplierName: supplierName.trim(),
            supplierEmail: supplierEmail ? supplierEmail.trim() : null,
            supplierWhatsappNumber: getSupplierWhatsappNumberRaw(),
            employerName: employerName.trim(),
            employerCnpj: getEmployerCnpjRaw(),
            companyCnpj: supplier.companyCnpj,
            createdAt: supplier.createdAt
        }

        const res = await request("PUT", `/suppliers/${supplier.supplierId}`, body)

        if(res.ok){
            setSuccess("Supplier updated successfully!")
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(res.data?.message || "Failed to update supplier")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label="Supplier Name" type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder="Enter Supplier Name" isInvalid={isSupplierNameInvalid} required />
            {supplierNameWarning && <div className="warning">{supplierNameWarning}</div>}
            
            <Input label="Supplier Email" type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder="Enter Supplier Email" isInvalid={isSupplierEmailInvalid} />
            {supplierEmail && supplierEmailWarning && <div className="warning">{supplierEmailWarning}</div>}

            <Input label="Supplier Whatsapp Number" type="text" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder="" isInvalid={isSupplierWhatsappNumberInvalid} required />
            {isSupplierWhatsappNumberInvalid && <div className="warning">Whatsapp number must be valid.</div>}

            <Input label="Company Name" type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder="Enter Company Name" isInvalid={isEmployerNameInvalid} required />
            {supplierNameWarning && <div className="warning">{supplierNameWarning}</div>}

            <Input label="Company Cnpj" type="text" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder="Enter Company CNPJ" isInvalid={isEmployerCnpjInvalid} required />
            {isEmployerCnpjInvalid && <div className="warning">Company CNPJ must be valid.</div>}
            
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>Save</Button>
        </form>
    )
}

export default SupplierEdit