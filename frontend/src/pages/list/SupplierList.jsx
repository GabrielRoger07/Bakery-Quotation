import React, { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'

const SupplierList = () => {

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchSuppliers = async () => {
            const res = await request("GET", "/suppliers")
            if(res.ok){
                setSuppliers(res.data);
                setError("")
                console.log("ola")
            }else{
                setError(res.data?.message)
            }
        }

        fetchSuppliers();
    }, [request])

    return (
    <div className="supplier-list-container">
        <h1>All Suppliers</h1>

        {loading && <p>Loading suppliers...</p>}
        {error && <Alert message={error} />}
        {!loading && !error && suppliers.length === 0 && <p>No suppliers found.</p>}

        {console.log(suppliers)}
        {console.log("oi")}

        <div className='supplier-list'>
            <ul>
                {suppliers.map((supplier) => (
                    <li key={supplier.supplierId} className="supplier-card">Name: {supplier.supplierName} - Email: {supplier.supplierEmail} - Whatsapp: {supplier.supplierWhatsappNumber}
                        <Button onClick={() => console.log("valor aqui: " + supplier.supplierId)}>Delete</Button>
                    </li>
                ))}
            </ul>
        </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  )
}

export default SupplierList