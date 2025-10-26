import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Input from '../../components/Input'

const SupplierEdit = ({supplier, onSave, onClose}) => {
    
    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

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
        if(!supplier) return

        if(!formData.supplierName.trim()){
            setError("Supplier name is required.")
            setSuccess("")
            return
        }

        if(!formData.supplierWhatsappNumber.trim()){
            setError("Whatsapp Number is required.")
            setSuccess("")
            return
        }

        if(!formData.employerName.trim()){
            setError("Company name is required.")
            setSuccess("")
            return
        }

        setError("")

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
            setSuccess("Supplier updated successfully!")
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError(res.data?.message || "Failed to update supplier")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label="Name" type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required/>
            <Input label="Email" type="email" name="supplierEmail" value={formData.supplierEmail} onChange={handleChange}/>
            <Input label="Whatsapp Number" type="text" name="supplierWhatsappNumber" value={formData.supplierWhatsappNumber} onChange={handleChange} required/>
            <Input label="Company Name" type="text" name="employerName" value={formData.employerName} onChange={handleChange} required/>
            <Input label="Company Cnpj" type="text" name="employerCnpj" value={formData.employerCnpj} onChange={handleChange}/>
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
            </Button>
        </form>
    )
}

export default SupplierEdit