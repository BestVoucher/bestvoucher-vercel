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
import PrivacyPolicy from './components/PrivacyPolicy';
import AdminDashboard from './components/AdminDashboard';
import ReceivedOrders from './components/ReceivedOrders';
import Cart from './components/Cart';
import GiftCard from './components/GiftCard';
import CompaniesByCategory from './components/CompaniesByCategory'; 
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollToTop from './hooks/ScrollToTop';  // Modifica qui l'import dell'hook
import ProductList from './components/ProductList';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';  
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop /> {/* Chiamata al componente ScrollToTop dentro il Router */}
        <div className="App">
          <Navbar />

          <div className="content">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/personal-area" element={<PersonalArea />} />
              <Route path="/companies-by-category" element={<CompaniesByCategory />} />
              <Route path="/company/:companydocname" element={<CompanyProfile />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/order-summary/:orderNumber" element={<OrderSummary />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/" element={<ProductList />} />

              {/* Rotte protette */}
              <Route
                path="/admin-dashboard"
                element={
                  <AdminRoute requiredRole="admin">
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/sell-product"
                element={
                  <ProtectedRoute requiredRole="company" companyApproved={true}>
                    <SellProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/received-orders"
                element={
                  <ProtectedRoute requiredRole="company" companyApproved={true}>
                    <ReceivedOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute requiredRole="user">
                    <Orders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gift-card"
                element={
                  <ProtectedRoute requiredRole="user">
                    <GiftCard />
                  </ProtectedRoute>
                }
              />

              {/* Consenti accesso al carrello per utenti "user" o non loggati */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute requiredRole={null}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;