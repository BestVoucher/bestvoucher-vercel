import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../SellProduct.css'; // Aggiungi un file CSS separato per gli stili

function SellProduct() {
  const { currentUser, userData } = useAuth();
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
  });
  const [message, setMessage] = useState(null);

  const { title, description, price, image } = productData;

  const onChange = e => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const onFileChange = e => {
    setProductData({
      ...productData,
      image: e.target.files[0],
    });
  };

  const resetForm = () => {
    setProductData({
      title: '',
      description: '',
      price: '',
      image: null,
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'products'), {
        title,
        description,
        price,
        imageUrl,
        companyName: userData.companyName,
        userId: currentUser.uid,
      });

      setMessage('Prodotto aggiunto con successo!');
      resetForm();
    } catch (err) {
      console.error("Errore durante l'aggiunta del prodotto:", err.message);
    }
  };

  return (
    <div className="sell-product-container">
      <h2 className="sell-product-title">Aggiungi un nuovo prodotto</h2>
      <form onSubmit={onSubmit} className="sell-product-form">
        <div className="form-group">
          <label htmlFor="title">Titolo del prodotto</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Titolo del prodotto"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrizione del prodotto</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Descrizione del prodotto"
            required
            className="form-textarea"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Prezzo</label>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={onChange}
            placeholder="Prezzo"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Immagine del prodotto</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={onFileChange}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Aggiungi Prodotto</button>

        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
}

export default SellProduct;