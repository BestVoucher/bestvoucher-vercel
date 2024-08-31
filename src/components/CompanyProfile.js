import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../CompanyProfile.css';

function CompanyProfile() {
  const { companydocname } = useParams();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetailsAndProducts = async () => {
      try {
        // Recupera i dettagli dell'azienda
        const companyDocRef = doc(db, 'users', companydocname);
        const companyDocSnap = await getDoc(companyDocRef);

        if (companyDocSnap.exists()) {
          setCompanyDetails(companyDocSnap.data());
        } else {
          console.error("Documento aziendale non trovato!");
        }

        // Recupera i prodotti dell'azienda
        const productsQuery = query(collection(db, 'products'), where('userId', '==', companydocname));
        const productsQuerySnapshot = await getDocs(productsQuery);
        const productsList = productsQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsList);
      } catch (err) {
        console.error('Errore durante il recupero dei dati:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetailsAndProducts();
  }, [companydocname]);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <>
      {companyDetails && (
        <div className="company-details-container">
          <div className="company-details">
            {companyDetails.logoUrl && (
              <img src={companyDetails.logoUrl} alt="Logo Azienda" className="company-logo-small" />
            )}
            <h2>{companyDetails.companyName}</h2>
            <p><strong>Indirizzo:</strong> {companyDetails.address}, {companyDetails.city} {companyDetails.postalCode}</p>
            <p>{companyDetails.description}</p>
          </div>
        </div>
      )}

      <div className="company-products">
        <h3>Prodotti in vendita</h3>
        {products.length > 0 ? (
          <div className="products-list2">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="product-link">
                <div className="product-card2">
                  <img src={product.imageUrl} alt={product.title} />
                  <h2>{product.title}</h2>
                  <p><strong>Prezzo di listino:</strong> € <s>{product.normalPrice}</s></p>
                  <p><strong>Prezzo BestVoucher:</strong> € {product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>Non ci sono prodotti disponibili al momento.</p>
        )}
      </div>
    </>
  );
}

export default CompanyProfile;