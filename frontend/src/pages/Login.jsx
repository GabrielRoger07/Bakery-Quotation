import React, { useState } from 'react'
import Input from '../components/Input'
import Alert from '../components/Alert'
import Button from '../components/Button'
import useFetch from '../hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const Login = () => {
    const [companyEmail, setCompanyEmail] = useState("")
    const [companyPassword, setCompanyPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [user, setUser] = useState(null)

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault();

        if(!companyEmail || !companyPassword){
            setError("Please fill in all fields");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError("Invalid email address");
            return;
        }

        setError("")

        //chamada da api
        const login = {
            companyEmail,
            companyPassword
        }

        console.log(login)

        const res = await request("POST", "/companies/login", login)

        if(res.ok){
            setSuccess("Login successfully!")
            setError("")
            const token = res.data.token
            console.log(token)
            Cookies.set("token", token)
            setTimeout(() => navigate("/suppliers"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }

        console.log(res.data.token)
    }

    return (
        <div className='login-container'>
            <h1>Pani Premium Login</h1>
            <form onSubmit={handleLogin}>
                <Input label="Email" type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="Enter your email" />
                <Input label="Password" type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder="Enter your password" />
                <Alert message={error} />
                {success && <div className="success">{success}</div>}
                <Button type="submit">Login</Button>
            </form>
            <p><a href="#">Forgot your password?</a></p>
            <p><a href="/create-company">New company? Create an account!</a></p>
        </div>
    )
}

export default Login