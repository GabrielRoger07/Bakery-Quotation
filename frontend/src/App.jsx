import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import PrivateRoute from '@/components/layout/PrivateRoute';
import MobilePageProvider from '@/contexts/MobilePageProvider';

import LandingPage from '@/pages/LandingPage';
import Login from '@/features/company/pages/Login';
import CompanyCreate from '@/features/company/pages/CompanyCreate';
import SupplierList from '@/features/suppliers/pages/SupplierList';
import ProductList from '@/features/products/pages/ProductList';
import QuotationList from '@/features/quotations/pages/QuotationList';
import QuotationCreatePage from '@/features/quotations/pages/QuotationCreatePage';
import QuotationEditPage from '@/features/quotations/pages/QuotationEditPage';
import Navbar from '@/components/layout/Navbar';
import SupplierNavbar from '@/components/layout/SupplierNavbar';
import QuotationMonitor from '@/features/quotations/pages/QuotationMonitor';
import SupplierAccessToken from '@/features/supplier-access/pages/SupplierAccessToken';
import SupplierPage from '@/features/supplier-access/pages/SupplierPage';
import SupplierQuotationPage from '@/features/supplier-access/pages/SupplierQuotationPage';
import SupplierRoute from '@/features/supplier-access/pages/SupplierRoute';

function App() {

  return (
    <BrowserRouter>
      <MobilePageProvider>
        <AppContent />
      </MobilePageProvider>
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()
  const showNavbarRoutes = ["/suppliers", "/products"]
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname) || location.pathname.startsWith("/quotations")
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
          <Route path="/quotations/new" element={<PrivateRoute> <QuotationCreatePage /> </PrivateRoute>}></Route>
          <Route path="/quotations/:id/edit" element={<PrivateRoute> <QuotationEditPage /> </PrivateRoute>}></Route>
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