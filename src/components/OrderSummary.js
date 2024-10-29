import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, runTransaction, addDoc, collection } from '../firebase';
import QRCode from 'qrcode.react'; // Importazione per generare QR code
import { jsPDF } from 'jspdf';
import '../OrderSummary.css';

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // Dati utente
  const [multipleOrdersState, setMultipleOrdersState] = useState([]); // Stato per multipleOrders

  // Dati passati da Cart.js o GiftCard.js
  const { orderNumber, giftCardCode, productTitle, price, userId, multipleOrders } = location.state || {};

  // Funzione per recuperare i dati utente da Firestore
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

  // Funzione per recuperare il companyId (userId del venditore) dalla collezione products
  const fetchCompanyId = async (productDocName) => {
    try {
      const productDocRef = doc(db, 'products', productDocName);
      const productDoc = await getDoc(productDocRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();
        return productData.userId; // userId rappresenta l'azienda che ha messo in vendita il prodotto
      } else {
        throw new Error('Prodotto non trovato!');
      }
    } catch (error) {
      console.error('Errore durante il recupero del companyId:', error);
      throw error;
    }
  };

  // Funzione per generare il numero progressivo della fattura
  const generateInvoiceNumber = async (transaction) => {
    try {
      const counterRef = doc(db, 'invoiceCounter', 'counter');
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw new Error('Contatore non trovato!');
      }

      const currentInvoiceNumber = counterDoc.data().currentInvoiceNumber;
      const nextInvoiceNumber = (parseInt(currentInvoiceNumber, 10) + 1).toString().padStart(3, '0');

      // Aggiorna il contatore solo se la transazione va a buon fine
      transaction.update(counterRef, { currentInvoiceNumber: nextInvoiceNumber });

      return nextInvoiceNumber;
    } catch (error) {
      console.error('Errore durante la generazione del numero della fattura:', error);
      throw error;
    }
  };

  // Funzione per creare la fattura utilizzando `orderNumber` come ID univoco
  const createInvoice = async () => {
    try {
      const invoiceRef = doc(db, 'invoices', orderNumber);  // Usiamo `orderNumber` come ID del documento

      // Utilizziamo una transazione per controllare ed eventualmente creare la fattura
      await runTransaction(db, async (transaction) => {
        const existingInvoice = await transaction.get(invoiceRef);

        if (existingInvoice.exists()) {
          console.log('Fattura già esistente per questo ordine.');
          setInvoiceNumber(existingInvoice.data().invoiceNumber);
          return;
        }

        // Genera il nuovo numero di fattura solo se la fattura non esiste già
        const newInvoiceNumber = await generateInvoiceNumber(transaction);

        // Crea la nuova fattura su Firestore con `orderNumber` come ID
        transaction.set(invoiceRef, {
          invoiceNumber: newInvoiceNumber,
          orderId: orderNumber,
          userId: userId,
        });

        setInvoiceNumber(newInvoiceNumber);  // Imposta il numero della fattura nel componente
      });
    } catch (error) {
      console.error('Errore durante la creazione della fattura:', error);
    }
  };

  // Funzione per creare e salvare un QR code su Firestore con companyId
  const createAndSaveQRCode = async (product) => {
    try {
      // Recupera il companyId dalla collezione products
      const companyId = await fetchCompanyId(product.productDocName);

      const qrCode = `QR_${Math.random().toString(36).substr(2, 9)}`; // Genera un QR code univoco
      const qrData = {
        code: qrCode,
        productDocName: product.productDocName,  // ID del documento del prodotto
        userId: userId,  // ID dell'utente
        companyId: companyId,  // ID dell'azienda che ha messo in vendita il prodotto
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'newqrcodes'), qrData); // Salva su Firestore

      return qrCode; // Restituisci il codice per visualizzarlo
    } catch (error) {
      console.error('Errore durante il salvataggio del QR code:', error);
      throw error;
    }
  };

  // Funzione per scaricare la fattura in PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
  
    // Verifica se `userData` contiene i campi firstName e lastName
    const userName = `${userData?.firstName || ''} ${userData?.lastName || ''}`;
    const userEmail = userData?.email || '';
  
    // Imposta una variabile per la posizione verticale del testo
    let yPosition = 20; // Punto iniziale dove il testo inizia
  
    doc.text('Fattura', 105, 10, { align: 'center' });
    doc.text(`Numero Fattura: ${invoiceNumber}`, 10, yPosition);
    yPosition += 10; // Aggiunge spazio dopo la riga
    doc.text(`Nome: ${userName}`, 10, yPosition);
    yPosition += 10; // Aggiunge spazio dopo la riga
    doc.text(`Email: ${userEmail}`, 10, yPosition);
    yPosition += 10; // Aggiunge spazio dopo la riga
    doc.text(`Numero d'ordine: ${orderNumber}`, 10, yPosition);
    yPosition += 10; // Aggiunge spazio dopo la riga
  
    // Itera su multipleOrders e aggiungi ogni prodotto
    if (multipleOrdersState.length > 0) {
      multipleOrdersState.forEach((order, index) => {
        doc.text(`Prodotto: ${order.productTitle}`, 10, yPosition);
        yPosition += 10; // Sposta la posizione verso il basso
        doc.text(`Prezzo: €${order.price}`, 10, yPosition);
        yPosition += 10; // Sposta la posizione verso il basso per il prossimo prodotto
      });
    } else if (productTitle) {
      doc.text(`Prodotto: ${productTitle}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Prezzo: €${price}`, 10, yPosition);
    }
  
    // Salva il PDF con un nome basato sul numero della fattura
    doc.save(`fattura-${invoiceNumber}.pdf`);
  };

  useEffect(() => {
    const initializeOrderSummary = async () => {
      if (!orderNumber || !userId) {
        navigate('/');
        return;
      }

      // Recupero dati utente
      await fetchUserData(userId);

      // Creazione fattura se non esiste già
      await createInvoice();

      // Se ci sono ordini multipli (non gift card), creiamo e mostriamo i QR code
      if (multipleOrders) {
        const ordersWithQRCode = await Promise.all(multipleOrders.map(async (order) => {
          const qrCode = await createAndSaveQRCode(order); // Genera e salva il QR code con companyId
          return { ...order, qrCode }; // Aggiungi il codice QR al prodotto
        }));
        setMultipleOrdersState(ordersWithQRCode); // Aggiorna lo stato con i QR code
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

                {/* Aggiunta del QR code per ogni prodotto */}
                {order.qrCode && (
                  <>
                    <QRCode value={order.qrCode} size={128} />
                    <p>QR Code del prodotto</p>
                  </>
                )}
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