import React, { useEffect } from 'react';
import '../Terms.css';  // Assicurati di creare un file CSS separato per gli stili

function Terms() {
  useEffect(() => {
    // Scrolla la pagina verso l'alto quando il componente si monta
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-container">
      <h1 className="terms-title">Termini e Condizioni</h1>

      <section>
        <h2>1. Introduzione</h2>
        <p>
          Benvenuti su BestVoucher! Questi termini e condizioni delineano le regole e i regolamenti per l'utilizzo del sito web BestVoucher.
        </p>
        <p>
          Accedendo a questo sito web, si assume che l'utente accetti questi termini e condizioni. Non continuare a utilizzare BestVoucher se non si accettano tutti i termini e le condizioni indicati in questa pagina.
        </p>
      </section>

      <section>
        <h2>2. Account Utente</h2>
        <p>
          Per utilizzare determinati servizi offerti da BestVoucher, potrebbe essere necessario registrarsi e creare un account. L'utente è responsabile di mantenere la riservatezza delle proprie credenziali di accesso e di tutte le attività che avvengono sotto il proprio account.
        </p>
        <p>
          È necessario fornire informazioni accurate e aggiornate durante la registrazione e mantenere tali informazioni aggiornate durante l'utilizzo del sito.
        </p>
      </section>

      <section>
        <h2>3. Termini di Pagamento</h2>
        <p>
          Tutti i pagamenti per i servizi e i prodotti offerti su BestVoucher devono essere effettuati in conformità con i termini di pagamento specificati sul sito. I prezzi sono soggetti a modifiche senza preavviso.
        </p>
        <p>
          BestVoucher non è responsabile per eventuali tasse o commissioni associate ai pagamenti effettuati tramite il sito.
        </p>
      </section>

      <section>
        <h2>4. Proprietà Intellettuale</h2>
        <p>
          Tutti i contenuti presenti su BestVoucher, inclusi testi, immagini, loghi e grafica, sono di proprietà di BestVoucher o dei suoi licenziatari e sono protetti dalle leggi sul copyright e altre leggi sulla proprietà intellettuale.
        </p>
        <p>
          L'uso non autorizzato di qualsiasi contenuto del sito è severamente vietato e può comportare sanzioni civili e penali.
        </p>
      </section>

      <section>
        <h2>5. Limitazione di Responsabilità</h2>
        <p>
          BestVoucher non sarà ritenuto responsabile per eventuali danni diretti, indiretti, accidentali, speciali o consequenziali derivanti dall'uso o dall'incapacità di utilizzare il sito.
        </p>
        <p>
          BestVoucher non garantisce che il sito sarà disponibile ininterrottamente o privo di errori.
        </p>
      </section>

      <section>
        <h2>6. Modifiche ai Termini</h2>
        <p>
          BestVoucher si riserva il diritto di modificare questi termini e condizioni in qualsiasi momento. Le modifiche entreranno in vigore non appena pubblicate sul sito. L'uso continuato del sito implica l'accettazione delle modifiche.
        </p>
      </section>

      <section>
        <h2>7. Contatti</h2>
        <p>
          Per qualsiasi domanda riguardante questi termini e condizioni, si prega di contattare BestVoucher all'indirizzo email: info@bestvoucher.it.
        </p>
      </section>
    </div>
  );
}

export default Terms;