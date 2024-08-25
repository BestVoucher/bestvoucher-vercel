import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';

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

  return (
    <div>
      <h1>Riepilogo dell'ordine</h1>
      <p>Numero d'ordine: {orderData.orderNumber}</p>
      <p>Prodotto: {orderData.productTitle}</p>
      <p>Prezzo: €{orderData.price}</p>
      <button onClick={handleDownloadPDF}>Scarica PDF</button>
    </div>
  );
}

export default OrderSummary;