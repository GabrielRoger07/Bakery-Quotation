import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack }) => {

    const { request } = useFetch("http://localhost:8080/api/v1")
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

    const handleAddProduct = () => {

        if(!selectedProductId) return

        const product = availableProducts.find(p => p.productId === selectedProductId)
        if(!product) return

        if(localSelected.find(p => p.productId === selectedProductId)){
            setError("Product already added!")
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

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected])

    return (
        <div className="step-products">
            <h2>Step 2: Select Products</h2>
            
            <div className="product-add-form">
                <select value={selectedProductId} onChange={e => setSelectedProductId(Number(e.target.value))} className="custom-select">
                    {availableProducts.map(p => (
                        <option key={p.productId} value={p.productId}>
                            {p.productName}
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
                    />
                    <Input 
                        label="Bonus"
                        type="number"
                        value={bonus}
                        onChange={e => setBonus(e.target.value)}
                        min="0"
                    />
                </div>

                <Button onClick={handleAddProduct}>Add Product</Button>
            </div>

            <Alert message={error} />

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
                <Button onClick={onBack}>Back</Button>
                <Button onClick={() => {onChange(localSelected); onNext()}}>Next</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2