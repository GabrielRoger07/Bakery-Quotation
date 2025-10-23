import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Button from "./Button";

const Navbar = () => {

    const navigate = useNavigate();

    const logout = () => {
    Cookies.remove("token");
    navigate("/login")
}

    return (
        <nav>
            <NavLink to="/suppliers">Suppliers</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/quotations">Quotations</NavLink>
            <Button onClick={logout}> Logout</Button>
        </nav>
    )
}

export default Navbar