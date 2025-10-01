import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CompanyCreate from './pages/CompanyCreate';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path= "/create-company" element={<CompanyCreate />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
