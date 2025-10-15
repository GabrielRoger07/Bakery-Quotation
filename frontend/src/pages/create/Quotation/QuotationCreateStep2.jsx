import React, { useEffect, useState } from 'react'
import Button from '../../../components/Button'
import useFetch from '../../../hooks/useFetch'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import Input from '../../../components/Input'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack }) => {

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedProducts)

    useEffect(() => {

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const fetchProducts = async () => {
            const res = await request("GET", `/products/company/${cnpj}`)
            if(res.ok){
                setAvailableProducts(res.data)
            }
        }
        fetchProducts()
    }, [request])

    const handleAddProduct = (product) => {
        if(!localSelected.find(p => p.id === product.productId)){
            setLocalSelected([...localSelected, { ...product, quantity: 1, bonus: 0}])
        }
    }

    const handleChange = (productId, field, value) => {
        setLocalSelected(
            localSelected.map(p => (
                p.productId === productId ? {...p, [field]: value} : p
            ))
        )
    }

    const handleRemove = (productId) => {
        setLocalSelected(localSelected.filter(p => p.productId !== productId))
    }

    return (
        <div className="step-products">
            <h2>Step 2: Select Products</h2>
            <ul>
                {availableProducts.map(p => (
                    <li key={p.productId}>
                        {p.productName}{" "}
                        <Button onClick={() => handleAddProduct(p)}>Add</Button>
                    </li>
                ))}
            </ul>

            <h3>Selected Products</h3>
            <ul>
                {localSelected.map(p => (
                    <li key={p.productId}>
                        {p.productName} - Quantity: 
                        <Input type="number" value={p.quantity} onChange={e => handleChange(p.productId, "quantity", e.target.value)}></Input>
                        Bonus:
                        <Input type="number" value={p.bonus} onChange={e => handleChange(p.productId, "bonus", e.target.value)}></Input>
                        <Button onClick={() => handleRemove(p.productId)}>Remove</Button>
                    </li>
                ))}
            </ul>

            <Button onClick={onBack}>Back</Button>
            <Button onClick={() => onChange(localSelected) & onNext()}>Next</Button>
        </div>
    )
}

export default QuotationCreateStep2