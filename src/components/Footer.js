import React from 'react';
import { Link } from 'react-router-dom';
import '../Footer.css'; // Importa lo stile del footer

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-column">
          <h3>Scopri e Acquista</h3>
          <ul>
            <li><Link to="/products">Prodotti</Link></li>
            <li><Link to="/companies-by-category">Categorie</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Account</h3>
          <ul>
            <li><Link to="/personal-area">Profilo</Link></li>
            <li><Link to="/login">Accedi</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Vendere su BestVoucher</h3>
          <ul>
            <li><Link to="/sell-product">Vendi un prodotto</Link></li>
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
        <p><Link to="/terms">Termini di servizio</Link> | <Link to="/privacy">Privacy</Link></p>
      </div>
    </footer>
  );
}

export default Footer;