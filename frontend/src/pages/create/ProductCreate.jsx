import React, { useState } from 'react'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const ProductCreate = () => {

    const [productName, setProductName] = useState("")
    const [unitOfMeasure, setUnitOfMeasure] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const handleProductCreate = async(e) => {
        e.preventDefault()

        if(!productName || !unitOfMeasure){
            setError("All the fields are required")
            setSuccess("")
            return;
        }

        setError("")

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        // chamar a api
        const product = {

            productName,
            unitOfMeasure,
            companyCnpj: cnpj
        }

        const res = await request("POST", "/products", product)

        if(res.ok){
            setSuccess("Product created successfully!")
            setError("")
            setTimeout(() => navigate("/products"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <div className="product-create-container">
        <h1>Product Create</h1>
            <form onSubmit={handleProductCreate}>
                <Input label="Name" type="text" name="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter Product Name"/>
                <label>
                    <span>Unit of Measure</span>
                    <select name="unitOfMeasure" onChange={(e) => setUnitOfMeasure(e.target.value)} value={unitOfMeasure}>
                        <option value="mg">mg</option> 
                        <option value="g">g</option> 
                        <option value="kg">kg</option> 
                        <option value="ml">ml</option> 
                        <option value="l">l</option> 
                        <option value="und">und</option> 
                    </select>
                </label>
                <Alert message={error} />
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Product</Button>
            </form>
        </div>
    )
}

export default ProductCreate