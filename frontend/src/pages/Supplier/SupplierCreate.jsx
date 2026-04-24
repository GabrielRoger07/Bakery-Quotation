import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'
import { ENV } from '../../config/env'

const SupplierCreate = ({ onClose, onSave }) => {

    const { value: supplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "Nome")
    const { value: supplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "E-mail")
    const { value: supplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(65, "Nome da Empresa")
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

    const warningCls = "text-[var(--color-danger-strong)] text-[0.8125rem] font-medium [margin:-0.25rem_0_0.625rem]"

    const handleSupplierCreate = async(e) => {
        e.preventDefault();

        if (supplierEmail && !/\S+@\S+\.\S+/.test(supplierEmail)) {
            setError("E-mail inválido");
            setSuccess("");
            return;
        }

        setError("")

        const supplier = {
            supplierName,
            supplierEmail: supplierEmail || null,
            supplierWhatsappNumber: getSupplierWhatsappNumberRaw(),
            employerName,
            employerCnpj: getEmployerCnpjRaw(),
        }

        const res = await request("POST", "/suppliers", supplier)

        if(res.ok){
            setSuccess("Fornecedor criado com sucesso!")
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            if(res.data.message === "Employer CNPJ must be valid"){
                setError("CNPJ inválido")
            } else {
                setError("Não foi possível criar o fornecedor. Por favor tente novamente.")
            }
        }
    }

    return (
        <form onSubmit={handleSupplierCreate}>
            <Input label={"Nome"} type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder={"Digite o nome do fornecedor"} isInvalid={isSupplierNameInvalid} required />
            {supplierNameWarning && (
                <div className={warningCls}>
                    {supplierNameWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${supplierNameWarning.min} caracteres para ${supplierNameWarning.fieldName}.`
                    }

                    {supplierNameWarning.type === "too_long" &&
                        `É permitido ter no máximo ${supplierNameWarning.max} caracteres para ${supplierNameWarning.fieldName}.`
                    }
                </div>
            )}
            
            <Input label={"E-mail"} type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder={"Digite o e-mail do fornecedor"} isInvalid={isSupplierEmailInvalid} />
            {supplierEmail && supplierEmailWarning && (
                <div className={warningCls}>
                    {supplierEmailWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${supplierEmailWarning.min} caracteres para ${supplierEmailWarning.fieldName}.`
                    }

                    {supplierEmailWarning.type === "too_long" &&
                        `É permitido ter no máximo ${supplierEmailWarning.max} caracteres para ${supplierEmailWarning.fieldName}.`
                    }
                </div>
            )}
            
            <Input label={"Whatsapp"}  type="text" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder={"Digite o Whatsapp do fornecedor"} isInvalid={isSupplierWhatsappNumberInvalid} required />
            {isSupplierWhatsappNumberInvalid && <div className={warningCls}>Número de Whatsapp inválido</div>}

            <Input label={"Nome da Empresa"} type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder={"Digite o nome da empresa do fornecedor"} isInvalid={isEmployerNameInvalid} required />
            {employerNameWarning && (
                <div className={warningCls}>
                    {employerNameWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${employerNameWarning.min} caracteres para ${employerNameWarning.fieldName}.`
                    }

                    {employerNameWarning.type === "too_long" &&
                        `É permitido ter no máximo ${employerNameWarning.max} caracteres para ${employerNameWarning.fieldName}.`
                    }
                </div>
            )}

            <Input label={"CNPJ da Empresa"} type="text" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder={"Digite o CNPJ da empresa do fornecedor"} isInvalid={isEmployerCnpjInvalid} required />
            {isEmployerCnpjInvalid && <div className={warningCls}>CNPJ inválido</div>}

            <Alert message={error} />
            {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}

            <Button type="submit" disabled={isDisabled}>Criar</Button>
        </form>
    )
}

export default SupplierCreate