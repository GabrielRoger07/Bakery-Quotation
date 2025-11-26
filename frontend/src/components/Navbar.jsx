import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import LangSwitcher from "./LangSwitcher";
import './Navbar.css'

const Navbar = () => {

    const { t } = useTranslation()

    const navigate = useNavigate();

    const logout = () => {
    Cookies.remove("token");
    navigate("/login")
}

    return (
        <nav className="navbar">
            <div className="navbar-center">
                <NavLink to="/suppliers">{t("navbar_suppliers")}</NavLink>
                <NavLink to="/products">{t("navbar_products")}</NavLink>
                <NavLink to="/quotations">{t("navbar_quotations")}</NavLink>
            </div>
            <div className="navbar-right">
                <LangSwitcher />
                <Button onClick={logout}>{t("navbar_logout")}</Button>
            </div>
        </nav>
    )
}

export default Navbar