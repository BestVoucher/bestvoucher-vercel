import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode.react';
import '../OrderSummary.css'; // File CSS per lo styling

function OrderSummary() {
  const location = useLocation();
  const orderData = location.state;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Riepilogo dell'ordine`, 10, 10);
    doc.text(`Numero d'ordine: ${orderData.orderNumber}`, 10, 20);
    doc.text(`Prodotto: ${orderData.productTitle}`, 10, 30);
    doc.text(`Prezzo: €${orderData.price}`, 10, 40);
    doc.save(`riepilogo-ordine-${orderData.orderNumber}.pdf`);
  };

  const handleDownloadQRCode = () => {
    const canvas = document.getElementById('qrcode');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${orderData.qrCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="order-summary-page">
      <h1>Riepilogo dell'ordine</h1>
      <div className="order-summary-box">
        <p><strong>Numero d'ordine:</strong> {orderData.orderNumber}</p>
        <p><strong>Prodotto:</strong> {orderData.productTitle}</p>
        <p><strong>Prezzo:</strong> €{orderData.price}</p>
        <div className="qrcode-section">
          <h3>Codice QR:</h3>
          <QRCode id="qrcode" value={orderData.qrCode} size={256} />
        </div>
      </div>
      <div className="order-summary-actions">
        <button onClick={handleDownloadQRCode}>Scarica QR Code</button>
        <button onClick={handleDownloadPDF}>Scarica PDF</button>
      </div>
    </div>
  );
}

export default OrderSummary;