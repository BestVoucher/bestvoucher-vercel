import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import '../ProductDetail.css';
import { v4 as uuidv4 } from 'uuid';  // Aggiunge un generatore di ID univoco

function ProductDetail() {
  const { productId } = useParams();
  const { currentUser, userData, updateCartCount } = useAuth(); // Aggiungi userData per accedere ai dati dell'utente
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          setProduct({ id: productId, ...productDoc.data() });  // Include l'ID del prodotto
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

  const addToCart = async () => {
    if (!currentUser) {
      alert('Devi essere loggato per aggiungere prodotti al carrello');
      return;
    }

    const cartDocRef = doc(db, 'carts', currentUser.uid);
    const cartDoc = await getDoc(cartDocRef);

    const cartItemId = uuidv4(); // Genera un ID univoco per il prodotto nel carrello

    let updatedProducts = [];

    const productToAdd = { 
      id: productId, 
      ...product,
      cartItemId  // Aggiunge l'ID univoco
    };

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      updatedProducts = [...cartData.products, productToAdd];
      await updateDoc(cartDocRef, { products: updatedProducts });
    } else {
      updatedProducts = [productToAdd];
      await setDoc(cartDocRef, { products: updatedProducts });
    }

    // Aggiorna il numero dei prodotti nel contesto
    updateCartCount(updatedProducts.length);
  };

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  if (!product) {
    return <p>Prodotto non trovato</p>;
  }

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.title} className="product-detail-image" />
      <h2>{product.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
      <p><strong>Prezzo di listino:</strong> € <s>{product.normalPrice}</s></p>
      <p><strong>Prezzo BestVoucher:</strong> € {product.price}</p>
      <p><strong>Venduto da:</strong> {product.companyName}</p>

      {/* Verifica se l'utente è loggato e ha il ruolo "user" */}
      {currentUser && userData?.role === 'user' ? (
        <div data-test="mms-cta-basket-wishlist" className="div-add-to-cart">
          <button onClick={addToCart} className="add-to-cart-button">
            <div width="24" height="24" className="div-img-add-to-cart">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path fill="white" d="M20 20a2 2 0 1 1-2-2 2 2 0 0 1 2 2M8 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2M21.5 4h-1a.5.5 0 0 0-.5.5V5a2.86 2.86 0 0 1-.36 1.37l-2.36 4.13a1 1 0 0 1-.75.5H10.3a1 1 0 0 1-.86-.5L5.16 3a2 2 0 0 0-1.74-1H2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h.92l4.28 7.49a2.2 2.2 0 0 0 .27.35l-1.86 3.7a.77.77 0 0 0 0 .71l.22.38A.76.76 0 0 0 7 17h12.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H8.62l1-2.09a2.74 2.74 0 0 0 .64.09h6.23A2.94 2.94 0 0 0 19 11.49l2.35-4.13A4.76 4.76 0 0 0 22 5v-.5a.5.5 0 0 0-.5-.5M16 5.38v-.76a.5.5 0 0 0-.5-.5h-1.62V2.5a.5.5 0 0 0-.5-.5h-.76a.5.5 0 0 0-.5.5v1.62H10.5a.5.5 0 0 0-.5.5v.76a.5.5 0 0 0 .5.5h1.62V7.5a.5.5 0 0 0 .5.5h.76a.5.5 0 0 0 .5-.5V5.88h1.62a.5.5 0 0 0 .5-.5"></path>
              </svg>
            </div>
            <span class="sc-f52d4e87-0 dzLmYX">Aggiungi al carrello</span>
            <span class="sc-ad0ca069-0 ewEseA"></span>
          </button>
        </div>
      ) : (
        <p>Registrati o accedi come utente per aggiungere al carrello</p>
      )}
    </div>
  );
}

export default ProductDetail;