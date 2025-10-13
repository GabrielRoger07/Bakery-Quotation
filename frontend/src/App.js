import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import CompanyCreate from './pages/create/CompanyCreate';
import SupplierList from './pages/list/SupplierList';
import ProductList from './pages/list/ProductList';
import SupplierCreate from './pages/create/SupplierCreate';
import ProductCreate from './pages/create/ProductCreate';
import QuotationList from './pages/list/QuotationList';
import QuotationCreate from './pages/create/QuotationCreate';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path= "/register" element={<CompanyCreate />}></Route>
          <Route path= "/create-supplier" element={<SupplierCreate />}></Route>
          <Route path= "/create-product" element={<ProductCreate />}></Route>
          <Route path= "/create-quotation" element={<QuotationCreate />}></Route>
          <Route path= "/suppliers" element={<SupplierList />}></Route>
          <Route path= "/products" element={<ProductList />}></Route>
          <Route path= "/quotations" element={<QuotationList />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;