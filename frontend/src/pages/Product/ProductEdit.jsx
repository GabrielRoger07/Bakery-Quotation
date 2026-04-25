import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import { ENV } from '../../config/env'

const ProductEdit = ({product, onSave, onClose}) => {

    const {value: productBarCodeNumber, setValue: setProductBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "Código do Produto")
    const {value: productName, setValue: setProductName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "Nome do Produto")
    const {value: productDescription, setValue: setProductDescription, onChange: handleDescriptionChange, onBlur: handleDescriptionBlur, warning: descriptionWarning, isInvalid: isDescriptionInvalid } = useCharLimit(255, "Descrição do Produto")

    const { request } = useFetch(ENV.API_BASE_URL)
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
        barCodeWarning ||
        nameWarning ||
        !productBarCodeNumber ||
        !productName

    const warningCls = "text-[var(--color-danger-strong)] text-[0.8125rem] font-medium [margin:-0.25rem_0_0.625rem]"

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product) return

        if(!productBarCodeNumber.trim() || !productName.trim()){
            setError("Todos os campos são obrigatórios")
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productBarCodeNumber: productBarCodeNumber.trim(),
            productName: productName.trim(),
            productDescription: productDescription ? productDescription.trim() : null,
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
            <Input label={"Código do Produto"} type="text" name="productBarCodeNumber" value={productBarCodeNumber} onChange={handleBarCodeChange} onBlur={handleBarCodeBlur} placeholder={"Digite o código do produto"} isInvalid={isBarCodeInvalid} required />
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
            
            {success && <div className="text-[var(--color-success)] font-medium mb-[0.875rem] text-[0.875rem]">{success}</div>}

            <div className="flex justify-center gap-3 mt-4">
                <Button type="submit" disabled={isDisabled}>Salvar</Button>
            </div>
        </form>
    )
}

export default ProductEdit