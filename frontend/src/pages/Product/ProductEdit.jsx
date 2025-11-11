import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'

const ProductEdit = ({product, onSave, onClose}) => {

    const {value: productBarCodeNumber, setValue: setProductBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "Product Barcode Number")
    const {value: productName, setValue: setProductName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(30, "Product Name")

    const { request } = useFetch("http://localhost:8080/api/v1")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [unitOfMeasure, setUnitOfMeasure] = useState("")

    useEffect(() => {
        if(product){
            setProductBarCodeNumber(product.productBarCodeNumber || "")
            setProductName(product.productName || "")
            setUnitOfMeasure(product.unitOfMeasure || "")
        }
    }, [product])

    const isDisabled = 
        barCodeWarning ||
        nameWarning ||
        !productBarCodeNumber ||
        !productName ||
        !unitOfMeasure

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product) return

        if(!productBarCodeNumber.trim() || !productName.trim() || !unitOfMeasure){
            setError("All fields are required.")
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productBarCodeNumber: productBarCodeNumber.trim(),
            productName: productName.trim(),
            unitOfMeasure,
            companyCnpj: product.companyCnpj
        }

        const res = await request("PUT", `/products/${product.productId}`, body)

        if(res.ok){
            setSuccess("Product updated successfully!")
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(res.data?.message || "Failed to update product")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label="Barcode Number" type="text" name="productBarCodeNumber" value={productBarCodeNumber} onChange={handleBarCodeChange} onBlur={handleBarCodeBlur} placeholder="Enter Product Barcode Number" isInvalid={isBarCodeInvalid} required />
            {barCodeWarning && <div className="warning">{barCodeWarning}</div>}
            
            <Input label="Name" type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder="Enter Product Name" isInvalid={isNameInvalid} required />
            {nameWarning && <div className="warning">{nameWarning}</div>}

            <div className="input-container">
                <label htmlFor="unitOfMeasure">
                    Unit of Measure<span className={`required-asterisk ${!unitOfMeasure ? "empty" : "filled"}`}>*</span>
                </label>
                <div className="select-wrapper">
                    <select id="unitOfMeasure" name="unitOfMeasure" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} className="custom-select" required >
                        <option value="" disabled>Select a unit</option>
                        <option value="mg">mg</option> 
                        <option value="g">g</option> 
                        <option value="kg">kg</option> 
                        <option value="ml">ml</option> 
                        <option value="l">l</option> 
                        <option value="und">und</option> 
                    </select>
                    <span className="select-arrow"></span>
                </div>
            </div>
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>Save</Button>
        </form>
    )
}

export default ProductEdit