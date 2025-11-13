import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
import { ENV } from '../../config/env'

const Login = () => {
    const [companyEmail, setCompanyEmail] = useState("")
    const [companyPassword, setCompanyPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request, loading } = useFetch(ENV.API_BASE_URL)
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

        const login = {
            companyEmail,
            companyPassword
        }

        const res = await request("POST", "/companies/login", login)

        if(res.ok){
            setSuccess("Login successfully!")
            setError("")
            const token = res.data.token
            Cookies.set("token", token)
            setTimeout(() => navigate("/suppliers"), 1000)
        }else{
            setSuccess("")
            setError(res.data?.message)
        }
    }

    return (
        <div className='auth-container'>
            <div className='auth-box'>
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <Input label="Email" type="email" name="companyEmail" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="Enter your email" />
                    <Input label="Password" type="password" name="companyPassword" value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} placeholder="Enter your password" />
                    <Alert message={error} />
                    {success && <div className="success">{success}</div>}
                    <Button type="submit" loading={loading}>Login</Button>
                </form>
                {/*
                <p><a href="#">Forgot your password?</a></p>
                */}
                <p>
                    <Link to="/register">New company? Create an account!</Link>
                </p>
            </div>
        </div>
    )
}

export default Login