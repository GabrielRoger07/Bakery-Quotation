import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import useFetch from '../../hooks/useFetch'

const SupplierEdit = ({supplier, onSave, onClose}) => {
    
    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        supplierName: '',
        supplierEmail: '',
        supplierWhatsappNumber: '',
        employerName: '',
        employerCnpj: ''
    })

    useEffect(() => {
        if(supplier){
            setFormData({
                supplierName: supplier.supplierName,
                supplierEmail: supplier.supplierEmail,
                supplierWhatsappNumber: supplier.supplierWhatsappNumber,
                employerName: supplier.employerName,
                employerCnpj: supplier.employerCnpj,
            })
        }
    }, [supplier])

    const handleChange = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!supplier){
            return
        }

        const body = {
            supplierName: formData.supplierName.trim(),
            supplierEmail: formData.supplierEmail.trim(),
            supplierWhatsappNumber: formData.supplierWhatsappNumber.trim(),
            employerName: formData.employerName.trim(),
            employerCnpj: formData.employerCnpj.trim(),
            companyCnpj: supplier.companyCnpj,
            createdAt: supplier.createdAt
        }

        const res = await request("PUT", `/suppliers/${supplier.supplierId}`, body)

        if(res.ok){
            onSave(res.data)
            onClose()
        }else{
            setError(res.data?.message || "Failed to update supplier")
        }
    }

    return (
        <div className="supplier-edit-container">
            <h2>Edit Supplier</h2>
            {error && <Alert message={error} />}
            <form onSubmit={handleSubmit}>
                <Input label="Name" type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required/>
                <Input label="Email" type="email" name="supplierEmail" value={formData.supplierEmail} onChange={handleChange}/>
                <Input label="Whatsapp Number" type="text" name="supplierWhatsappNumber" value={formData.supplierWhatsappNumber} onChange={handleChange} required/>
                <Input label="Company Name" type="text" name="employerName" value={formData.employerName} onChange={handleChange} required/>
                <Input label="Company Cnpj" type="text" name="employerCnpj" value={formData.employerCnpj} onChange={handleChange}/>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </form>
        </div>
    )
}

export default SupplierEdit