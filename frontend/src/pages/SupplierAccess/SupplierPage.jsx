import React, { useEffect, useState } from 'react'
import SupplierAccessToken from './SupplierAccessToken'
import SupplierQuotation from './SupplierQuotation'
import { useSearchParams } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'

const SupplierPage = () => {

    const [searchParams] = useSearchParams()
    const quotationId = searchParams.get('quotationId')
    const supplierId = searchParams.get('supplierId')

    const [accessGranted, setAccessGranted] = useState(false)
    const [participationId, setParticipationId] = useState(null)
    const [error, setError] = useState("")

    const { request } = useFetch("http://localhost:8080/api/v1")

    useEffect(() => {
        if(quotationId && supplierId){
            const fetchParticipationId = async () => {
                const res = await request("GET", `/participations/${quotationId}/${supplierId}`)
                if(res.ok){
                    setParticipationId(res.data.participationId)
                    setError("")
                }else{
                    setError(res.data?.message || "Unable to fetch participation")
                }
            }

            fetchParticipationId()

        }else{
            setError("Missing quotationId or supplierId in URL")
        }
    }, [quotationId, supplierId])

    if(error) return <p>{error}</p>
    if(!participationId) return <p>Loading...</p>

    return (
        <div className="supplier-page">
            {!accessGranted ? (
                <SupplierAccessToken 
                    participationId={participationId} 
                    onAccessGranted={() => {setAccessGranted(true)}} 
                />
            ) : (
                <SupplierQuotation participationId={participationId} quotationId={quotationId} />
            )}
        </div>
    )
}

export default SupplierPage