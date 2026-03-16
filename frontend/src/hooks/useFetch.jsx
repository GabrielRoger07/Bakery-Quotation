import { useCallback, useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

const useFetch = (baseUrl = "") => {

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const request = useCallback(
        async (method, endpoint, body = null, headers = {}) => {
            setLoading(true)
            setError("")

            try{
                const accessToken = Cookies.get("accessToken")

                const options = {
                    method: method.toUpperCase(),
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        ...(accessToken ? {"Authorization": `Bearer ${accessToken}`} : {}),
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
                    Cookies.remove("accessToken")
                    navigate("/login")
                }

                return { data, status: response.status, ok: response.ok }

            }catch(err){
                setError(err.message || "Unexpected error")
                return { data: null, status: 0, ok: false }
            }finally{
                setLoading(false)
            }
        }, [baseUrl, navigate]
    )

  return { request, loading, error }
}

export default useFetch