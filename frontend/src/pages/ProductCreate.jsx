import React, { useState } from 'react'
import Input from '../components/Input'
import Alert from '../components/Alert'
import Button from '../components/Button'

const ProductCreate = () => {

    const [productName, setProductName] = useState("")
    const [unitOfMeasure, setUnitOfMeasure] = useState("")
    const [errors, setErrors] = useState("")
    const [success, setSuccess] = useState("")

    const handleProductCreate = async(e) => {
        if(!productName || !unitOfMeasure){
            setErrors("All the fields are required")
            setSuccess("")
            return;
        }

        // chamada da api
        setSuccess("Product created successfully!")
        console.log({ productName, unitOfMeasure })
    }

    return (
        <div className="product-create-container">
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
                <Alert message={errors} />
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Product</Button>
            </form>
        </div>
    )
}

export default ProductCreate