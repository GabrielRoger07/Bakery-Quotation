import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Company/Login';
import CompanyCreate from './pages/Company/CompanyCreate';
import SupplierList from './pages/Supplier/SupplierList';
import ProductList from './pages/Product/ProductList';
import QuotationList from './pages/Quotation/QuotationList';
import SupplierPage from './pages/SupplierAccess/SupplierPage';
import Navbar from './components/Navbar';
import QuotationMonitor from './pages/Quotation/QuotationMonitor';

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent(){
  const location = useLocation()
  const showNavbarRoutes = ["/suppliers", "/products", "/quotations"]
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname)

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path= "/register" element={<CompanyCreate />}></Route>
          <Route path= "/suppliers" element={<PrivateRoute> <SupplierList /> </PrivateRoute>}></Route>
          <Route path= "/products" element={<PrivateRoute> <ProductList /> </PrivateRoute>}></Route>
          <Route path= "/quotations" element={<PrivateRoute> <QuotationList /> </PrivateRoute>}></Route>
          <Route path= "/quotations/monitor/" element={<PrivateRoute> <QuotationMonitor /> </PrivateRoute>}></Route>
          <Route path= "/quotation" element={<SupplierPage />}></Route>
          <Route path="*" element={<Navigate to="/login" />}></Route>
        </Routes>
    </div>
  );
}

export default App;