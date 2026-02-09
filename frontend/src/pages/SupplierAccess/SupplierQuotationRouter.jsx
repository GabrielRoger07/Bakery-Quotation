import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import { ENV } from '../../config/env'
import SupplierQuotationScheduled from './SupplierQuotationScheduled'
import SupplierQuotationClosed from './SupplierQuotationClosed'
import SupplierQuotation from './SupplierQuotation'

const SupplierQuotationRouter = ({ quotationId, participationId }) => {
    
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [quotation, setQuotation] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchQuotation = useCallback(async () => {
        setLoading(true)
        const res = await request("GET", `/quotations/${quotationId}`)
        res.ok ? setQuotation(res.data) : setQuotation(null)
        setLoading(false)
    }, [request, quotationId])

    useEffect(() => {
        if(!quotationId) {
            setQuotation(null)
            setLoading(false)
            return
        }
        fetchQuotation()
    }, [fetchQuotation, quotationId])

    if(loading) return <p>{t("loading_message")}</p>
    if(!quotation) return <p>{t("quotation_not_found")}</p>

    const now = new Date()
    const start = new Date(quotation.quotationStart)
    const end = new Date(quotation.quotationEnd)

    if(now < start) {
        return <SupplierQuotationScheduled quotation={quotation} />
    }

    if(now > end) {
        return <SupplierQuotationClosed quotation={quotation} participationId={participationId} />
    }

    return (
        <SupplierQuotation quotationId={quotationId} participationId={participationId} />
    )
}

export default SupplierQuotationRouter