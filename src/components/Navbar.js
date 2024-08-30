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
    switch (path) {
      case '/':
        return 'Home';
      case '/personal-area':
        return 'Profilo';
      case '/admin-dashboard':
        return 'Dashboard Admin';
      case '/sell-product':
        return 'Vendi';
      case '/received-orders':
        return 'Ordini ricevuti';
      case '/orders':
        return 'Ordini';
      case '/login':
        return 'Login';
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
          {menuOpen && (
            <ul className="navbar-mobile-dropdown">
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
                    <NavLink to="/received-orders" onClick={toggleMenu} activeClassName="active">Ordini ricevuti</NavLink>
                  </li>
                </>
              )}

              {userData?.role === 'user' && (
                <li className="navbar-item">
                  <NavLink to="/orders" onClick={toggleMenu} activeClassName="active">Ordini</NavLink>
                </li>
              )}

              {!currentUser && (
                <li className="navbar-item">
                  <NavLink to="/login" onClick={toggleMenu} activeClassName="active">Login</NavLink>
                </li>
              )}

              {currentUser && (
                <li className="navbar-item">
                  <button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-button">Logout</button>
                </li>
              )}
            </ul>
          )}
        </div>
      ) : (
        <div className="navbar-menu-container">
          <ul className="navbar-menu">
            <li className="navbar-item"><NavLink to="/" activeClassName="active">Home</NavLink></li>
            <li className="navbar-item"><NavLink to="/personal-area" activeClassName="active">Profilo</NavLink></li>

            {userData?.role === 'admin' && (
              <li className="navbar-item"><NavLink to="/admin-dashboard" activeClassName="active">Dashboard Admin</NavLink></li>
            )}

            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item"><NavLink to="/sell-product" activeClassName="active">Vendi</NavLink></li>
                <li className="navbar-item"><NavLink to="/received-orders" activeClassName="active">Ordini ricevuti</NavLink></li>
              </>
            )}

            {userData?.role === 'user' && (
              <li className="navbar-item"><NavLink to="/orders" activeClassName="active">Ordini</NavLink></li>
            )}

            {!currentUser && (
              <li className="navbar-item"><NavLink to="/login" activeClassName="active">Login</NavLink></li>
            )}
          </ul>
        </div>
      )}

      {currentUser && !isMobile && (
        <div className="navbar-logout-container">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;