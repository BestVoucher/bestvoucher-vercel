import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import Register from './components/Register';
import Login from './components/Login';
import PersonalArea from './components/PersonalArea';
import OrderSummary from './components/OrderSummary';
import SellProduct from './components/SellProduct';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import CompanyProfile from './components/CompanyProfile';
import Terms from './components/Terms';
import AdminDashboard from './components/AdminDashboard';
import ReceivedOrders from './components/ReceivedOrders';
import CompaniesByCategory from './components/CompaniesByCategory'; 
import { AuthProvider } from './context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './components/Navbar';
import useScrollToTop from './hooks/useScrollToTop';  // Importa l'hook personalizzato
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (err) {
        console.error('Errore durante il recupero dei prodotti:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

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
            <Route path="/product/:productId" element={<ProductDetail products={products} />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/order-summary/:orderNumber" element={<OrderSummary />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/received-orders" element={<ReceivedOrders />} />
            <Route path="/" element={
              <div className="App">
                <h1>Acquista i tuoi voucher e risparmia!</h1>
                {products.length > 0 ? (
                  <div className="products-list">
                    {products.map((product, index) => (
                      <div key={index} className="product-card">
                        <Link to={`/product/${product.id}`}>
                          <img src={product.imageUrl} alt={product.title} />
                          <h2>{product.title}</h2>
                          <p><strong>Prezzo di listino:</strong> € <s>{product.normalPrice}</s></p>
                          <p><strong>Prezzo BestVoucher:</strong> € {product.price}</p>
                          <p><strong>Offerto da:</strong> {product.companyName}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Non ci sono prodotti disponibili al momento.</p>
                )}
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;