import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, runTransaction } from '../firebase';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/logo.png'; // Percorso del logo nel progetto
import '../OrderSummary.css';

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [multipleOrdersState, setMultipleOrdersState] = useState([]);

  const { orderNumber, giftCardCode, productTitle, price, userId, multipleOrders } = location.state || {};

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.log('Utente non trovato!');
      }
    } catch (error) {
      console.error('Errore durante il recupero dei dati utente:', error);
    }
  };

  const generateInvoiceNumber = async (transaction) => {
    try {
      const counterRef = doc(db, 'invoiceCounter', 'counter');
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw new Error('Contatore non trovato!');
      }

      const currentInvoiceNumber = counterDoc.data().currentInvoiceNumber;
      const nextInvoiceNumber = (parseInt(currentInvoiceNumber, 10) + 1).toString().padStart(3, '0');
      transaction.update(counterRef, { currentInvoiceNumber: nextInvoiceNumber });

      return nextInvoiceNumber;
    } catch (error) {
      console.error('Errore durante la generazione del numero della fattura:', error);
      throw error;
    }
  };

  const createInvoice = async () => {
    try {
      const invoiceRef = doc(db, 'invoices', orderNumber);

      await runTransaction(db, async (transaction) => {
        const existingInvoice = await transaction.get(invoiceRef);

        if (existingInvoice.exists()) {
          console.log('Fattura già esistente per questo ordine.');
          setInvoiceNumber(existingInvoice.data().invoiceNumber);
          return;
        }

        const newInvoiceNumber = await generateInvoiceNumber(transaction);

        transaction.set(invoiceRef, {
          invoiceNumber: newInvoiceNumber,
          orderId: orderNumber,
          userId: userId,
        });

        setInvoiceNumber(newInvoiceNumber);
      });
    } catch (error) {
      console.error('Errore durante la creazione della fattura:', error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Calcolo di totalPrice sommando i prezzi dei prodotti in multipleOrdersState
    const totalPrice = multipleOrdersState.reduce((total, order) => {
      return total + parseFloat(order.price) * (order.qrCodes ? order.qrCodes.length : 1);
    }, 0);

    // Aggiunta del logo caricato dal file
    doc.addImage(logo, 'PNG', 10, 10, 20, 20); // Posizione e dimensioni del logo

    // Intestazione della fattura
    doc.setFontSize(18);
    doc.text('Fattura', 105, 40, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Numero Fattura: ${invoiceNumber}`, 10, 50);
    doc.text(`Nome: ${userData?.firstName || ''} ${userData?.lastName || ''}`, 10, 60);
    doc.text(`Email: ${userData?.email || ''}`, 10, 70);
    doc.text(`Numero d'ordine: ${orderNumber}`, 10, 80);

    // Tabella degli ordini
    const ordersData = multipleOrdersState.length > 0
      ? multipleOrdersState.map((order) => [order.productTitle, `€${order.price}`, order.qrCodes.length])
      : [[productTitle || 'Gift Card', `€${price}`, 1]];

    doc.autoTable({
      head: [['Prodotto', 'Prezzo', 'Quantità']],
      body: ordersData,
      startY: 90,
    });

    // Totale
    doc.setFontSize(12);
    doc.text(`Totale: €${totalPrice.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);

    doc.save(`fattura-${invoiceNumber}.pdf`);
  };

  useEffect(() => {
    const initializeOrderSummary = async () => {
      if (!orderNumber || !userId) {
        navigate('/');
        return;
      }

      await fetchUserData(userId);
      await createInvoice();

      if (multipleOrders) {
        setMultipleOrdersState(multipleOrders);
      }

      setLoading(false);
    };

    initializeOrderSummary();
  }, [orderNumber, userId, navigate, multipleOrders]);

  return (
    <div className="order-summary-page">
      <h1>Riepilogo dell'ordine</h1>
      {loading ? (
        <p>Caricamento in corso...</p>
      ) : (
        <div className="order-summary-box">
          <p><strong>Numero d'ordine:</strong> {orderNumber}</p>
          {multipleOrdersState.length > 0 ? (
            multipleOrdersState.map((order, index) => (
              <div key={index} className="qrcode-section">
                <p><strong>Prodotto: </strong>{order.productTitle}</p>
                <p><strong>Prezzo: </strong>€{order.price}</p>

                {order.qrCodes && order.qrCodes.map((qrCode, qrIndex) => (
                  <div key={qrIndex}>
                    <QRCode value={qrCode} size={128} />
                    <p>QR Code del prodotto</p>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <>
              <p><strong>Prodotto: </strong>{productTitle || 'Gift Card'}</p>
              <p><strong>Prezzo: </strong>€{price}</p>
              {giftCardCode && <p><strong>Codice Gift Card: </strong>{giftCardCode}</p>}
            </>
          )}
        </div>
      )}
      <button onClick={handleDownloadPDF} disabled={loading}>
        Scarica Fattura
      </button>
    </div>
  );
}

export default OrderSummary;