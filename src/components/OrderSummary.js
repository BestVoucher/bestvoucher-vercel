import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode.react'; // Importa il generatore di QR code

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
    <div>
      <h1>Riepilogo dell'ordine</h1>
      <p>Numero d'ordine: {orderData.orderNumber}</p>
      <p>Prodotto: {orderData.productTitle}</p>
      <p>Prezzo: €{orderData.price}</p>
      <div>
        <h3>Codice QR:</h3>
        <QRCode id="qrcode" value={orderData.qrCode} size={256} />
        <button onClick={handleDownloadQRCode}>Scarica QR Code</button>
      </div>
      <button onClick={handleDownloadPDF}>Scarica PDF</button>
    </div>
  );
}

export default OrderSummary;