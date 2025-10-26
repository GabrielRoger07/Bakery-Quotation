import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import Table from '../../components/Table'
import Alert from '../../components/Alert'
import QuotationEdit from '../edit/QuotationEdit'
import QuotationCreate from '../create/Quotation/QuotationCreate'
import './QuotationList.css'

const QuotationList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [quotationToEdit, setQuotationToEdit] = useState(null)

    const columns = [
        { key: "quotationId", label: "ID" },
        { key: "quotationStart", label: "Start Date" },
        { key: "quotationEnd", label: "End Date" },
        { key: "status", label: "Status" }
    ]

    const openEditModal = (quotation) => {
        setQuotationToEdit(quotation)
        setIsEditModalOpen(true)
    }

    const closeModals = () => {
        setQuotationToEdit(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
    }

    const handleSaveCreate = (newQuotation) => {
        setQuotations((prev) => [...prev, newQuotation])
    }

    const handleSaveEdit = (updatedQuotation) => {
        setQuotations((prev) => {
            prev.map((q) => q.quotationId === updatedQuotation.quotationId ? updatedQuotation : q)
        })
    }

    const handleDelete = async (quotationId, started) => {
        if(started) return

        const res = await request("DELETE", `/quotations/${quotationId}`)
        if(res.ok){
            setQuotations(prevQuotations => prevQuotations.filter(q => q.quotationId !== quotationId))
            setError("")
        }else{
            setError(res.data?.message || "Failed to delete quotation")
        }
    }

    const fetchQuotations = async () => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const res = await request("GET", `/quotations/company/${cnpj}`)
        if(res.ok){
            const mapped = res.data.map((q) => ({
                ...q, 
                status:
                new Date(q.quotationStart) > new Date() ? 'Scheduled' : new Date(q.quotationEnd) < new Date() ? 'Closed' : 'Active'
            }))
            setQuotations(mapped);
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }

    useEffect(() => {
        fetchQuotations();
    }, [])

    return (
    <div className="quotation-list-container">

        {error && <Alert message={error} />}
        {status === 0 && <Alert message="Server Internal Error"/>}
        <Table 
            title="All Quotations"
            columns={columns}
            data={quotations}
            idKey="quotationId"
            loading={loading}
            onEdit={openEditModal}
            onDelete={(id) => {
                const q = quotations.find((x) => x.quotationId === id)
                const started = new Date(q.quotationStart) <= new Date()
                handleDelete(id, started)
            }}
            onAdd={() => setIsCreateModalOpen(true)}
            onReload={fetchQuotations}
            emptyMessage="No quotations found."
        />

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Edit Quotation">
            <QuotationEdit
                quotation={quotationToEdit}
                onSave={handleSaveEdit}
                onClose={closeModals}
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Create Quotation">
            <QuotationCreate
                onSave={handleSaveCreate}
                onClose={closeModals}
            />
        </Modal>
    </div>
  )
}

export default QuotationList