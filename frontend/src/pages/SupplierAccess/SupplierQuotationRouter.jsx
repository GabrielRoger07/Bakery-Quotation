import { useEffect, useState, useCallback } from 'react'
import useFetch from '@/hooks/useFetch'
import { ENV } from '@/config/env'
import SupplierQuotationScheduled from '@/pages/SupplierAccess/SupplierQuotationScheduled'
import SupplierQuotationClosed from '@/pages/SupplierAccess/SupplierQuotationClosed'
import SupplierQuotationActiveAuction from '@/pages/SupplierAccess/SupplierQuotationActiveAuction'
import SupplierQuotationActiveUnique from '@/pages/SupplierAccess/SupplierQuotationActiveUnique'

const SupplierQuotationRouter = ({ quotationId, participationId }) => {
    
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
            setQuotation(null) // eslint-disable-line react-hooks/set-state-in-effect
            setLoading(false)
            return
        }
        fetchQuotation()
    }, [fetchQuotation, quotationId])

    if(loading) return <p>Carregando...</p>
    if(!quotation) return <p>Cotação não encontrada</p>

    const now = new Date()
    const start = new Date(quotation.quotationStart)
    const end = new Date(quotation.quotationEnd)

    if(now < start) {
        return <SupplierQuotationScheduled quotation={quotation} />
    }

    if(now > end) {
        return <SupplierQuotationClosed quotation={quotation} participationId={participationId} />
    }

    if(!quotation.isAuction) {
        return <SupplierQuotationActiveUnique quotationId={quotationId} participationId={participationId} />
    }

    return (
        <SupplierQuotationActiveAuction quotationId={quotationId} participationId={participationId} />
    )
}

export default SupplierQuotationRouter