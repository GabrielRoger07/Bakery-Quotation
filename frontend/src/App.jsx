import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute';

import LandingPage from './pages/Marketing/LandingPage';
import Login from './pages/Company/Login';
import CompanyCreate from './pages/Company/CompanyCreate';
import SupplierList from './pages/Supplier/SupplierList';
import ProductList from './pages/Product/ProductList';
import QuotationList from './pages/Quotation/QuotationList';
import Navbar from './components/Navbar';
import SupplierNavbar from './components/SupplierNavbar';
import QuotationMonitor from './pages/Quotation/QuotationMonitor';

import SupplierAccessToken from './pages/SupplierAccess/SupplierAccessToken';
import SupplierPage from './pages/SupplierAccess/SupplierPage';
import SupplierQuotationPage from './pages/SupplierAccess/SupplierQuotationPage';
import SupplierRoute from './pages/SupplierAccess/SupplierRoute';

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()
  const showNavbarRoutes = ["/suppliers", "/products", "/quotations", "/quotations/monitor"]
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname)
  const shouldShowSupplierNavbar = location.pathname.startsWith("/supplier") && !location.pathname.startsWith("/supplier/login/")

  return (
    <>
      {shouldShowNavbar ? <Navbar /> : shouldShowSupplierNavbar ? <SupplierNavbar /> : null}
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<CompanyCreate />}></Route>
          <Route path="/suppliers" element={<PrivateRoute> <SupplierList /> </PrivateRoute>}></Route>
          <Route path="/products" element={<PrivateRoute> <ProductList /> </PrivateRoute>}></Route>
          <Route path="/quotations" element={<PrivateRoute> <QuotationList /> </PrivateRoute>}></Route>
          <Route path="/quotations/monitor/" element={<PrivateRoute> <QuotationMonitor /> </PrivateRoute>}></Route>

          <Route path="/supplier/login/:companyCnpj" element={<SupplierAccessToken />}></Route>
          <Route path="/supplier/quotations/:companyCnpj" element={<SupplierRoute><SupplierPage /></SupplierRoute>}></Route>
          <Route path="/supplier/quotation" element={<SupplierRoute><SupplierQuotationPage /></SupplierRoute>}></Route>

          <Route path="*" element={<Navigate to="/login" />}></Route>
        </Routes>
    </>
  )
}

export default App