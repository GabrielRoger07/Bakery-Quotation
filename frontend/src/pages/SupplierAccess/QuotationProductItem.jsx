import { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import './SupplierQuotation.css'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {
    
    const {request} = useFetch("http://localhost:8080/api/v1")

    const { value: price, handleChange: handlePriceChange, getNumericValue, setValue: setPrice } = useCurrencyMask("")

    const [quantity, setQuantity] = useState(product.quantity)
    const [bonus, setBonus] = useState(0)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const numericPrice = getNumericValue()

        if(!numericPrice){
            setError("Price is required")
            return
        }

        if(currentLowestBid && currentLowestBid.price <= numericPrice){
            setError("Bid must be lower than the current one")
            return
        }

        /*
        if(!quantity){
            setError("Quantity is required")
            return
        }

        if(quantity > product.quantity){
            setError("Quantity cannot be higher than requested")
            return
        }

        if(!bonus){
            setError("Bonus is required")
            return
        }

        if(bonus > product.bonusLimit){
            setError("Bonus cannot be higher than requested")
            return
        }
        */

        const body = {
            participationId,
            productId: product.productId,
            price: numericPrice,
            quantity: parseFloat(product.quantity),
            bonus: 0
        }

        setLoading(true)
        const res = await request("POST", "/bids", body)
        setLoading(false)

        if(res.ok){
            setSuccess("Bid submitted successfully!")
            setPrice("")
            //setBonus(0)
        }else{
            setError(res.data?.message || "Failed to submit bid")
        }
    }

    return (
        <div className="quotation-product-item">
            <div>
                <h3>{product.productName}</h3>
                <p>Quantity: {product.quantity} {product.unitOfMeasure}</p>
                <p>Bonus limit: {product.bonusLimit}</p>
                <p>Current Lowest Bid: {currentLowestBid ? `R$ ${(currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)).toFixed(2)}/${product.unitOfMeasure}` : "No bids yet"}</p>
            </div>
            <form className="bid-form" onSubmit={handleBidSubmit}>
                <Input label="Price" type="text" value={price} onChange={handlePriceChange} placeholder="R$0,00" />
                {/* 
                <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity"/>
                <Input label="Bonus" type="number" value={bonus} onChange={e => setBonus(e.target.value)} placeholder="Bonus"/>
                */}
                {error && <p>{error}</p>}
                {success && <p>{success}</p>}
                <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Bid"}</Button>
            </form>
        </div>
    )
}

export default QuotationProductItem