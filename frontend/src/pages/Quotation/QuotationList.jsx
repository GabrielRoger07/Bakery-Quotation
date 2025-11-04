import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Modal from '../../components/Modal'
import Table from '../../components/Table'
import Alert from '../../components/Alert'
import QuotationCreate from './QuotationCreate'
import QuotationEdit from './QuotationEdit'
import QuotationDetails from './QuotationDetails'
import './QuotationList.css'

const QuotationList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")

    const navigate = useNavigate()

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToEdit, setQuotationToEdit] = useState(null)
    const [quotationToView, setQuotationToView] = useState(null)

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

    const openDetailsModal = (quotation) => {
        setQuotationToView(quotation)
        setIsDetailsModalOpen(true)
    }

    const closeModals = () => {
        setQuotationToEdit(null)
        setQuotationToView(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setIsDetailsModalOpen(false)
    }

    const handleSaveCreate = (newQuotation) => {
        const status = new Date(newQuotation.quotationStart) > new Date() ? 'Scheduled' : new Date(newQuotation.quotationEnd) < new Date() ? 'Closed' : 'Active' 
        setQuotations((prev) => [...prev, { ...newQuotation, status}])
    }

    const handleSaveEdit = (updatedQuotation) => {
        const status = new Date(updatedQuotation.quotationStart) > new Date() ? 'Scheduled' : new Date(updatedQuotation.quotationEnd) < new Date() ? 'Closed' : 'Active'
        setQuotations((prev) => 
            prev.map((q) => q.quotationId === updatedQuotation.quotationId ? {...updatedQuotation, status} : q)
        )
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

    const handleMonitor = (quotation) => {
        navigate(`/quotations/monitor?id=${quotation.quotationId}`)
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
            onView={openDetailsModal}
            onMonitor={handleMonitor}
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

        <Modal isOpen={isDetailsModalOpen} onClose={closeModals} title="Quotation Details">
            <QuotationDetails
                quotation={quotationToView}
            />
        </Modal>
    </div>
  )
}

export default QuotationList