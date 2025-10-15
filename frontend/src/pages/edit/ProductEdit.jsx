import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Input from '../../components/Input'

const ProductEdit = ({product, onSave, onClose}) => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")

    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        productName: '',
        unitOfMeasure: ''
    })

    useEffect(() => {
        if(product){
            setFormData({
                productName: product.productName,
                unitOfMeasure: product.unitOfMeasure
            })
        }
    }, [product])

    const handleChange = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product){
            return
        }

        const body = {
            productName: formData.productName.trim(),
            unitOfMeasure: formData.unitOfMeasure,
            companyCnpj: product.companyCnpj
        }

        const res = await request("PUT", `/products/${product.productId}`, body)

        if(res.ok){
            onSave(res.data)
            onClose()
        }else{
            setError(res.data?.message || "Failed to update product")
        }
    }

    return (
        <div className="product-edit-container">
            <h2>Edit Product</h2>
            {error && <Alert message={error} />}
            <form onSubmit={handleSubmit}>
                <Input label="Name" type="text" name="productName" value={formData.productName} onChange={handleChange} required/>
                <label>
                    <span>Unit of Measure</span>
                    <select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange}>
                        <option value="mg">mg</option> 
                        <option value="g">g</option> 
                        <option value="kg">kg</option> 
                        <option value="ml">ml</option> 
                        <option value="l">l</option> 
                        <option value="und">und</option> 
                    </select>
                </label>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </form>
        </div>
    )
}

export default ProductEdit