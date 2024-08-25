import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ServicesByCategory() {
  const { category } = useParams();  // Ottieni la categoria dai parametri dell'URL
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Richiesta per ottenere i servizi di una determinata categoria dal backend
    axios.get(`/api/services/category/${category}`)
      .then(response => {
        setServices(response.data);
      })
      .catch(error => {
        console.error('Errore nel caricamento dei servizi:', error);
      });
  }, [category]);

  return (
    <div>
      <h2>Servizi nella categoria: {category}</h2>
      <ul>
        {services.map(service => (
          <li key={service._id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p>Prezzo: €{service.price}</p>
            <p>Azienda: {service.company.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServicesByCategory;