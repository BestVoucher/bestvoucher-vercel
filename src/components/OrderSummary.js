import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode.react';
import '../OrderSummary.css';

function OrderSummary() {
  const location = useLocation();
  const orderData = location.state;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Riepilogo dell'ordine`, 10, 10);
    doc.text(`Numero d'ordine: ${orderData.orderNumber}`, 10, 20);
    orderData.multipleOrders.forEach((order, index) => {
      doc.text(`Prodotto: ${order.productTitle}`, 10, 30 + (index * 10));
      doc.text(`Prezzo: €${order.price}`, 10, 40 + (index * 10));
    });
    doc.save(`riepilogo-ordine-${orderData.orderNumber}.pdf`);
  };

  const handleDownloadQRCode = (qrCode) => {
    const canvas = document.getElementById(qrCode);
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${qrCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="order-summary-page">
      <h1>Riepilogo dell'ordine</h1>
      <div className="order-summary-box">
        <p><strong>Numero d'ordine:</strong> {orderData.orderNumber}</p>
        {orderData.multipleOrders.map((order) => (
          <div key={order.qrCode} className="qrcode-section">
            <h3>Prodotto: {order.productTitle}</h3>
            <p>Prezzo: €{order.price}</p>
            <QRCode id={order.qrCode} value={order.qrCode} size={256} />
            <button onClick={() => handleDownloadQRCode(order.qrCode)}>Scarica QR Code</button>
          </div>
        ))}
      </div>
      <div className="order-summary-actions">
        <button onClick={handleDownloadPDF}>Scarica PDF</button>
      </div>
    </div>
  );
}

export default OrderSummary;