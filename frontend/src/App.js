import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import CompanyCreate from './pages/create/CompanyCreate';
import SupplierList from './pages/list/SupplierList';
import ProductList from './pages/list/ProductList';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path= "/create-company" element={<CompanyCreate />}></Route>
          <Route path= "/suppliers" element={<SupplierList />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;