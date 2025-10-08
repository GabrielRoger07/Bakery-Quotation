import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import CompanyCreate from './pages/create/CompanyCreate';
import SupplierList from './pages/list/SupplierList';
import ProductList from './pages/list/ProductList';
import SupplierCreate from './pages/create/SupplierCreate';
import ProductCreate from './pages/create/ProductCreate';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path= "/create-company" element={<CompanyCreate />}></Route>
          <Route path= "/create-supplier" element={<SupplierCreate />}></Route>
          <Route path= "/create-product" element={<ProductCreate />}></Route>
          <Route path= "/suppliers" element={<SupplierList />}></Route>
          <Route path= "/products" element={<ProductList />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;