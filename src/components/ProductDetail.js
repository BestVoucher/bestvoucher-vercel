import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import '../ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams();
  const { currentUser, userData } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Scrolla la pagina verso l'alto quando il componente si monta
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          setProduct(productDoc.data());
        } else {
          console.error('Prodotto non trovato');
        }
      } catch (err) {
        console.error('Errore durante il recupero del prodotto:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  if (!product) {
    return <p>Prodotto non trovato</p>;
  }

  const showPayPalButton = currentUser && (!userData?.companyName);

  const generateRandomCode = (length = 15) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateOrderNumber = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
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
      const randomCode = generateRandomCode();
      const orderData = {
        orderNumber,
        email: currentUser.email,
        productTitle: product.title,
        price: product.price,
        userId: currentUser.uid,
        companyId: product.userId,
        createdAt: new Date().toISOString(),
      };

      await saveOrderToFirestore(orderData);

      const qrCodeData = {
        code: randomCode,
        userId: currentUser.uid,
        companyId: product.userId,
        productDocName: productId,
        createdAt: new Date().toISOString(),
      };
      await saveQRCodeToFirestore(qrCodeData);

      navigate(`/order-summary/${orderNumber}`, { state: { ...orderData, qrCode: randomCode } });
    } catch (error) {
      setErrorMessage("Si è verificato un errore durante la registrazione dell'ordine.");
    }
  };

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.title} className="product-detail-image" />
      <h2>{product.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
      <p><strong>Prezzo di listino:</strong> € <s>{product.normalPrice}</s></p>
      <p><strong>Prezzo BestVoucher:</strong> € {product.price}</p>
      <p><strong>Venduto da:</strong> {product.companyName}</p>

      {!showPayPalButton && (
        <p className="error-message">
          Accedi o registrati come utente per effettuare un acquisto.
        </p>
      )}

      <PayPalScriptProvider options={{ "client-id": "Af7Y9iWFFwOV3tHl8xMQz1_FG6927jMUWk92Ol1cSowunUntDpNgeYgacRSa4OG-jozaNeWDBOL8igGk", currency: "EUR" }}>
        {showPayPalButton && (
          <>
            <PayPalButtons
              fundingSource={FUNDING.PAYPAL}
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
                  await handleOrderCompletion(details);
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

            <PayPalButtons
              fundingSource={FUNDING.CARD}
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
                  await handleOrderCompletion(details);
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