import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {

    const { request } = useFetch(ENV.API_BASE_URL)
    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedProducts)
    const [selectedProductId, setSelectedProductId] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [bonus, setBonus] = useState(0)
    const [error, setError] = useState("")

    useEffect(() => {

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const fetchProducts = async () => {
            const res = await request("GET", `/products/company/${cnpj}`)
            if(res.ok) {
                setAvailableProducts(res.data)
                if(res.data.length > 0) setSelectedProductId(res.data[0].productId)
            }
        }

        fetchProducts()
    }, [request])

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected])

    const handleAddProduct = () => {

        if(!selectedProductId){
            setError("Select a product first")
            return
        }

        const product = availableProducts.find(p => p.productId === selectedProductId)
        if(!product) {
            setError("Invalid product")
            return
        }

        if(localSelected.find(p => p.productId === selectedProductId)){
            setError("Product already added!")
            return
        }

        if(quantity <= 0) {
            setError("Quantity must be greater than 0")
            return
        }
        
        const updatedList = [...localSelected, { ...product, quantity: Number(quantity), bonusLimit: Number(bonus)}]
        setLocalSelected(updatedList)
        setError("")
    }

    const handleRemoveProduct = (productId) => {
        const updatedList = localSelected.filter(p => p.productId !== productId)
        setLocalSelected(updatedList)
    }

    const handleNextClick = () => {
        if(localSelected.length === 0) {
            setError("Select at least one product")
            return
        }

        setError("")
        onChange(localSelected)
        onNext()
    }

    return (
        <div className="step-products">
            <h2>Step 2: Select Products</h2>
            
            <div className="product-add-form">
                <select value={selectedProductId} onChange={e => setSelectedProductId(Number(e.target.value))} className="custom-select">
                    {availableProducts.map(p => (
                        <option key={p.productId} value={p.productId}>
                            {p.productBarCodeNumber} - {p.productName}
                        </option>
                    ))}
                </select>

                <div className="quantity-bonus-group">
                    <Input 
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        min="1"
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }}
                    />
                    <Input 
                        label="Bonus"
                        type="number"
                        value={bonus}
                        onChange={e => setBonus(e.target.value)}
                        min="0"
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }}
                    />
                </div>

                <Button onClick={handleAddProduct} disabled={loading}>Add Product</Button>
            </div>

            {error && <Alert message={error} />}

            <div className="selected-products">
                <h3>Products Added ({localSelected.length})</h3>
                <ul>
                    {localSelected.map(p => (
                        <li key={p.productId} className="selected-product-item">
                            {p.productName} - Qtd: {p.quantity} | Bonus: {p.bonusLimit}
                            <Button className="remove-product-btn" onClick={() => handleRemoveProduct(p.productId)}>Remove</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>Back</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? "Loading..." : "Next"}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2