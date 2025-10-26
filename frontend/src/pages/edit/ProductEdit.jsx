import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Input from '../../components/Input'

const ProductEdit = ({product, onSave, onClose}) => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

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
        if(!product) return

        if(!formData.productName.trim() || !formData.unitOfMeasure){
            setError("All fields are required.")
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productName: formData.productName.trim(),
            unitOfMeasure: formData.unitOfMeasure,
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
            <Input label="Name" type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="Enter Product Name" required/>
            <div className="input-group">
                <label htmlFor="unitOfMeasure" className="input-label">
                    Unit of Measure
                </label>
                <select id="unitOfMeasure" name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange} className="custom-select">
                    <option value="" disabled>Select a unit</option>
                    <option value="mg">mg</option> 
                    <option value="g">g</option> 
                    <option value="kg">kg</option> 
                    <option value="ml">ml</option> 
                    <option value="l">l</option> 
                    <option value="und">und</option> 
                </select>
            </div>
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
            </Button>
        </form>
    )
}

export default ProductEdit