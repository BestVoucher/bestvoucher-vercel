import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (err) {
        console.error('Errore durante il recupero dei prodotti:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="App">
      <h1>Acquista i tuoi voucher e risparmia!</h1>
      {products.length > 0 ? (
        <div className="products-list">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <Link to={`/product/${product.id}`}>
                <img src={product.imageUrl} alt={product.title} />
                <h2>{product.title}</h2>
                <p><strong>Prezzo di listino:</strong> € <s>{product.normalPrice}</s></p>
                <p><strong>Prezzo BestVoucher:</strong> € {product.price}</p>
                <p><strong>Offerto da:</strong> {product.companyName}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>Non ci sono prodotti disponibili al momento.</p>
      )}
    </div>
  );
}

export default ProductList;