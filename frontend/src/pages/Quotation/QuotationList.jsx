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
import Button from '../../components/Button'
import { ENV } from '../../config/env'

const QuotationList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate()

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [quotationToEdit, setQuotationToEdit] = useState(null)
    const [quotationToView, setQuotationToView] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [quotationToRemove, setQuotationToRemove] = useState(null)
    const [cannotDelete, setCannotDelete] = useState(false)

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
        setConfirmOpen(false)
        setQuotationToRemove(null)
        setCannotDelete(false)
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

    const requestRemove = (quotationId) => {
        const q = quotations.find((x) => x.quotationId === quotationId)
        if(new Date(q.quotationStart) <= new Date()){
            setCannotDelete(true)
            setConfirmOpen(true)
            setQuotationToRemove(null)
        }else{
            setQuotationToRemove(q)
            setCannotDelete(false)
            setConfirmOpen(true)
        }
    }

    const confirmRemove = async () => {
        if(!quotationToRemove) return

        const res = await request("DELETE", `/quotations/${quotationToRemove.quotationId}`)
        if(res.ok){
            setQuotations(prevQuotations => prevQuotations.filter(q => q.quotationId !== quotationToRemove.quotationId))
            setError("")
        }else{
            setError(res.data?.message || "Failed to delete quotation")
        }
        closeModals()
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
            onDelete={requestRemove}
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

        <Modal isOpen={confirmOpen} onClose={closeModals} title="Confirm Removal">
            {cannotDelete ? (
                <p className="confirm-message">You cannot remove a quotation that has already started.</p>
            ) : (
                <div className="confirm-container">
                    <p className="confirm-message">Are you sure want to remove quotation <strong>{quotationToRemove?.quotationId}</strong>?</p>
                    <div className="confirm-buttons">
                        <Button onClick={closeModals}>Cancel</Button>
                        <Button onClick={confirmRemove} disabled={loading}>Confirm</Button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  )
}

export default QuotationList