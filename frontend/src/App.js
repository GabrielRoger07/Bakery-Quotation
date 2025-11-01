import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

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
          {/*
          <Route path= "/create-supplier" element={<SupplierCreate />}></Route>
          <Route path= "/create-product" element={<ProductCreate />}></Route>
          <Route path= "/create-quotation" element={<QuotationCreate />}></Route>
          */}
          <Route path= "/suppliers" element={<SupplierList />}></Route>
          <Route path= "/products" element={<ProductList />}></Route>
          <Route path= "/quotations" element={<QuotationList />}></Route>
          <Route path= "/quotations/monitor/" element={<QuotationMonitor />}></Route>
          <Route path= "/quotation" element={<SupplierPage />}></Route>
          <Route path="*" element={<Navigate to="/login" />}></Route>
        </Routes>
    </div>
  );
}

export default App;