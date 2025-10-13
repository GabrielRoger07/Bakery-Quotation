import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const QuotationList = () => {

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const [quotations, setQuotations] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const handleDelete = async (quotationId) => {
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

    useEffect(() => {
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

        fetchQuotations();
    }, [request])

    return (
    <div className="quotation-list-container">
        <h1>All Quotations</h1>

        {loading && <p>Loading quotations...</p>}
        {error && <Alert message={error} />}
        {status === 0 && <Alert message="Server Internal Error" />}
        {!loading && !error && status !== 0 && quotations.length === 0 && <p>No quotations found.</p>}

        {console.log(quotations)}

        <div className='quotation-list'>
            <ul>
                {quotations.map((quotation) => (
                    <li key={quotation.quotationId} className="quotation-card">Start: {quotation.quotationStart} - End: {quotation.quotationEnd}
                    <Button onClick={() => handleDelete(quotation.quotationId)}>Delete</Button>
                    </li>
                ))}
            </ul>
        </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button onClick={() => createQuotation()}>Add Quotation</Button>
    </div>
  )
}

export default QuotationList