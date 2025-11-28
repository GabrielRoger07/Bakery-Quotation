import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {

    const { t } = useTranslation()

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
                setAvailableProducts(res.data.content)
                if(res.data.content.length > 0) setSelectedProductId(res.data.content[0].productId)
            }
        }

        fetchProducts()
    }, [request])

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected])

    const handleAddProduct = () => {

        if(!selectedProductId){
            setError(t("quotation_step_2_no_product_selected"))
            return
        }

        const product = availableProducts.find(p => p.productId === selectedProductId)
        if(!product) {
            setError("quotation_step_2_invalid_product")
            return
        }

        if(localSelected.find(p => p.productId === selectedProductId)){
            setError("quotation_step_2_product_already_added")
            return
        }

        if(quantity <= 0) {
            setError("quotation_step_2_low_quantity")
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
            setError("quotation_step_2_no_selected_product")
            return
        }

        setError("")
        onChange(localSelected)
        onNext()
    }

    return (
        <div className="step-products">
            <h2>{t("quotation_step_2")}</h2>
            
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
                        label={t("quantity")}
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        min="1"
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }}
                    />
                    <Input 
                        label={t("bonus_limit")}
                        type="number"
                        value={bonus}
                        onChange={e => setBonus(e.target.value)}
                        min="0"
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }}
                    />
                </div>

                <Button onClick={handleAddProduct} disabled={loading}>{t("table_add")}</Button>
            </div>

            {error && <Alert message={error} />}

            <div className="selected-products">
                <h3>{t("products_added")} ({localSelected.length})</h3>
                <ul>
                    {localSelected.map(p => (
                        <li key={p.productId} className="selected-product-item">
                            {p.productName} - Qtd: {p.quantity} | Bonus: {p.bonusLimit}
                            <Button className="remove-product-btn" onClick={() => handleRemoveProduct(p.productId)}>{t("remove_button")}</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2