import { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import useCharLimit from '@/hooks/useCharLimit'
import { ENV } from '@/config/env'

const ProductEdit = ({ product, onSave, onClose, departments = [] }) => {

    const {value: productBarCodeNumber, setValue: setProductBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "Código do Produto")
    const {value: productName, setValue: setProductName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "Nome do Produto")
    const {value: productDescription, setValue: setProductDescription, onChange: handleDescriptionChange, onBlur: handleDescriptionBlur, warning: descriptionWarning, isInvalid: isDescriptionInvalid } = useCharLimit(255, "Descrição do Produto")

    const { request } = useFetch(ENV.API_BASE_URL)
    const [departmentId, setDepartmentId] = useState(product?.departmentId ? String(product.departmentId) : '')
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if(product){
            setProductBarCodeNumber(product.productBarCodeNumber || "")
            setProductName(product.productName || "")
            setProductDescription(product.productDescription || "")
        }
    }, [product, setProductBarCodeNumber, setProductName, setProductDescription])

    const isDisabled =
        nameWarning ||
        !productName ||
        (departments.length >= 2 && !departmentId)

    const warningCls = "text-[var(--color-danger-strong)] text-[0.8125rem] font-medium [margin:-0.25rem_0_0.625rem]"

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product) return

        if(!productName.trim()){
            setError("O nome do produto é obrigatório")
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productBarCodeNumber: productBarCodeNumber ? productBarCodeNumber.trim() : null,
            productName: productName.trim(),
            productDescription: productDescription ? productDescription.trim() : null,
            ...(departments.length >= 2 ? { departmentId: Number(departmentId) } : {}),
        }

        const res = await request("PUT", `/products/${product.productId}`, body)

        if(res.ok){
            setSuccess("Produto atualizado com sucesso!")
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError("Não foi possível atualizar o produto. Por favor tente novamente.")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            
            <Input label={"Nome do Produto"} type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={"Digite o nome do produto"} isInvalid={isNameInvalid} required />
            {nameWarning && (
                <div className={warningCls}>
                    {nameWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${nameWarning.min} caracteres para ${nameWarning.fieldName}.`
                    }

                    {nameWarning.type === "too_long" &&
                        `É permitido ter no máximo ${nameWarning.max} caracteres para ${nameWarning.fieldName}.`
                    }
                </div>
            )}
            
            <Input label={"Código do Produto"} type="text" name="productBarCodeNumber" value={productBarCodeNumber} onChange={handleBarCodeChange} onBlur={handleBarCodeBlur} placeholder={"Digite o código do produto"} isInvalid={isBarCodeInvalid} />
            {barCodeWarning && (
                <div className={warningCls}>
                    {barCodeWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${barCodeWarning.min} caracteres para ${barCodeWarning.fieldName}.`
                    }

                    {barCodeWarning.type === "too_long" &&
                        `É permitido ter no máximo ${barCodeWarning.max} caracteres para ${barCodeWarning.fieldName}.`
                    }
                </div>
            )}

            <Input label={"Descrição do Produto"} type="text" name="productDescription" value={productDescription} onChange={handleDescriptionChange} onBlur={handleDescriptionBlur} placeholder={"Digite a descrição do produto"} isInvalid={isDescriptionInvalid} />
            {productDescription && descriptionWarning && (
                <div className={warningCls}>
                    {descriptionWarning.type === "too_short" &&
                        `É permitido ter no mínimo ${descriptionWarning.min} caracteres para ${descriptionWarning.fieldName}.`
                    }

                    {descriptionWarning.type === "too_long" &&
                        `É permitido ter no máximo ${descriptionWarning.max} caracteres para ${descriptionWarning.fieldName}.`
                    }
                </div>
            )}

            {departments.length >= 2 && (
                <div className="flex flex-col mb-[1.125rem]">
                    <label className="mb-[0.375rem] font-semibold text-[var(--color-text-subtle)] text-[0.875rem] tracking-[0.005em] mr-auto">
                        Departamento <span className="ml-[2px] font-bold text-[var(--color-danger-strong)]">*</span>
                    </label>
                    <div className="relative">
                        <select
                            required
                            value={departmentId}
                            onChange={e => setDepartmentId(e.target.value)}
                            className="w-full min-h-[2.625rem] py-[0.5625rem] pl-[0.875rem] pr-10 border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] appearance-none hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]"
                        >
                            <option value="" disabled>Selecionar departamento</option>
                            {departments.map(d => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                    </div>
                </div>
            )}

            <Alert message={error} />
            
            {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}

            <div className="flex justify-center gap-3 mt-4">
                <Button type="submit" disabled={isDisabled}>Salvar</Button>
            </div>
        </form>
    )
}

export default ProductEdit