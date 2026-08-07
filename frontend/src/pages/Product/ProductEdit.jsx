import { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import Select from '@/components/Select'
import FormActions from '@/components/FormActions'
import useCharLimit from '@/hooks/useCharLimit'
import { charLimitMessage } from '@/utils/charLimitMessage'
import { ENV } from '@/config/env'

const ProductEdit = ({ product, onSave, onClose, departments = [] }) => {

    const {value: productBarCodeNumber, setValue: setProductBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "Código do Produto")
    const {value: productName, setValue: setProductName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "Nome do Produto")
    const {value: productDescription, setValue: setProductDescription, onChange: handleDescriptionChange, onBlur: handleDescriptionBlur, warning: descriptionWarning, isInvalid: isDescriptionInvalid } = useCharLimit(255, "Descrição do Produto")

    const { request, loading } = useFetch(ENV.API_BASE_URL)
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
        !productName.trim() ||
        (departments.length >= 2 && !departmentId)

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
            <Input label={"Nome do Produto"} type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={"Digite o nome do produto"} isInvalid={isNameInvalid} error={charLimitMessage(nameWarning)} required />

            <Input label={"Código do Produto"} type="text" name="productBarCodeNumber" value={productBarCodeNumber} onChange={handleBarCodeChange} onBlur={handleBarCodeBlur} placeholder={"Digite o código do produto"} isInvalid={isBarCodeInvalid} error={charLimitMessage(barCodeWarning)} />

            <Input label={"Descrição do Produto"} type="text" name="productDescription" value={productDescription} onChange={handleDescriptionChange} onBlur={handleDescriptionBlur} placeholder={"Digite a descrição do produto"} isInvalid={isDescriptionInvalid} error={productDescription ? charLimitMessage(descriptionWarning) : ''} />

            {departments.length >= 2 && (
                <Select
                    label="Departamento"
                    required
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    placeholder="Selecionar departamento"
                    options={departments.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                />
            )}

            <Alert message={error} />
            <Alert variant="success" message={success} />

            <FormActions>
                <Button type="submit" disabled={isDisabled} loading={loading}>Salvar</Button>
            </FormActions>
        </form>
    )
}

export default ProductEdit