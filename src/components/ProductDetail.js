import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Importa Firestore
import { collection, addDoc } from 'firebase/firestore'; // Importa le funzioni necessarie per Firestore
import QRCode from 'qrcode.react'; // Per generare il QR code
import '../ProductDetail.css';

function ProductDetail({ products }) {
  const { productId } = useParams();
  const { currentUser, userData } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState('');
  const navigate = useNavigate(); // Per reindirizzare l'utente dopo l'ordine

  if (!products) {
    return <p>Caricamento in corso...</p>;
  }

  const product = products.find(p => p.id === productId);

  if (!product) {
    return <p>Prodotto non trovato</p>;
  }

  const showPayPalButton = currentUser && (!userData?.companyName);

  // Funzione per generare un codice alfanumerico casuale
  const generateRandomCode = (length = 15) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateOrderNumber = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Genera un numero casuale a 5 cifre
    return `BV${randomNumber}`;
  };

  const saveOrderToFirestore = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      console.error("Errore durante la registrazione dell'ordine su Firestore:", error);
      throw new Error("Errore durante la registrazione dell'ordine.");
    }
  };

  const saveQRCodeToFirestore = async (qrCodeData) => {
    try {
      await addDoc(collection(db, 'newqrcodes'), qrCodeData);
    } catch (error) {
      console.error("Errore durante la registrazione del codice QR su Firestore:", error);
      throw new Error("Errore durante la registrazione del codice QR.");
    }
  };

  const handleOrderCompletion = async (details) => {
    try {
      const orderNumber = generateOrderNumber();
      const randomCode = generateRandomCode(); // Genera il codice casuale
      const orderData = {
        orderNumber,
        email: currentUser.email,
        productTitle: product.title,
        price: product.price,
        userId: currentUser.uid, // ID dell'utente che ha effettuato l'acquisto
        companyId: product.userId, // ID dell'azienda venditrice
        createdAt: new Date().toISOString(),
      };

      // Salva l'ordine su Firestore
      await saveOrderToFirestore(orderData);

      // Salva il codice QR su Firestore, includendo il nome del documento del prodotto
      const qrCodeData = {
        code: randomCode,
        userId: currentUser.uid,
        companyId: product.userId,
        productDocName: product.id, // Nome del documento corrispondente al prodotto
        createdAt: new Date().toISOString(),
      };
      await saveQRCodeToFirestore(qrCodeData);

      // Reindirizza l'utente alla pagina di riepilogo dell'ordine, includendo il codice QR
      navigate(`/order-summary/${orderNumber}`, { state: { ...orderData, qrCode: randomCode } });
    } catch (error) {
      setErrorMessage("Si è verificato un errore durante la registrazione dell'ordine.");
    }
  };

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.title} className="product-detail-image" />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Prezzo: €{product.price}</p>
      <p>Venduto da: {product.companyName}</p>

      {!showPayPalButton && (
        <p className="error-message">
          Accedi o registrati come utente per effettuare un acquisto.
        </p>
      )}

<PayPalScriptProvider options={{ "client-id": "Af7Y9iWFFwOV3tHl8xMQz1_FG6927jMUWk92Ol1cSowunUntDpNgeYgacRSa4OG-jozaNeWDBOL8igGk", currency: "EUR" }}>
  {showPayPalButton && (
    <>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: product.price.toString(),
                currency_code: "EUR"
              }
            }]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await handleOrderCompletion(details); // Gestione dell'ordine completato
          } catch (err) {
            console.error('Errore durante il pagamento:', err);
            setErrorMessage('Si è verificato un errore durante il pagamento.');
          }
        }}
        onError={(err) => {
          console.error('Errore durante il pagamento:', err);
          setErrorMessage('Si è verificato un errore durante il pagamento.');
        }}
      />

      {/* Pulsante per le carte di credito/debito */}
      <PayPalButtons
        fundingSource={window.paypal.FUNDING.CARD} // Abilita le carte di credito
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: product.price.toString(),
                currency_code: "EUR"
              }
            }]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            await handleOrderCompletion(details); // Gestione dell'ordine completato
          } catch (err) {
            console.error('Errore durante il pagamento con carta:', err);
            setErrorMessage('Si è verificato un errore durante il pagamento con carta.');
          }
        }}
        onError={(err) => {
          console.error('Errore durante il pagamento con carta:', err);
          setErrorMessage('Si è verificato un errore durante il pagamento con carta.');
        }}
      />
    </>
  )}
</PayPalScriptProvider>
    </div>
  );
}

export default ProductDetail;