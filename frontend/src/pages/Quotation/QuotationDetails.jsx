import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'

const QuotationDetails = ({ quotation }) => {
    
    const { request } = useFetch(ENV.API_BASE_URL)
    const [products, setProducts] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState("")

    const fetchProducts = async () => {

        const resProducts = await request("GET", `/contains/${quotation.quotationId}`)

        if(resProducts.ok){
            setProducts(resProducts.data);
            setError("")
        }else{
            setError(resProducts.data?.message || "Failed to fetch products")
        }
        setStatus(resProducts.status)
    }

    const fetchSuppliers = async () => {

        const resSuppliers = await request("GET", `/participations/quotations/${quotation.quotationId}`)

        if(resSuppliers.ok){
            setSuppliers(resSuppliers.data);
            setError("")
        }else{
            setError(resSuppliers.data?.message || "Failed to fetch suppliers")
        }
        setStatus(resSuppliers.status)
    }

    useEffect(() => {
        if(!quotation) return

        fetchProducts()
        fetchSuppliers()
    }, [quotation, request])

    if(!quotation) return null

    return (
        <div className="quotation-details-container">
            {error && <Alert message={error}/>}

            <h3>Quotation {quotation.quotationId}</h3>
            <p><strong>Start: </strong> {quotation.quotationStart}</p>
            <p><strong>End: </strong> {quotation.quotationEnd}</p>

            <div className="details-section">
                <h4>Products</h4>
                {products.length === 0 ? (
                    <p>No products linked.</p>
                ) : (
                    <ul>
                        {products.map(p => (
                            <li key={p.productId}>
                                {p.productBarCodeNumber} - {p.productName} - Qtd: {p.quantity} ({p.unitOfMeasure})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="details-section">
                <h4>Suppliers</h4>
                {suppliers.length === 0 ? (
                    <p>No suppliers linked.</p>
                ) : (
                    <ul>
                        {suppliers.map(s => (
                            <li key={s.supplierId}>
                                {s.supplierName} ({s.employerName})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default QuotationDetails