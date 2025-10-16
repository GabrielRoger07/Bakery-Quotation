import React, { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import SupplierEdit from '../edit/SupplierEdit'

const SupplierList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();
    
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [supplierToEdit, setSupplierToEdit] = useState(null)

    const openEditModal = (supplier) => {
        setSupplierToEdit(supplier)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSupplierToEdit(null)
        setIsModalOpen(false)
    }

    const handleSave = (updatedSupplier) => {
        setSuppliers(prev => prev.map(s => s.supplierId === updatedSupplier.supplierId ? updatedSupplier : s))
    }

    const handleDelete = async (supplierId) => {
        const res = await request("DELETE", `/suppliers/${supplierId}`)

        if(res.ok){
            setSuppliers(prevSuppliers => prevSuppliers.filter(s => s.supplierId !== supplierId));
            setError("")
        }else{
            setError(res.data?.message || "Failed to delete supplier")
        }
    }

    const createSupplier = () => {
        navigate("/create-supplier")
    }

    useEffect(() => {
        const fetchSuppliers = async () => {
            const token = Cookies.get("token")
            const decoded = jwtDecode(token)
            const cnpj = decoded.companyCnpj
            const res = await request("GET", `/suppliers/company/${cnpj}`)
            if(res.ok){
                setSuppliers(res.data);
                setError("")
            }else{
                setError(res.data?.message)
            }
            setStatus(res.status)
        }

        fetchSuppliers();
    }, [request])

    return (
    <div className="supplier-list-container">
        <h1>All Suppliers</h1>

        {loading && <p>Loading suppliers...</p>}
        {error && <Alert message={error} />}
        {status === 0 && <Alert message="Server Internal Error" />}
        {!loading && !error && status !== 0 && suppliers.length === 0 && <p>No suppliers found.</p>}

        {console.log(suppliers)}

        <div className='supplier-list'>
            <ul>
                {suppliers.map((supplier) => (
                    <li key={supplier.supplierId} className="supplier-card">Name: {supplier.supplierName} - Email: {supplier.supplierEmail} - Whatsapp: {supplier.supplierWhatsappNumber}
                        <Button onClick={() => openEditModal(supplier)}>Edit</Button>
                        <Button onClick={() => handleDelete(supplier.supplierId)}>Delete</Button>
                    </li>
                ))}
            </ul>
        </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button onClick={() => createSupplier()}>Add Supplier</Button>

        <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Supplier">
            <SupplierEdit 
                supplier={supplierToEdit} 
                onSave={handleSave}
                onClose={closeModal} 
            />
        </Modal>
    </div>
  )
}

export default SupplierList