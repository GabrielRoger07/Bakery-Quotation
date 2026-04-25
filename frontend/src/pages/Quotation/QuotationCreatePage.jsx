import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuotationForm from './QuotationForm'
import { useMobilePage } from '../../contexts/MobilePageContext'

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
            onSave={() => navigate('/quotations')}
        />
    )
}

export default QuotationCreatePage
