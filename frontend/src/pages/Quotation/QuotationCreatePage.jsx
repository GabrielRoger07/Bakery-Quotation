import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuotationForm from '@/pages/Quotation/QuotationForm'
import { useMobilePage } from '@/contexts/MobilePageContext'

const QuotationCreatePage = () => {
    const navigate = useNavigate()
    const { registerPage, unregisterPage } = useMobilePage()

    useEffect(() => {
        registerPage('Nova Cotação', null)
        return () => unregisterPage()
    }, [registerPage, unregisterPage])

    return (
        <QuotationForm
            mode="create"
            onClose={() => navigate('/quotations')}
            onSave={() => navigate('/quotations', { state: { quotationSaved: 'create' } })}
        />
    )
}

export default QuotationCreatePage
