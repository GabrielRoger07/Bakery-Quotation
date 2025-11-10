import { useState } from 'react'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import './SupplierQuotation.css'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {
    
    const {request} = useFetch("http://localhost:8080/api/v1")

    const { value: price, handleChange: handlePriceChange, getNumericValue, setValue: setPrice } = useCurrencyMask("")

    const [quantity, setQuantity] = useState(product.quantity)
    const [bonus, setBonus] = useState(0)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [pendingBidValue, setPendingBidValue] = useState(null)

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const numericPrice = getNumericValue()

        if(!numericPrice){
            setError("Price is required")
            return
        }

        const pricePerUnit = numericPrice / (quantity + bonus)

        if(currentLowestBid && ((currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)) <= pricePerUnit)){
            setError("Bid must be lower than the lowest bid")
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

        setPendingBidValue(pricePerUnit)
        setConfirming(true)
    }

    const confirmBid = async () => {
        setConfirming(false)
        setLoading(true)

        const body = {
            participationId,
            productId: product.productId,
            price: getNumericValue(),
            quantity: parseFloat(product.quantity),
            bonus: 0
        }

        const res = await request("POST", "/bids", body)
        setLoading(false)

        if(res.ok){
            setSuccess("Bid submitted successfully!")
            setPrice("")
            setTimeout(() => setSuccess(""), 2000)
            //setBonus(0)
        }else{
            setError(res.data?.message || "Failed to submit bid")
        }
    }

    const cancelBid = () => {
        setConfirming(false)
        setError("")
    }

    return (
        <div className="quotation-product-item">
            <div>
                <h3>{product.productName}</h3>
                <p>Bar Code Number: <strong>{product.productBarCodeNumber}</strong></p>
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

                {!confirming ? (
                    <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Bid"}</Button>
                ) : (
                    <div className="confirm-container">
                        <p>Confirm bid of{" "} <strong>R$ {pendingBidValue.toFixed(2)}/{product.unitOfMeasure}</strong>{" "} for <strong>{product.productName}</strong>?</p>
                        <div className="confirm-buttons">
                        <Button type="button" onClick={confirmBid} variant="success">Yes</Button>
                        <Button type="button" onClick={cancelBid} variant="danger">Cancel</Button>
                        </div>
                    </div>
                )}

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}
            </form>
        </div>
    )
}

export default QuotationProductItem