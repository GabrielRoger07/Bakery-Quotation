import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'
import { formatPhone } from '../../utils/formatPhone'
import { formatCnpj } from '../../utils/formatCnpj'
import { ENV } from '../../config/env'

const SupplierEdit = ({supplier, onSave, onClose}) => {

    const { t } = useTranslation()
    
    const { request } = useFetch(ENV.API_BASE_URL)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { value: supplierName, setValue: setSupplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "t(supplier_name)")
    const { value: supplierEmail, setValue: setSupplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "t(supplier_email)")
    const { value: supplierWhatsappNumber, setValue: setSupplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, setValue: setEmployerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(45, "t(employer_name)")
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
            setError(t("invalid_email"));
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
            setSuccess(t("supplier_updated_success"))
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(t("supplier_updated_error"))
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label={t("supplier_name")} type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder={t("enter_supplier_name")} isInvalid={isSupplierNameInvalid} required />
            {supplierNameWarning && <div className="warning">{supplierNameWarning}</div>}
            
            <Input label={t("supplier_email")} type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder={t("enter_supplier_email")} isInvalid={isSupplierEmailInvalid} />
            {supplierEmail && supplierEmailWarning && <div className="warning">{supplierEmailWarning}</div>}

            <Input label={t("supplier_whatsapp")} type="text" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder={t("enter_supplier_whatsapp")} isInvalid={isSupplierWhatsappNumberInvalid} required />
            {isSupplierWhatsappNumberInvalid && <div className="warning">{t("invalid_whatsapp")}</div>}

            <Input label={t("employer_name")} type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder={t("enter_employer_name")} isInvalid={isEmployerNameInvalid} required />
            {supplierNameWarning && <div className="warning">{supplierNameWarning}</div>}

            <Input label={t("employer_cnpj")} type="text" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder={t("enter_employer_cnpj")} isInvalid={isEmployerCnpjInvalid} required />
            {isEmployerCnpjInvalid && <div className="warning">{t("invalid_cnpj")}</div>}
            
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>{t("save_button")}</Button>
        </form>
    )
}

export default SupplierEdit