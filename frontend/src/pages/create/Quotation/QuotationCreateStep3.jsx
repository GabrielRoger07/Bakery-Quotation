import React, { useEffect, useState } from 'react'
import Button from '../../../components/Button'
import useFetch from '../../../hooks/useFetch'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish }) => {
    const { request } = useFetch("http://localhost:8080/api/v1")
    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedSuppliers)

    useEffect(() => {
        const fetchSuppliers = async () => {
            const token = Cookies.get("token")
            const decoded = jwtDecode(token)
            const cnpj = decoded.companyCnpj
            const res = await request("GET", `/suppliers/company/${cnpj}`)
            if(res.ok){
                setAvailableSuppliers(res.data)
            }
        }
        fetchSuppliers()
    }, [request])

    const handleAddSupplier = (supplier) => {
        if(!localSelected.find(s => s.id === supplier.supplierId)){
            setLocalSelected([...localSelected, supplier])
        }
    }

    const handleRemove = (supplierId) => {
        setLocalSelected(localSelected.filter(s => s.supplierId !== supplierId))
    }

    return (
        <div className="step-suppliers">
            <h2>Step 3: Select Suppliers</h2>
            <ul>
                {availableSuppliers.map(s => (
                    <li key={s.supplierId}>
                        {s.supplierName} ({s.employerName}){" "}
                        <Button onClick={() => handleAddSupplier(s)}>Add</Button>
                    </li>
                ))}
            </ul>

            <h3>Selected Suppliers</h3>
            <ul>
                {localSelected.map(s => (
                    <li key={s.supplierId}>
                        {s.supplierName} ({s.employerName}){" "}
                        <Button onClick={() => handleRemove(s.supplierId)}>Remove</Button>
                    </li>
                ))}
            </ul>

            <Button onClick={onBack}>Back</Button>
            <Button onClick={() => onChange(localSelected) & onFinish()}>Finish</Button>
        </div>
    )
}

export default QuotationCreateStep3