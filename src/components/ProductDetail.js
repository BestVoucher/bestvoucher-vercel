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
        <button onClick={addToCart} className="add-to-cart-button">
          Aggiungi al carrello
        </button>
      ) : (
        <p>Registrati o accedi come utente per aggiungere al carrello</p>
      )}
    </div>
  );
}

export default ProductDetail;