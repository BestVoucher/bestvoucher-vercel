import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Register from './components/Register';
import Login from './components/Login';
import PersonalArea from './components/PersonalArea';
import OrderSummary from './components/OrderSummary';
import SellProduct from './components/SellProduct';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import CompanyProfile from './components/CompanyProfile';
import Terms from './components/Terms';
import FAQ from './components/FAQ';
import AdminDashboard from './components/AdminDashboard';
import ReceivedOrders from './components/ReceivedOrders';
import CompaniesByCategory from './components/CompaniesByCategory'; 
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import useScrollToTop from './hooks/useScrollToTop';  // Importa l'hook personalizzato
import ProductList from './components/ProductList'; // Importa il nuovo componente
import Footer from './components/Footer'; // Importa il componente Footer
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <useScrollToTop /> {/* Sposta l'uso di useScrollToTop qui */}

          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/personal-area" element={<PersonalArea />} />
            <Route path="/sell-product" element={<SellProduct />} />
            <Route path="/companies-by-category" element={<CompaniesByCategory />} />
            <Route path="/company/:companydocname" element={<CompanyProfile />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/order-summary/:orderNumber" element={<OrderSummary />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/received-orders" element={<ReceivedOrders />} />
            <Route path="/" element={<ProductList />} /> {/* Usa il nuovo componente per la homepage */}
          </Routes>
          <Footer /> {/* Aggiungi il footer qui */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;