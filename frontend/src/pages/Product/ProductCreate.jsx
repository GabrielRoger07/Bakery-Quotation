import { useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import useCharLimit from '@/hooks/useCharLimit'
import { ENV } from '@/config/env'

const ProductCreate = ({ onClose, onSave }) => {

    const { value: productBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "Código do Produto")
    const { value: productName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "Nome do Produto")
    const { value: productDescription, onChange: handleDescriptionChange, onBlur: handleDescriptionBlur, warning: descriptionWarning, isInvalid: isDescriptionInvalid } = useCharLimit(255, "Descrição do Produto")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)

    const isDisabled = 
        nameWarning ||
        !productName

    const warningCls = "text-[var(--color-danger-strong)] text-[0.8125rem] font-medium [margin:-0.25rem_0_0.625rem]"

    const handleProductCreate = async(e) => {
        e.preventDefault()

        if(!productName.trim()){
            setError("O nome do produto é obrigatório")
            setSuccess("")
            return;
        }

        setError("")

        const product = {
            productBarCodeNumber: productBarCodeNumber ? productBarCodeNumber.trim() : null,
            productName: productName.trim(),
            productDescription: productDescription ? productDescription.trim() : null
        }

        const res = await request("POST", "/products", product)

        if(res.ok){
            setSuccess("Produto criado com sucesso!")
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError("Não foi possível criar o produto. Por favor tente novamente.")
        }
    }

    return (
        <form onSubmit={handleProductCreate}>
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

            <Alert message={error} />
            
            {success && <div className="text-[var(--color-success)] flex justify-center font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}
            
            <div className="flex justify-center gap-3 mt-4">
                <Button type="submit" disabled={isDisabled}>Criar</Button>
            </div>
        </form>
    )
}

export default ProductCreate