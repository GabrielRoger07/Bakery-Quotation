import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import QuotationEdit from '../edit/QuotationEdit'

const QuotationList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)
    const [editingQuotation, setEditingQuotation] = useState(null)

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

    const createQuotation = () => {
        navigate("/create-quotation")
    }

    const handleEdit = (quotation) => {
        setEditingQuotation(quotation)
    }

    const handleCloseModal = () => {
        setEditingQuotation(null)
    }

    const fetchQuotations = async () => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const res = await request("GET", `/quotations/company/${cnpj}`)
        if(res.ok){
            setQuotations(res.data);
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
        <h1>Quotations</h1>

        {loading && <p>Loading quotations...</p>}
        {error && <Alert message={error} />}
        {status === 0 && <Alert message="Server Internal Error" />}
        {!loading && !error && status !== 0 && quotations.length === 0 && <p>No quotations found.</p>}

        {console.log(quotations)}

        <div className="quotation-list">
        {quotations.map((quotation) => {
          const started = new Date(quotation.quotationStart) <= new Date()

          return (
            <div key={quotation.quotationId} className="quotation-card">
              <p><strong>Start:</strong> {quotation.quotationStart}</p>
              <p><strong>End:</strong> {quotation.quotationEnd}</p>

              <div className="actions">
                <Button onClick={() => handleEdit(quotation)}>Edit</Button>
                <Button onClick={() => handleDelete(quotation.quotationId, started)} disabled={started}>
                  Delete
                </Button>
              </div>
            </div>
          )
        })}
      </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button onClick={() => createQuotation()}>Add Quotation</Button>

        {editingQuotation && (
            <Modal isOpen={!!editingQuotation} onClose={handleCloseModal} title="Edit Quotation">
                <QuotationEdit 
                    quotation={editingQuotation}
                    onClose={handleCloseModal}
                    onSave={fetchQuotations}
                />
            </Modal>
        )}
    </div>
  )
}

export default QuotationList