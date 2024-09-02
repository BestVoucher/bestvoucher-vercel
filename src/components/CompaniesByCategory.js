import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../CompaniesByCategory.css';

function CompaniesByCategory() {
  const [companies, setCompanies] = useState({
    'Trattamenti estetici': [],
    'Capelli e barba': [],
    'Fisioterapia': [],
    'Benessere mentale': [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'company'));
        const querySnapshot = await getDocs(q);

        const categories = {
          'Trattamenti estetici': [],
          'Parruchhieri': [],
          'Fisioterapia': [],
          'Benessere mentale': [],
        };

        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (categories[data.category]) {
            categories[data.category].push({
              companyName: data.companyName,
              docName: doc.id,
            });
          }
        });

        setCompanies(categories);
      } catch (error) {
        console.error('Errore nel recupero delle aziende:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="companies-by-category">
      <h1>I nostri partner</h1>
      {Object.keys(companies).map(category => (
        <div key={category} className="category-section card">
          <h2>{category}</h2>
          <ul>
            {companies[category].length > 0 ? (
              companies[category].map(company => (
                <li key={company.docName}>
                  <Link to={`/company/${company.docName}`}>{company.companyName}</Link>
                </li>
              ))
            ) : (
              <p>Nessuna azienda disponibile in questa categoria.</p>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default CompaniesByCategory;