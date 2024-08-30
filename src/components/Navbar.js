import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../Navbar.css';
import logo from '../assets/logo.png';

function Navbar() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const getCurrentPageTitle = () => {
    const path = window.location.pathname;
  
    switch (true) {
      case path === '/':
        return 'Home';
      case path === '/personal-area':
        return 'Profilo';
      case path === '/admin-dashboard':
        return 'Admin';
      case path === '/sell-product':
        return 'Vendi';
      case path === '/received-orders':
        return 'Ordini';
      case path === '/orders':
        return 'Ordini';
      case path === '/login':
        return 'Login';
      case path === '/register':
        return 'Registrazione';
      case /^\/product\/[^/]+$/.test(path): // Verifica se il percorso corrisponde a "/product/qualcosa"
        return 'Acquista';
      default:
        return '';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <NavLink to="/">
          <img src={logo} alt="Home" className="navbar-logo" />
        </NavLink>
      </div>

      {isMobile ? (
        <div className="navbar-mobile-menu">
          <span className="navbar-page-title">{getCurrentPageTitle()}</span>
          <button className="menu-toggle-button" onClick={toggleMenu}>
            ☰
          </button>
          <ul className={`navbar-mobile-dropdown ${menuOpen ? 'open' : ''}`}>
            <li className="navbar-item">
              <NavLink to="/" onClick={toggleMenu} activeClassName="active">Home</NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/personal-area" onClick={toggleMenu} activeClassName="active">Profilo</NavLink>
            </li>

            {userData?.role === 'admin' && (
              <li className="navbar-item">
                <NavLink to="/admin-dashboard" onClick={toggleMenu} activeClassName="active">Dashboard Admin</NavLink>
              </li>
            )}

            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item">
                  <NavLink to="/sell-product" onClick={toggleMenu} activeClassName="active">Vendi</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/received-orders" onClick={toggleMenu} activeClassName="active">Ordini</NavLink>
                </li>
              </>
            )}

            {userData?.role === 'user' && (
              <li className="navbar-item">
                <NavLink to="/orders" onClick={toggleMenu} activeClassName="active">Ordini</NavLink>
              </li>
            )}

            <li className="navbar-item">
              {currentUser ? (
                <button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-button">Logout</button>
              ) : (
                <NavLink to="/login" onClick={toggleMenu} activeClassName="active">Login</NavLink>
              )}
            </li>
          </ul>
        </div>
      ) : (
        <>
          <div className="navbar-menu-container">
            <ul className="navbar-menu">
              <li className="navbar-item"><NavLink to="/" activeClassName="active">Home</NavLink></li>
              <li className="navbar-item"><NavLink to="/personal-area" activeClassName="active">Profilo</NavLink></li>

              {userData?.role === 'admin' && (
                <li className="navbar-item"><NavLink to="/admin-dashboard" activeClassName="active">Admin</NavLink></li>
              )}

              {userData?.role === 'company' && userData?.status === 'approved' && (
                <>
                  <li className="navbar-item"><NavLink to="/sell-product" activeClassName="active">Vendi</NavLink></li>
                  <li className="navbar-item"><NavLink to="/received-orders" activeClassName="active">Ordini</NavLink></li>
                </>
              )}

              {userData?.role === 'user' && (
                <li className="navbar-item"><NavLink to="/orders" activeClassName="active">Ordini</NavLink></li>
              )}
            </ul>
          </div>
          <div className="navbar-logout-container">
            {currentUser ? (
              <button onClick={handleLogout} className="logout-button">Logout</button>
            ) : (
              <NavLink to="/login" className="login-button-navbar">Login</NavLink>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;