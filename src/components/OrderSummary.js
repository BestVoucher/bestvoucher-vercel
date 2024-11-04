import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../firebase';
import QRCode from 'qrcode.react';
import '../OrderSummary.css';

function OrderSummary() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [multipleOrdersState, setMultipleOrdersState] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(location.state?.pdfUrl || null);

  const fetchOrderData = async () => {
    try {
      const invoiceRef = doc(db, 'invoices', orderNumber);
      const invoiceSnap = await getDoc(invoiceRef);

      if (invoiceSnap.exists()) {
        const invoiceData = invoiceSnap.data();
        setInvoiceNumber(invoiceData.invoiceNumber);
      } else {
        console.error("Dati della fattura non trovati.");
      }

      if (location.state?.multipleOrders && Array.isArray(location.state.multipleOrders)) {
        setMultipleOrdersState(location.state.multipleOrders);
      } else {
        console.error("Dati dei prodotti multipli non trovati.");
      }

      setUserData({ email: location.state?.email || "Email non disponibile" });
      setLoading(false);
    } catch (error) {
      console.error("Errore durante il recupero dei dati dell'ordine:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderNumber]);

  return (
    <div className="order-summary-page">
      <h1>Riepilogo dell'ordine</h1>
      {loading ? (
        <p>Caricamento in corso...</p>
      ) : (
        <div className="order-summary-box">
          <div className="order-header">
            <p><strong>Numero d'ordine:</strong> {orderNumber}</p>
            {invoiceNumber && (
              <p><strong>Numero fattura:</strong> {invoiceNumber}</p>
            )}
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-invoice-button">
                Scarica Fattura
              </a>
            )}
          </div>
          {multipleOrdersState.length > 0 ? (
            multipleOrdersState.map((order, index) => (
              <div key={index} className="order-item">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ marginRight: '20px' }}>
                    <p><strong>Prodotto:</strong> {order.productTitle}</p>
                    <p><strong>Prezzo:</strong> €{order.price}</p>
                    <p><strong>Quantità:</strong> {order.quantity}</p>
                  </div>
                  <QRSlideshow qrCodes={order.qrCodes} />
                </div>
              </div>
            ))
          ) : (
            <p>Nessun prodotto trovato nel riepilogo dell'ordine.</p>
          )}
        </div>
      )}
    </div>
  );
}

function QRSlideshow({ qrCodes }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (qrCodes.length <= 1) {
    // Se c'è solo un QR code, non mostriamo lo slideshow
    return <QRCode value={qrCodes[0]} size={100} fgColor="#FF8C00" />;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % qrCodes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + qrCodes.length) % qrCodes.length);
  };

  return (
    <div className="qr-slideshow">
      <QRCode value={qrCodes[currentIndex]} size={100} fgColor="#FF8C00" />
      <div className="qr-slideshow-controls" style={{ marginTop: '10px' }}>
        <button onClick={prevSlide} style={{ marginRight: '10px' }}>Indietro</button>
        <button onClick={nextSlide}>Avanti</button>
      </div>
      <p>{currentIndex + 1} di {qrCodes.length}</p>
    </div>
  );
}

export default OrderSummary;