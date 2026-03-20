import { useCallback, useContext, useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import FetchAuthContext from '../contexts/FetchAuthContext'

const useFetch = (baseUrl = "") => {

    const navigate = useNavigate()
    const { cookieName, loginPath } = useContext(FetchAuthContext)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const request = useCallback(
        async (method, endpoint, body = null, headers = {}) => {
            setLoading(true)
            setError("")

            try{
                const token = Cookies.get(cookieName)

                const options = {
                    method: method.toUpperCase(),
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        ...(token ? {"Authorization": `Bearer ${token}`} : {}),
                        ...headers
                    }
                };

                if(body && method !== "GET"){
                    options.body = JSON.stringify(body)
                }

                const response = await fetch(`${baseUrl}${endpoint}`, options)

                const isJson = response.headers
                    .get("content-type")
                    ?.includes("application/json")

                const data = isJson ? await response.json().catch(()=> null) : null

                if(!response.ok){
                    setError(data?.message || `HTTP ${response.status}`)
                }

                if(response.status === 403){
                    Cookies.remove(cookieName)
                    navigate(loginPath)
                }

                return { data, status: response.status, ok: response.ok }

            }catch(err){
                setError(err.message || "Unexpected error")
                return { data: null, status: 0, ok: false }
            }finally{
                setLoading(false)
            }
        }, [baseUrl, navigate, cookieName, loginPath]
    )

  return { request, loading, error }
}

export default useFetch