import { useNavigate } from 'react-router-dom'
import QuotationForm from '@/pages/Quotation/QuotationForm'

const QuotationCreatePage = () => {
    const navigate = useNavigate()

    return (
        <QuotationForm
            mode="create"
            onClose={() => navigate('/quotations')}
            onSave={() => navigate('/quotations', { state: { quotationSaved: 'create' } })}
        />
    )
}

export default QuotationCreatePage
