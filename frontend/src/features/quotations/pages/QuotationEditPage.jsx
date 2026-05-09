import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import QuotationForm from '@/features/quotations/pages/QuotationForm'
import { useMobilePage } from '@/contexts/MobilePageContext'
import { ENV } from '@/config/env'

const QuotationEditPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)
    const { registerPage, unregisterPage } = useMobilePage()

    const [quotation, setQuotation] = useState(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        registerPage('Editar Cotação', null)
        return () => unregisterPage()
    }, [registerPage, unregisterPage])

    useEffect(() => {
        const fetch = async () => {
            const res = await request("GET", `/quotations/${id}`)
            if (res.ok) {
                setQuotation(res.data)
            } else {
                setNotFound(true)
            }
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (notFound) {
        return (
            <div className="page-wrapper flex flex-col items-center justify-center gap-3 py-16">
                <p className="text-[var(--color-text-muted)] text-[0.9375rem]">Cotação não encontrada.</p>
                <button
                    onClick={() => navigate('/quotations')}
                    className="text-[var(--color-accent)] text-[0.875rem] font-medium underline underline-offset-2 cursor-pointer bg-none border-none"
                >
                    Voltar para cotações
                </button>
            </div>
        )
    }

    if (!quotation) return null

    return (
        <QuotationForm
            mode="edit"
            initialData={quotation}
            onClose={() => navigate('/quotations')}
            onSave={() => navigate('/quotations')}
        />
    )
}

export default QuotationEditPage
