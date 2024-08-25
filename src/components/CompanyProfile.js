import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function CompanyProfile() {
  const { id } = useParams();  // Ottieni l'ID dell'azienda dai parametri dell'URL
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Richiesta per ottenere i dettagli dell'azienda dal backend
    axios.get(`/api/companies/${id}`)
      .then(response => {
        setCompany(response.data);
      })
      .catch(error => {
        console.error('Errore nel caricamento dei dati dell\'azienda:', error);
      });
  }, [id]);

  if (!company) {
    return <p>Caricamento...</p>;  // Mostra un messaggio di caricamento finché i dati non sono pronti
  }

  return (
    <div>
      <h1>{company.name}</h1>
      <h2>Servizi offerti</h2>
      <ul>
        {company.services.map(service => (
          <li key={service._id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p>Prezzo: €{service.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CompanyProfile;