import React, { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import '../../components/Auth.css'
import { ENV } from '../../config/env'

const SupplierAccessToken = ({ participationId, onAccessGranted }) => {

    const { t } = useTranslation()

    const [accessToken, setAccessToken] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { request } = useFetch(ENV.API_BASE_URL)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if(!accessToken.trim()){
            setError(t("access_token_required"))
            return
        }

        setError("")
        setLoading(true)

        const body = {
            accessToken: accessToken.trim()
        }

        const res = await request("POST", `/participations/validateToken/${participationId}`, body)

        setLoading(false)

        if(res.ok){
            setError("")
            onAccessGranted()
        }else{
            setError(t("invalid_access_token"))
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{t("enter_access_token")}</h2>
                <form onSubmit={handleSubmit}>
                    <Input type="text" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder={t("access_token")}></Input>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <Button type="submit" disabled={loading}>{loading ? t("validating_message") : t("access_quotation")}</Button>
                </form>
            </div>
        </div>
    )
}

export default SupplierAccessToken