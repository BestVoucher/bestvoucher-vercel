import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <Link to="/">
          <img src={logo} alt="Home" className="navbar-logo" />
        </Link>
      </div>

      {isMobile ? (
        <div className="navbar-mobile-menu">
          <button className="menu-toggle-button" onClick={toggleMenu}>
            ☰
          </button>
          <ul className={`navbar-mobile-dropdown ${menuOpen ? 'open' : ''}`}>
            <li className="navbar-item"><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li className="navbar-item"><Link to="/personal-area" onClick={toggleMenu}>Profilo</Link></li>
              
            {userData?.role === 'admin' && (
              <li className="navbar-item"><Link to="/admin-dashboard" onClick={toggleMenu}>Dashboard Admin</Link></li>
            )}

            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item"><Link to="/sell-product" onClick={toggleMenu}>Vendi</Link></li>
                <li className="navbar-item"><Link to="/received-orders" onClick={toggleMenu}>Ordini ricevuti</Link></li>
              </>
            )}

            {userData?.role === 'user' && (
              <li className="navbar-item"><Link to="/orders" onClick={toggleMenu}>Ordini</Link></li>
            )}

            {!currentUser && (
              <li className="navbar-item"><Link to="/login" onClick={toggleMenu}>Login</Link></li>
            )}

            {currentUser && (
              <li className="navbar-item"><button onClick={() => { handleLogout(); toggleMenu(); }} className="logout-button">Logout</button></li>
            )}
          </ul>
        </div>
      ) : (
        <div className="navbar-menu-container">
          <ul className="navbar-menu">
            <li className="navbar-item"><Link to="/">Home</Link></li>
            <li className="navbar-item"><Link to="/personal-area">Profilo</Link></li>
            
            {userData?.role === 'admin' && (
              <li className="navbar-item"><Link to="/admin-dashboard">Dashboard Admin</Link></li>
            )}

            {userData?.role === 'company' && userData?.status === 'approved' && (
              <>
                <li className="navbar-item"><Link to="/sell-product">Vendi</Link></li>
                <li className="navbar-item"><Link to="/received-orders">Ordini ricevuti</Link></li>
              </>
            )}

            {userData?.role === 'user' && (
              <li className="navbar-item"><Link to="/orders">Ordini</Link></li>
            )}

            {!currentUser && (
              <li className="navbar-item"><Link to="/login">Login</Link></li>
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