import React, { useState } from 'react'
import Input from '../components/Input'
import Alert from '../components/Alert'
import Button from '../components/Button'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleLogin = (e) => {
        e.preventDefault();

        if(!email || !password){
            setError("Please fill in all fields");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email address");
            return;
        }

        setError("")
        //chamada da api
        console.log({ email, password })
    }

    return (
        <div className='login-container'>
            <h1>Pani Premium Login</h1>
            <form onSubmit={handleLogin}>
                <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                <Alert message={error} />
                <Button type="submit">Login</Button>
            </form>
            <p><a href="#">Forgot your password?</a></p>
            <p><a href="/create-company">New company? Create an account!</a></p>
        </div>
    )
}

export default Login