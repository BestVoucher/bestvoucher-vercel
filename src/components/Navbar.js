import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      default:
        return 'Pagina';
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
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
        <button className="logo-button" onClick={() => handleNavigate('/')}>
          <img src={logo} alt="Home" className="navbar-logo" />
        </button>
      </div>

      {isMobile ? (
        <>
          <div className="navbar-mobile">
            <span className="navbar-page-title">{getCurrentPageTitle()}</span>
            <div className="navbar-mobile-right">
              {(!currentUser || userData?.role === 'user') && (
                <button className="cart-link" onClick={() => handleNavigate('/cart')}>
                  <img src={cartIcon} alt="Cart" className="cart-icon" />
                  {cartCount >= 0 && (
                    <span className={`cart-badge ${cartCount === 0 ? 'empty-cart-badge' : 'non-empty-cart-badge'}`}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button className="menu-toggle-button" onClick={toggleMenu}>
                ☰
              </button>
            </div>
          </div>
          <ul className={`navbar-mobile-dropdown ${menuOpen ? 'open' : ''}`}>
            <li className="navbar-item">
              <button onClick={() => handleNavigate('/')}>Home</button>
            </li>
            <li className="navbar-item">
              <button onClick={() => handleNavigate('/personal-area')}>Profilo</button>
            </li>
            <li className="navbar-item">
              <button onClick={() => handleNavigate('/companies-by-category')}>Categorie</button>
            </li>

            {userData?.role === 'admin' && (
              <li className="navbar-item">
                <button onClick={() => handleNavigate('/admin-dashboard')}>Admin</button>
              </li>
            )}

            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item">
                  <button onClick={() => handleNavigate('/sell-product')}>Vendi</button>
                </li>
                <li className="navbar-item">
                  <button onClick={() => handleNavigate('/received-orders')}>Ordini</button>
                </li>
              </>
            )}

            {userData?.role === 'user' && (
              <li className="navbar-item">
                <button onClick={() => handleNavigate('/orders')}>Ordini</button>
              </li>
            )}

            {currentUser ? (
              <li className="navbar-item">
                <button onClick={handleLogout} className="dp-logout-button">Logout</button>
              </li>
            ) : (
              <li className="navbar-item">
                <button onClick={() => handleNavigate('/login')} className='dp-login-button'>Login</button>
              </li>
            )}
          </ul>
        </>
      ) : (
        <>
          <div className="navbar-menu-container">
            <ul className="navbar-menu">
              <li className="navbar-item"><button onClick={() => handleNavigate('/')}>Home</button></li>

              <li className="navbar-item profile-dropdown">
                <button className="profile-button">Profilo</button>
                <ul className="dropdown-menu">
                  <li><button onClick={() => handleNavigate('/personal-area')} className='ap-button'>Area personale</button></li>
                  <li>
                    {currentUser ? (
                      <button onClick={handleLogout} className="logout-button">Logout</button>
                    ) : (
                      <button onClick={() => handleNavigate('/login')} className='profile-login-button'>Login</button>
                    )}
                  </li>
                </ul>
              </li>

              <li className="navbar-item"><button onClick={() => handleNavigate('/companies-by-category')}>Categorie</button></li>

              {userData?.role === 'admin' && (
                <li className="navbar-item"><button onClick={() => handleNavigate('/admin-dashboard')}>Admin</button></li>
              )}
              {userData?.role === 'company' && userData?.status === 'approved' && (
                <>
                  <li className="navbar-item"><button onClick={() => handleNavigate('/sell-product')}>Vendi</button></li>
                  <li className="navbar-item"><button onClick={() => handleNavigate('/received-orders')}>Ordini</button></li>
                </>
              )}
              {userData?.role === 'user' && (
                <li className="navbar-item"><button onClick={() => handleNavigate('/orders')}>Ordini</button></li>
              )}
            </ul>
          </div>

          <div className="navbar-cart-container">
            {(!currentUser || userData?.role === 'user') && (
              <button className="cart-link" onClick={() => handleNavigate('/cart')}>
                <img src={cartIcon} alt="Cart" className="cart-icon" />
                {cartCount >= 0 && (
                <span className={`cart-badge ${cartCount === 0 ? 'empty-cart-badge' : 'non-empty-cart-badge'}`}>{cartCount}</span>)}
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;