import React, { useEffect, useState } from 'react'
import SupplierAccessToken from './SupplierAccessToken'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import { ENV } from '../../config/env'
import SupplierQuotationRouter from './SupplierQuotationRouter'

const SupplierPage = () => {

    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('quotationId')
    const supplierId = searchParams.get('supplierId')

    const [accessGranted, setAccessGranted] = useState(false)
    const [participationId, setParticipationId] = useState(null)
    const [error, setError] = useState("")


    useEffect(() => {
        if(quotationId && supplierId){
            const fetchParticipationId = async () => {
                const res = await request("GET", `/participations/${quotationId}/${supplierId}`)
                if(res.ok){
                    setParticipationId(res.data.participationId)
                    setError("")
                }else{
                    setError(t("unable_fetch_participation"))
                }
            }

            fetchParticipationId()

        }else{
            setError(t("quotation_missing_url"))
        }
    }, [quotationId, supplierId, request, t])

    if(error) return <p>{error}</p>
    if(!participationId) return <p>{t("loading_message")}</p>

    return (
        <div className="supplier-page">
            {!accessGranted ? (
                <SupplierAccessToken 
                    participationId={participationId} 
                    onAccessGranted={() => {setAccessGranted(true)}} 
                />
            ) : (
                <SupplierQuotationRouter quotationId={quotationId} participationId={participationId} />
            )}
        </div>
    )
}

export default SupplierPage