import { useState } from 'react'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const QuotationCreate = () => {

    const [quotationStart, setQuotationStart] = useState("")
    const [quotationEnd, setQuotationEnd] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const handleQuotationCreate = async(e) => {
        e.preventDefault()

        if(!quotationStart || !quotationEnd){
            setError("All the fields are required")
            setSuccess("")
            return;
        }

        setError("")

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        // chamar a api
        const quotation = {

            quotationStart,
            quotationEnd,
            companyCnpj: cnpj
        }

        console.log("valor em quotation: " + quotation)

        const res = await request("POST", "/quotations", quotation)

        if(res.ok){
            setSuccess("Quotation created successfully!")
            setError("")
            setTimeout(() => navigate("/quotations"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <div className="quotation-create-container">
        <h1>Product Create</h1>
            <form onSubmit={handleQuotationCreate}>
                <Input label="Quotation Start" type="datetime-local" name="quotationStart" value={quotationStart} onChange={(e) => setQuotationStart(e.target.value)} placeholder="Enter Quotation Start"/>
                <Input label="Quotation End" type="datetime-local" name="quotationEnd" value={quotationEnd} onChange={(e) => setQuotationEnd(e.target.value)} placeholder="Enter Quotation End"/>
                <Alert message={error} />
                {success && <div className="success">{success}</div>}
                <Button type="submit">Create Quotation</Button>
            </form>
        </div>
    )
}

export default QuotationCreate