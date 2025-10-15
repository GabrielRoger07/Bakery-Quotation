import React, { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const QuotationEdit = ({ quotation, onClose, onSave }) => {

    const [products, setProducts] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")
    const [availableProducts, setAvailableProducts] = useState([])
    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [selectedProductId, setSelectedProductId] = useState("")
    const [selectedSupplierId, setSelectedSupplierId] = useState("")
    const [quantity, setQuantity] = useState("")
    const [bonusLimit, setBonusLimit] = useState("")
    const { request } = useFetch("http://localhost:8080/api/v1")

    useEffect(() => {
        if (!quotation)
            return

        const fetchData = async () => {
            const token = Cookies.get("token")
            const decoded = jwtDecode(token)
            const cnpj = decoded.companyCnpj

            const resProducts = await request("GET", `/contains/${quotation.quotationId}`)

            if (resProducts.ok) {
                setProducts(resProducts.data)
                setError("")
            } else {
                setError(resProducts.data?.message)
            }

            const resSuppliers = await request("GET", `/participations/quotations/${quotation.quotationId}`)

            if (resSuppliers.ok) {
                setSuppliers(resSuppliers.data)
                setError("")
            } else {
                setError(resSuppliers.data?.message)
            }

            const resAllProducts = await request("GET", `/products/company/${cnpj}`)

            if (resAllProducts.ok) {
                setAvailableProducts(resAllProducts.data)
                setError("")
            } else {
                setError(resAllProducts.data?.message)
            }

            const resAllSuppliers = await request("GET", `/suppliers/company/${cnpj}`)

            if (resAllSuppliers.ok) {
                setAvailableSuppliers(resAllSuppliers.data)
                setError("")
            } else {
                setError(resAllSuppliers.data?.message)
            }
        }

        fetchData()
    }, [quotation, request])

    const handleRemoveProduct = async (productId) => {
        const res = await request("DELETE", `/contains/${quotation.quotationId}/${productId}`)

        if (res.ok) {
            setProducts(prevProducts => prevProducts.filter(p => p.productId !== productId));
            setError("")
        } else {
            setError(res.data?.message || "Failed to delete product")
        }
    }

    const handleRemoveSupplier = async (participationId) => {
        const res = await request("DELETE", `/participations/${participationId}`)

        if (res.ok) {
            console.log("valor de participationId: " + participationId)
            setSuppliers(prevSuppliers => prevSuppliers.filter(s => s.participationId !== participationId));
            setError("")
        } else {
            setError(res.data?.message || "Failed to delete supplier")
        }
    }

    const handleAddProduct = async () => {
        if (!selectedProductId || !quantity || !bonusLimit) {
            setError("All the fields are required")
            return
        }

        const product = {
            quotationId: quotation.quotationId,
            selectedProductId,
            quantity,
            bonusLimit
        }

        const res = await request("POST", "/contains/", product)

        if (res.ok) {
            setProducts(prevProducts => [...prevProducts, res.data]);
            setSelectedProductId("")
            setQuantity("")
            setBonusLimit("")
            setError("")
        } else {
            setError(res.data?.message || "Failed to add product")
        }
    }

    const handleAddSupplier = async () => {
        if (!selectedSupplierId) {
            setError("Select a supplier before add")
            return
        }

        const supplier = {
            supplierId: selectedSupplierId,
            quotationId: quotation.quotationId
        }

        const res = await request("POST", "/participations/", supplier)

        if (res.ok) {
            setSuppliers(prevSuppliers => [...prevSuppliers, res.data]);
            setSelectedSupplierId("")
            setError("")
        } else {
            setError(res.data?.message || "Failed to add supplier")
        }
    }

    return (
        <div className="quotation-edit-container">
            <h2>Edit Quotation</h2>
            {error && <Alert message={error} />}
            <p><strong>Start:</strong> {quotation.quotationStart}</p>
            <p><strong>End:</strong> {quotation.quotationEnd}</p>
            <div className="quotation-edit-section">
                <h3>Products</h3>
                <ul>
                    {products.map(p => (
                        <li key={p.productId}> {p.productName}: {p.quantity} {p.unitOfMeasure}
                            <Button onClick={() => handleRemoveProduct(p.productId)}>Remove</Button>
                        </li>
                    ))}
                </ul>
                <h3>Add Product</h3>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}> <option value="">Select a product</option> {availableProducts.map(p => (<option key={p.productId} value={p.productId}>{p.productName}</option>))} </select> </div> <div className="quotation-edit-section"> <h3>Suppliers</h3> <ul> {suppliers.map(s => (<li key={s.supplierId}> {s.supplierName} - {s.employerName} <Button onClick={() => handleRemoveSupplier(s.participationId)}>Remove</Button> </li>))} </ul> </div> <div className="quotation-edit-actions"> <Button onClick={onClose}>Close</Button> <Button onClick={onSave}>Save & Refresh</Button> </div> </div>)
} 

export default QuotationEdit