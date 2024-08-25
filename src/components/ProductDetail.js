import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Importa Firestore
import { collection, addDoc } from 'firebase/firestore'; // Importa le funzioni necessarie per Firestore
import '../ProductDetail.css';

function ProductDetail({ products }) {
  const { productId } = useParams();
  const { currentUser, userData } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState('');
  const navigate = useNavigate(); // Per reindirizzare l'utente dopo l'ordine

  // Verifica se products è definito prima di usare .find()
  if (!products) {
    return <p>Caricamento in corso...</p>; 
  }

  const product = products.find(p => p.id === productId);

  // Verifica che il prodotto esista
  if (!product) {
    return <p>Prodotto non trovato</p>;
  }

  const showPayPalButton = currentUser && (!userData?.companyName);

  // Funzione per generare un numero d'ordine unico
  const generateOrderNumber = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Genera un numero casuale a 5 cifre
    return `BV${randomNumber}`;
  };

  // Funzione per salvare l'ordine su Firestore
  const saveOrderToFirestore = async (orderData) => {
    try {
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      console.error("Errore durante la registrazione dell'ordine su Firestore:", error);
      throw new Error("Errore durante la registrazione dell'ordine.");
    }
  };

  const handleOrderCompletion = async (details) => {
    try {
      const orderNumber = generateOrderNumber();
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

      // Reindirizza l'utente alla pagina di riepilogo dell'ordine
      navigate(`/order-summary/${orderNumber}`, { state: orderData });
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
          <PayPalButtons
            style={{ layout: "vertical" }}
            fundingSource="paypal"
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
        )}
      </PayPalScriptProvider>
    </div>
  );
}

export default ProductDetail;