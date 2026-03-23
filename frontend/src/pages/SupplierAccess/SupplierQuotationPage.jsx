import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import { ENV } from '../../config/env'
import SupplierQuotationRouter from './SupplierQuotationRouter'

const SupplierQuotationPage = () => {

    const { t } = useTranslation()
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
                setError(t("unable_fetch_participation"))
            }
        }

        validate()
    }, [quotationId, participationId, request, t])

    if (!quotationId || !participationId) return <p>{t("quotation_missing_url")}</p>
    if (error) return <p>{error}</p>
    if (!validated) return <p>{t("loading_message")}</p>

    return <SupplierQuotationRouter quotationId={quotationId} participationId={participationId} />
}

export default SupplierQuotationPage
