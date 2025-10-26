import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import SupplierEdit from '../edit/SupplierEdit'
import Table from '../../components/Table'
import './SupplierList.css'
import Alert from '../../components/Alert'
import SupplierCreate from '../create/SupplierCreate'

const SupplierList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [supplierToEdit, setSupplierToEdit] = useState(null)

    const columns = [
        { key: "supplierName", label: "Name"},
        { key: "supplierEmail", label: "Email"},
        { key: "supplierWhatsappNumber", label: "Whatsapp"},
        { key: "employerName", label: "Employer Name"},
        { key: "employerCnpj", label: "Employer CNPJ"}
    ]

    const openEditModal = (supplier) => {
        setSupplierToEdit(supplier)
        setIsEditModalOpen(true)
    }

    const closeModals = () => {
        setSupplierToEdit(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
    }

    const handleSaveCreate = (newSupplier) => {
        setSuppliers(prev => [...prev, newSupplier])
    }

    const handleSaveEdit = (updatedSupplier) => {
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

    useEffect(() => {
        fetchSuppliers();
    }, [])

    return (
    <div className="supplier-list-container">
        {error && <Alert message={error}/>}
        {status === 0 && <Alert message="Server Internal Error" />}

        <Table 
            title="All Suppliers"
            columns={columns}
            data={suppliers}
            idKey="supplierId"
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onAdd={() => setIsCreateModalOpen(true)}
            onReload={fetchSuppliers}
            emptyMessage="No suppliers found."
        />

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Edit Supplier">
            <SupplierEdit 
                supplier={supplierToEdit} 
                onSave={handleSaveEdit}
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Create Supplier">
            <SupplierCreate
                onSave={handleSaveCreate}
                onClose={closeModals} 
            />
        </Modal>
    </div>
  )
}

export default SupplierList