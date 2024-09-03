import React from 'react';
import { Link } from 'react-router-dom';
import '../Footer.css'; // Importa lo stile del footer

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-column">
          <h3>Scopri e acquista</h3>
          <ul>
            <li><Link to="/">Prodotti</Link></li>
            <li><Link to="/companies-by-category">Categorie</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Account</h3>
          <ul>
            <li><Link to="/personal-area">Profilo</Link></li>
            <li><Link to="/orders">Ordini effettuati</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Per i partner</h3>
          <ul>
            <li><Link to="/sell-product">Vendi</Link></li>
            <li><Link to="/received-orders">Ordini ricevuti</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Supporto</h3>
          <ul>
            <li><Link to="/terms">Termini di servizio</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 BestVoucher. Tutti i diritti riservati.</p>
        <p><Link to="/terms">Termini di servizio</Link> | <Link to="/privacy-policy">Privacy</Link></p>
      </div>
    </footer>
  );
}

export default Footer;