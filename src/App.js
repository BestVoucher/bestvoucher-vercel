import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';
import logo from './assets/logo.png';
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

function Navbar() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Reindirizza alla homepage dopo il logout
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <Link to="/">
          <img src={logo} alt="Home" className="navbar-logo" />
        </Link>
      </div>

      <div className="navbar-menu-container">
        <ul className="navbar-menu">
          <li className="navbar-item"><Link to="/">Home</Link></li>
          <li className="navbar-item"><Link to="/personal-area">Area Personale</Link></li>
          
          {/* Mostra il link Admin Dashboard solo se l'utente è un admin */}
          {userData?.role === 'admin' && (
            <li className="navbar-item"><Link to="/admin-dashboard">Dashboard Admin</Link></li>
          )}

          {/* Mostra il pulsante "Vendi" e "Ordini Ricevuti" solo se l'utente è un'azienda approvata */}
          {userData?.role === 'company' && userData?.status === 'approved' && (
            <>
              <li className="navbar-item"><Link to="/sell-product">Vendi</Link></li>
              <li className="navbar-item"><Link to="/received-orders">Ordini ricevuti</Link></li>
            </>
          )}

          {/* Mostra il link "Ordini Effettuati" solo se l'utente è loggato come utente (non azienda) */}
          {userData?.role === 'user' && (
            <li className="navbar-item"><Link to="/orders">I miei ordini</Link></li>
          )}

          {/* Mostra il link "Login" solo se l'utente non è loggato */}
          {!currentUser && (
            <li className="navbar-item"><Link to="/login">Login</Link></li>
          )}
        </ul>
      </div>
      
      {/* Sposta il pulsante "Logout" tutto a destra */}
      {currentUser && (
        <div className="navbar-logout-container">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}
    </nav>
  );
}

export default App;