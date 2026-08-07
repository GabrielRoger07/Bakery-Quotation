import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import useFetch from '@/hooks/useFetch'
import Alert from '@/components/Alert'
import Input from '@/components/Input'
import FormActions from '@/components/FormActions'
import useCharLimit from '@/hooks/useCharLimit'
import usePhoneMask from '@/hooks/usePhoneMask'
import useCnpjMask from '@/hooks/useCnpjMask'
import { formatPhone } from '@/utils/formatPhone'
import { formatCnpj } from '@/utils/formatCnpj'
import { charLimitMessage } from '@/utils/charLimitMessage'
import { ENV } from '@/config/env'

const SupplierEdit = ({supplier, onSave, onClose}) => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { value: supplierName, setValue: setSupplierName, onChange: handleSupplierNameChange, onBlur: handleSupplierNameBlur, warning: supplierNameWarning, isInvalid: isSupplierNameInvalid } = useCharLimit(30, "Nome")
    const { value: supplierEmail, setValue: setSupplierEmail, onChange: handleSupplierEmailChange, onBlur: handleSupplierEmailBlur, warning: supplierEmailWarning, isInvalid: isSupplierEmailInvalid } = useCharLimit(60, "E-mail")
    const { value: supplierWhatsappNumber, setValue: setSupplierWhatsappNumber, handleChange: handleSupplierWhatsappNumberChange, handleBlur: handleSupplierWhatsappNumberBlur, getNumericValue: getSupplierWhatsappNumberRaw, isInvalid: isSupplierWhatsappNumberInvalid } = usePhoneMask()
    const { value: employerName, setValue: setEmployerName, onChange: handleEmployerNameChange, onBlur: handleEmployerNameBlur, warning: employerNameWarning, isInvalid: isEmployerNameInvalid } = useCharLimit(65, "Nome da Empresa")
    const { value: employerCnpj, setValue: setEmployerCnpj, handleChange: handleEmployerCnpjChange, handleBlur: handleEmployerCnpjBlur, getNumericValue: getEmployerCnpjRaw, isInvalid: isEmployerCnpjInvalid } = useCnpjMask()

    useEffect(() => {
        if(supplier){
            setSupplierName(supplier.supplierName || "")
            setSupplierEmail(supplier.supplierEmail || "")
            setSupplierWhatsappNumber(formatPhone(supplier.supplierWhatsappNumber || ""))
            setEmployerName(supplier.employerName || "")
            setEmployerCnpj(formatCnpj(supplier.employerCnpj || ""))
        }
    }, [supplier, setEmployerCnpj, setEmployerName, setSupplierEmail, setSupplierName, setSupplierWhatsappNumber])

    const isDisabled = 
        supplierNameWarning ||
        employerNameWarning ||
        !supplierName.trim() ||
        !supplierWhatsappNumber ||
        !employerName.trim() ||
        !employerCnpj ||
        isSupplierWhatsappNumberInvalid ||
        isEmployerCnpjInvalid

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!supplier) return

        if (supplierEmail && !/\S+@\S+\.\S+/.test(supplierEmail)) {
            setError("E-mail inválido");
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
            createdAt: supplier.createdAt
        }

        const res = await request("PUT", `/suppliers/${supplier.supplierId}`, body)

        if(res.ok){
            setSuccess("Fornecedor atualizado com sucesso!")
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError("Não foi possível atualizar o fornecedor. Por favor tente novamente.")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label="Nome do Fornecedor" type="text" value={supplierName} onChange={handleSupplierNameChange} onBlur={handleSupplierNameBlur} placeholder={"Digite o nome do fornecedor"} isInvalid={isSupplierNameInvalid} error={charLimitMessage(supplierNameWarning)} required />
            <Input label={"E-mail"} type="email" value={supplierEmail} onChange={handleSupplierEmailChange} onBlur={handleSupplierEmailBlur} placeholder={"Digite o e-mail do fornecedor"} isInvalid={isSupplierEmailInvalid} error={supplierEmail ? charLimitMessage(supplierEmailWarning) : ''} />
            <Input label={"Whatsapp"} type="text" inputMode="numeric" value={supplierWhatsappNumber} onChange={handleSupplierWhatsappNumberChange} onBlur={handleSupplierWhatsappNumberBlur} placeholder={"Digite o Whatsapp do fornecedor"} isInvalid={isSupplierWhatsappNumberInvalid} error={isSupplierWhatsappNumberInvalid && "Número de Whatsapp inválido"} required />
            <Input label={"Nome da Empresa"} type="text" value={employerName} onChange={handleEmployerNameChange} onBlur={handleEmployerNameBlur} placeholder={"Digite o nome da empresa do fornecedor"} isInvalid={isEmployerNameInvalid} error={charLimitMessage(employerNameWarning)} required />
            <Input label={"CNPJ da Empresa"} type="text" inputMode="numeric" value={employerCnpj} onChange={handleEmployerCnpjChange} onBlur={handleEmployerCnpjBlur} placeholder={"Digite o CNPJ da empresa do fornecedor"} isInvalid={isEmployerCnpjInvalid} error={isEmployerCnpjInvalid && "CNPJ inválido"} required />

            <Alert message={error} />
            <Alert variant="success" message={success} />

            <FormActions>
                <Button type="submit" disabled={isDisabled} loading={loading}>Salvar</Button>
            </FormActions>
        </form>
    )
}

export default SupplierEdit