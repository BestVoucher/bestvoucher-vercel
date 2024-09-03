import React, { useEffect } from 'react';
import '../PrivacyPolicy.css'; // Assicurati di creare e collegare un file CSS per gli stili

function PrivacyPolicy() {
  useEffect(() => {
    // Scrolla la pagina verso l'alto quando il componente si monta
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-container">
      <h1 className="privacy-title">Politica di Privacy</h1>

      <section>
        <h2>1. Introduzione</h2>
        <p>
          Benvenuti su BestVoucher! La tua privacy è importante per noi. Questa politica di privacy spiega come raccogliamo, utilizziamo, condividiamo e proteggiamo le tue informazioni personali quando utilizzi il nostro sito web.
        </p>
      </section>

      <section>
        <h2>2. Informazioni che Raccogliamo</h2>
        <p>
          Raccogliamo vari tipi di informazioni personali quando utilizzi il nostro sito, tra cui:
        </p>
        <ul>
          <li>Informazioni di contatto: nome, indirizzo email, numero di telefono.</li>
          <li>Informazioni di pagamento: dati della carta di credito, indirizzo di fatturazione.</li>
          <li>Informazioni sull'account: username, password, preferenze dell'account.</li>
          <li>Informazioni tecniche: indirizzo IP, tipo di browser, pagine visitate.</li>
        </ul>
      </section>

      <section>
        <h2>3. Come Utilizziamo le Tue Informazioni</h2>
        <p>
          Utilizziamo le informazioni raccolte per vari scopi, tra cui:
        </p>
        <ul>
          <li>Fornire e gestire i servizi offerti dal sito.</li>
          <li>Elaborare i pagamenti e completare le transazioni.</li>
          <li>Migliorare il sito e personalizzare l'esperienza utente.</li>
          <li>Comunicare con te riguardo a servizi, offerte e aggiornamenti.</li>
        </ul>
      </section>

      <section>
        <h2>4. Condivisione delle Informazioni</h2>
        <p>
          Non vendiamo le tue informazioni personali a terzi. Tuttavia, potremmo condividere le tue informazioni con fornitori di servizi di terze parti che ci aiutano a gestire il nostro sito e a fornirti i nostri servizi. Questi fornitori sono vincolati da obblighi di riservatezza e utilizzano le tue informazioni solo per fornire i servizi richiesti.
        </p>
      </section>

      <section>
        <h2>5. Sicurezza delle Informazioni</h2>
        <p>
          Implementiamo misure di sicurezza adeguate per proteggere le tue informazioni personali da accessi non autorizzati, perdita, abuso o alterazione. Tuttavia, nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%, quindi non possiamo garantire la sicurezza assoluta delle tue informazioni.
        </p>
      </section>

      <section>
        <h2>6. I Tuoi Diritti</h2>
        <p>
          Hai il diritto di accedere, correggere o cancellare le tue informazioni personali in nostro possesso. Puoi anche opporti al trattamento delle tue informazioni personali o richiedere che limitiamo il trattamento in determinate circostanze. Per esercitare questi diritti, contattaci all'indirizzo email fornito nella sezione dei contatti.
        </p>
      </section>

      <section>
        <h2>7. Modifiche alla Politica di Privacy</h2>
        <p>
          Potremmo aggiornare questa politica di privacy di tanto in tanto. Ti informeremo di eventuali modifiche pubblicando la nuova politica di privacy su questa pagina. Ti consigliamo di rivedere periodicamente questa pagina per rimanere informato su come proteggiamo le tue informazioni.
        </p>
      </section>

      <section>
        <h2>8. Contatti</h2>
        <p>
          Se hai domande o dubbi riguardo a questa politica di privacy, ti preghiamo di contattarci all'indirizzo email: info@bestvoucher.it.
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;