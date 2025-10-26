import { useState } from 'react'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const ProductCreate = ({ onClose, onSave }) => {

    const [productName, setProductName] = useState("")
    const [unitOfMeasure, setUnitOfMeasure] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch("http://localhost:8080/api/v1")

    const handleProductCreate = async(e) => {
        e.preventDefault()

        if(!productName || !unitOfMeasure){
            setError("All fields are required.")
            setSuccess("")
            return;
        }

        setError("")

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        const product = {
            productName,
            unitOfMeasure,
            companyCnpj: cnpj
        }

        const res = await request("POST", "/products", product)

        if(res.ok){
            setSuccess("Product created successfully!")
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(res.data?.message || "Failed to create product")
        }
    }

    return (
        <form onSubmit={handleProductCreate}>
            <Input label="Name" type="text" name="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter Product Name"/>
            <div className="input-group">
                <label htmlFor="unitOfMeasure" className="input-label">
                    Unit of Measure
                </label>
                <select id="unitOfMeasure" name="unitOfMeasure" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} className="custom-select">
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
                {loading ? "Creating..." : "Create Product"}
            </Button>
        </form>
    )
}

export default ProductCreate