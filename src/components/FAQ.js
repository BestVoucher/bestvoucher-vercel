import React, { useState } from 'react';
import '../FAQ.css'; // Assicurati di creare e collegare un file CSS per gli stili

function FAQ() {
  const categories = [
    {
      title: "Acquisti, rimborsi e scadenze",
      questions: [
        { question: "Come posso acquistare un voucher?", answer: "Per acquistare un voucher, basta selezionare il prodotto desiderato, scegliere il metodo di pagamento e procedere al pagamento. Verrai automaticamente reindirizzato al riepilogo ordine col QR Code del voucher acquistato." },
        { question: "Quali metodi di pagamento sono accettati?", answer: "Accettiamo pagamenti tramite carta di credito e PayPal." },
        { question: "Posso richiedere un rimborso?", answer: "I rimborsi sono disponibili entro 14 giorni dall'acquisto, a condizione che il voucher non sia stato utilizzato." },
        { question: "Quanto tempo ho per utilizzare il voucher?", answer: "Ogni voucher ha una scadenza specificata. Assicurati di utilizzarlo prima della data di scadenza." },
        { question: "Cosa succede se il voucher scade?", answer: "I voucher scaduti non possono essere utilizzati o rimborsati. Ti consigliamo di utilizzarli prima della scadenza." }
      ]
    },
    {
      title: "Vendita e fatturazione",
      questions: [
        { question: "Come posso iniziare a vendere su BestVoucher?", answer: "Registrati come azienda, aspetta che il tuo account venga approvato e aggiungi i servizi che desideri vendere." },
        { question: "Quali sono le commissioni per la vendita?", answer: "BestVoucher applica una commissione del 30% su ogni vendita effettuata tramite la piattaforma." },
        { question: "Posso modificare i miei prodotti dopo averli pubblicati?", answer: "Sì, puoi modificare i dettagli dei tuoi prodotti in qualsiasi momento tramite il tuo account aziendale." },
        { question: "Come ricevo i pagamenti per le vendite?", answer: "I pagamenti vengono elaborati ogni 14 giorni (tempo necessario per un eventuale rimborso) e accreditati sul conto paypal fornito durante la registrazione." },
        { question: "Cosa succede se un cliente richiede un rimborso?", answer: "Se un cliente richiede un rimborso, la richiesta sarà valutata in base alla nostra politica di rimborso e, se approvata, l'importo sarà detratto dai futuri pagamenti all'azienda." }
      ]
    },
    {
      title: "Gestione account e dati",
      questions: [
        { question: "Come posso aggiornare le mie informazioni personali?", answer: "Puoi aggiornare le tue informazioni personali accedendo al tuo account e modificando i campi necessari nella sezione profilo." },
        { question: "Come posso reimpostare la mia password?", answer: "Clicca su 'Password dimenticata?' nella pagina di login e segui le istruzioni per reimpostare la tua password." },
        { question: "Come posso cancellare il mio account?", answer: "Se desideri cancellare il tuo account, contatta il nostro supporto clienti e gestiremo la tua richiesta." },
        { question: "I miei dati sono al sicuro?", answer: "BestVoucher utilizza protocolli di sicurezza avanzati per proteggere i tuoi dati. Non condividiamo le tue informazioni personali senza il tuo consenso." },
        { question: "Posso avere più di un account?", answer: "No, ogni utente è autorizzato ad avere un solo account personale. La creazione di account multipli può portare alla sospensione." }
      ]
    },
    {
      title: "Utilizzo del voucher",
      questions: [
        { question: "Come posso utilizzare un voucher acquistato?", answer: "Basta presentare il voucher al venditore al momento del pagamento o inserire il codice online durante l'acquisto." },
        { question: "Posso utilizzare più voucher per un solo acquisto?", answer: "Dipende dalle politiche del venditore. Alcuni accettano più voucher, altri no." },
        { question: "Cosa devo fare se il mio voucher non funziona?", answer: "Se riscontri problemi con un voucher, contatta il nostro supporto clienti fornendo tutti i dettagli del problema." },
        { question: "Posso regalare un voucher a qualcun altro?", answer: "Sì, i nostri voucher sono trasferibili e possono essere regalati a terzi." },
        { question: "Cosa succede se perdo il mio voucher?", answer: "I voucher persi non possono essere recuperati. Assicurati di conservare una copia digitale o stampata del tuo voucher." }
      ]
    },
    {
      title: "Regali BestVoucher",
      questions: [
        { question: "Come posso acquistare un voucher regalo?", answer: "Scegli il voucher che desideri regalare e seleziona l'opzione 'Regalo' durante il checkout. Potrai personalizzare un messaggio per il destinatario." },
        { question: "Posso programmare l'invio di un voucher regalo?", answer: "Sì, puoi scegliere una data futura per l'invio del voucher regalo al destinatario." },
        { question: "Cosa succede se il destinatario non riceve il voucher?", answer: "Se il destinatario non riceve il voucher, verifica l'indirizzo email fornito e contatta il nostro supporto clienti per assistenza." },
        { question: "Posso richiedere un rimborso per un voucher regalo?", answer: "I voucher regalo non sono rimborsabili una volta inviati. Assicurati di controllare tutti i dettagli prima di completare l'acquisto." },
        { question: "Il voucher regalo ha una data di scadenza?", answer: "Sì, come tutti i nostri voucher, anche i voucher regalo hanno una data di scadenza che sarà specificata al momento dell'acquisto." }
      ]
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (categoryIndex, questionIndex) => {
    if (openIndex && openIndex.categoryIndex === categoryIndex && openIndex.questionIndex === questionIndex) {
      setOpenIndex(null); // Chiude la domanda se è già aperta
    } else {
      setOpenIndex({ categoryIndex, questionIndex }); // Apre la domanda
    }
  };

  return (
    <div className="faq-container">
      <h1>FAQ - Domande Frequenti</h1>
      {categories.map((category, categoryIndex) => (
        <div key={category.title} className="faq-category">
          <h2>{category.title}</h2>
          {category.questions.map((q, questionIndex) => (
            <div key={q.question} className="faq-item">
              <button onClick={() => toggleAnswer(categoryIndex, questionIndex)} className="faq-question">
                {q.question}
              </button>
              {openIndex && openIndex.categoryIndex === categoryIndex && openIndex.questionIndex === questionIndex && (
                <div className="faq-answer">
                  {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default FAQ;