import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../Navbar.css';
import logo from '../assets/logo.png';
import cartIcon from '../assets/cart-icon.png';

function Navbar() {
  const { currentUser, userData, cartCount } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Funzione per ottenere il titolo della pagina attuale
  const getCurrentPageTitle = () => {
    const path = window.location.pathname;

    switch (true) {
      case path === '/':
        return 'BestVoucher';
      case path === '/personal-area':
        return 'Profilo';
      case path === '/companies-by-category':
        return 'Categorie';
      case path === '/cart':
        return 'Carrello';
      case path === '/terms':
        return 'Termini';
      case path === '/login':
        return 'Accedi';
      case path === '/register':
        return 'Registrati';
      case path === '/faq':
        return 'FAQ';
      case path === '/admin-dashboard':
        return 'Admin';
      case path === '/orders':
        return 'Ordini';
      case path === '/sell-product':
        return 'Vendi';
      case path === '/received-orders':
        return 'Ordini';
      case /^\/product\/.+$/.test(path):  // Verifica se il percorso inizia con "/product/"
        return 'Prodotto';
      case /^\/company\/.+$/.test(path):  // Verifica se il percorso inizia con "/company/"
        return 'Azienda';
      default:
        return 'Pagina';
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check the initial size
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Definizione della funzione handleNavigate
  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false); // Chiude il menu mobile
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Reindirizza alla homepage dopo il logout
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <NavLink to="/">
          <img src={logo} alt="Home" className="navbar-logo" />
        </NavLink>
      </div>

      {isMobile ? (
        <>
          <div className="navbar-mobile">
            <span className="navbar-page-title">{getCurrentPageTitle()}</span> {/* Titolo della pagina al centro */}
            <div className="navbar-mobile-right">
              {/* Mostra il pulsante carrello solo se l'utente non è loggato o ha il ruolo "user" */}
              {(!currentUser || userData?.role === 'user') && (
                <NavLink to="/cart" className="cart-link">
                  <img src={cartIcon} alt="Cart" className="cart-icon" />
                  {cartCount >= 0 && (
                    <span className={`cart-badge ${cartCount === 0 ? 'empty-cart-badge' : 'non-empty-cart-badge'}`}>{cartCount}</span>
                  )}
                </NavLink>
              )}
              <button className="menu-toggle-button" onClick={toggleMenu}>
                ☰
              </button>
            </div>
          </div>
          <ul className={`navbar-mobile-dropdown ${menuOpen ? 'open' : ''}`}>
            <li className="navbar-item">
              <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/personal-area" onClick={toggleMenu}>Profilo</NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/companies-by-category" onClick={toggleMenu}>Categorie</NavLink>
            </li>

            {/* Menu per gli amministratori */}
            {userData?.role === 'admin' && (
              <li className="navbar-item">
                <NavLink to="/admin-dashboard" onClick={toggleMenu}>Admin</NavLink>
              </li>
            )}

            {/* Menu per le aziende approvate */}
            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item">
                  <NavLink to="/sell-product" onClick={toggleMenu}>Vendi</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/received-orders" onClick={toggleMenu}>Ordini</NavLink>
                </li>
              </>
            )}

            {/* Menu per gli utenti */}
            {userData?.role === 'user' && (
              <li className="navbar-item">
                <NavLink to="/orders" onClick={toggleMenu}>Ordini</NavLink>
              </li>
            )}

            {/* Logout/Login */}
            {currentUser ? (
              <li className="navbar-item">
                <button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-button">Logout</button>
              </li>
            ) : (
              <li className="navbar-item">
                <NavLink to="/login" onClick={toggleMenu}>Login</NavLink>
              </li>
            )}
          </ul>
        </>
      ) : (
        <>
          <div className="navbar-menu-container">
            <ul className="navbar-menu">
              <li className="navbar-item"><NavLink to="/">Home</NavLink></li>

              {/* Dropdown Profilo tra Home e Categorie */}
              <li className="navbar-item profile-dropdown">
                <button className="profile-button">Profilo</button>
                <ul className="dropdown-menu">
                <li><button onClick={() => handleNavigate('/personal-area')} className='ap-button'>Area personale</button></li>
                  <li>
                    {currentUser ? (
                      <button onClick={handleLogout} className="logout-button">Logout</button>
                    ) : (
                      <NavLink to="/login">Login</NavLink>
                    )}
                  </li>
                </ul>
              </li>

              <li className="navbar-item"><NavLink to="/companies-by-category">Categorie</NavLink></li>

              {userData?.role === 'admin' && (
                <li className="navbar-item"><NavLink to="/admin-dashboard">Admin</NavLink></li>
              )}
              {userData?.role === 'company' && userData?.status === 'approved' && (
                <>
                  <li className="navbar-item"><NavLink to="/sell-product">Vendi</NavLink></li>
                  <li className="navbar-item"><NavLink to="/received-orders">Ordini</NavLink></li>
                </>
              )}
              {userData?.role === 'user' && (
                <li className="navbar-item"><NavLink to="/orders">Ordini</NavLink></li>
              )}
            </ul>
          </div>

          {/* Pulsante Carrello all'estrema destra con il badge */}
          <div className="navbar-cart-container">
            {/* Mostra il pulsante carrello solo se l'utente non è loggato o ha il ruolo "user" */}
            {(!currentUser || userData?.role === 'user') && (
              <NavLink to="/cart" className="cart-link">
                <img src={cartIcon} alt="Cart" className="cart-icon" />
                {cartCount >= 0 && (
                <span className={`cart-badge ${cartCount === 0 ? 'empty-cart-badge' : 'non-empty-cart-badge'}`}>{cartCount}</span>)}
              </NavLink>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;