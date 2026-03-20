import { createContext } from 'react'

const FetchAuthContext = createContext({
    cookieName: "accessToken",
    loginPath: "/login"
})

export default FetchAuthContext
