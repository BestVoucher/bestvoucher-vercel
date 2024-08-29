import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PersonalArea from './components/PersonalArea';
import OrderSummary from './components/OrderSummary';
import SellProduct from './components/SellProduct';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import Terms from './components/Terms';
import AdminDashboard from './components/AdminDashboard';
import ReceivedOrders from './components/ReceivedOrders';  // Importa la nuova pagina "Ordini Ricevuti"
import { AuthProvider } from './context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './components/Navbar';  // Importa il componente Navbar
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
          <Navbar /> {/* Usa il componente Navbar qui */}

          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/personal-area" element={<PersonalArea />} />
            <Route path="/sell-product" element={<SellProduct />} />
            <Route path="/product/:productId" element={<ProductDetail products={products} />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/order-summary/:orderNumber" element={<OrderSummary />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/received-orders" element={<ReceivedOrders />} /> {/* Route per la nuova pagina */}
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
                          <p>Prezzo: €{product.price}</p>
                          <p>Venduto da: {product.companyName}</p>
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