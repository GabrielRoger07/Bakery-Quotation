import React, { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import useFetch from '../../hooks/useFetch'
import '../../components/Auth.css'

const SupplierAccessToken = ({ participationId, onAccessGranted }) => {

    const [accessToken, setAccessToken] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { request } = useFetch("http://localhost:8080/api/v1")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if(!accessToken.trim()){
            setError("Access token is required")
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
            setError(res.data?.message || "Invalid token")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Enter your access token</h2>
                <form onSubmit={handleSubmit}>
                    <Input type="text" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="Access Token"></Input>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <Button type="submit" disabled={loading}>{loading ? "Validating..." : "Access Quotation"}</Button>
                </form>
            </div>
        </div>
    )
}

export default SupplierAccessToken