import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'
import { ENV } from '../../config/env'

const SupplierCreate = ({ onClose, onSave }) => {

    const { t } = useTranslation()

    const { value: supplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "supplier_name")
    const { value: supplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "supplier_email")
    const { value: supplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(65, "company_name")
    const { value: employerCnpj, handleChange: handleEmployerCnpjChange, handleBlur: handleEmployerCnpjBlur, getNumericValue: getEmployerCnpjRaw, isInvalid: isEmployerCnpjInvalid } = useCnpjMask()

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)

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
            setError(t("invalid_email"));
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
            setSuccess(t("supplier_created_success"))
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            console.log(res.data)
            if(res.data.message === "Employer CNPJ must be valid"){
                setError(t("invalid_cnpj"))
            } else {
                setError(t("supplier_created_error"))
            }
        }
    }

    return (
        <form onSubmit={handleSupplierCreate}>
            <Input label={t("supplier_name")} type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder={t("enter_supplier_name")} isInvalid={isSupplierNameInvalid} required />
            {supplierNameWarning && (
                <div className="warning">
                    {supplierNameWarning.type === "too_short" &&
                        t("char_limit_too_short", { min: supplierNameWarning.min, field: t(supplierNameWarning.fieldName) })
                    }

                    {supplierNameWarning.type === "too_long" &&
                        t("char_limit_too_long", { max: supplierNameWarning.max, field: t(supplierNameWarning.fieldName) })
                    }
                </div>
            )}
            
            <Input label={t("supplier_email")} type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder={t("enter_supplier_email")} isInvalid={isSupplierEmailInvalid} />
            {supplierEmail && supplierEmailWarning && (
                <div className="warning">
                    {supplierEmailWarning.type === "too_short" &&
                        t("char_limit_too_short", { min: supplierEmailWarning.min, field: t(supplierEmailWarning.fieldName) })
                    }

                    {supplierEmailWarning.type === "too_long" &&
                        t("char_limit_too_long", { max: supplierEmailWarning.max, field: t(supplierEmailWarning.fieldName) })
                    }
                </div>
            )}
            
            <Input label={t("supplier_whatsapp")}  type="text" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder={t("enter_supplier_whatsapp")} isInvalid={isSupplierWhatsappNumberInvalid} required />
            {isSupplierWhatsappNumberInvalid && <div className="warning">{t("invalid_whatsapp")}</div>}

            <Input label={t("employer_name")} type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder={t("enter_employer_name")} isInvalid={isEmployerNameInvalid} required />
            {employerNameWarning && (
                <div className="warning">
                    {employerNameWarning.type === "too_short" &&
                        t("char_limit_too_short", { min: employerNameWarning.min, field: t(employerNameWarning.fieldName) })
                    }

                    {employerNameWarning.type === "too_long" &&
                        t("char_limit_too_long", { max: employerNameWarning.max, field: t(employerNameWarning.fieldName) })
                    }
                </div>
            )}

            <Input label={t("employer_cnpj")} type="text" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder={t("enter_employer_cnpj")} isInvalid={isEmployerCnpjInvalid} required />
            {isEmployerCnpjInvalid && <div className="warning">{t("invalid_cnpj")}</div>}

            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>{t("create_button")}</Button>
        </form>
    )
}

export default SupplierCreate