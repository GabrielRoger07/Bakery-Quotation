import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useFetch from '@/hooks/useFetch'
import { ENV } from '@/config/env'
import SupplierQuotationRouter from '@/pages/SupplierAccess/SupplierQuotationRouter'

const SupplierQuotationPage = () => {

    const { request } = useFetch(ENV.API_BASE_URL)

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('quotationId')
    const participationId = Number(searchParams.get('participationId'))

    const [validated, setValidated] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!quotationId || !participationId) return

        const validate = async () => {
            const res = await request("GET", `/participations/${participationId}`)
            if (res.ok) {
                setValidated(true)
            } else if (res.status !== 403) {
                setError("Não foi possível encontrar a participação")
            }
        }

        validate()
    }, [quotationId, participationId, request])

    if (!quotationId || !participationId) return <p>Está faltando quotationId e/ou supplierId na URL</p>
    if (error) return <p>{error}</p>
    if (!validated) return <p>Carregando...</p>

    return <SupplierQuotationRouter quotationId={quotationId} participationId={participationId} />
}

export default SupplierQuotationPage
