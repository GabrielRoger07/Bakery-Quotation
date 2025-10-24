import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Button from "./Button";
import './Navbar.css'

const Navbar = () => {

    const navigate = useNavigate();

    const logout = () => {
    Cookies.remove("token");
    navigate("/login")
}

    return (
        <nav className="navbar">
            <div className="navbar-center">
                <NavLink to="/suppliers">Suppliers</NavLink>
                <NavLink to="/products">Products</NavLink>
                <NavLink to="/quotations">Quotations</NavLink>
            </div>
            <div className="navbar-right">
                <Button onClick={logout}> Logout</Button>
            </div>
        </nav>
    )
}

export default Navbar