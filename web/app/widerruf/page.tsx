import { LegalPage } from "@/components/legal";
import { OPERATOR as O } from "@/lib/legal";
import { PRICES, euro } from "@/lib/types";

export const metadata = { title: "Widerrufsbelehrung" };

export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <h2>Widerrufsrecht</h2>
      <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
      <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.</p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({O.name}, {O.street}, {O.zip} {O.city}, Telefon {O.phone}, E-Mail {O.email}) mittels einer
        eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
        informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
      </p>
      <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen
        vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
        Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
        ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </p>
      <p>
        Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen,
        der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten,
        bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
      </p>

      <h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
      <div className="box">
        <p>
          <strong>PDF-Download ({euro(PRICES.download.cents)}):</strong> Das Widerrufsrecht erlischt, wenn wir mit der Bereitstellung des digitalen Inhalts begonnen haben,
          nachdem Sie ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist beginnen, und Sie Ihre Kenntnis bestätigt haben, dass Sie
          durch Ihre Zustimmung Ihr Widerrufsrecht verlieren (§ 356 Abs. 5 BGB).
        </p>
        <p>
          <strong>Versand per Post oder Einschreiben:</strong> Das Widerrufsrecht erlischt, wenn wir die Dienstleistung vollständig erbracht haben –
          also Ihr Brief gedruckt und an den Postdienstleister übergeben wurde – und wir damit erst begonnen haben, nachdem Sie ausdrücklich zugestimmt
          und Ihre Kenntnis vom Verlust des Widerrufsrechts bestätigt haben (§ 356 Abs. 4 BGB).
        </p>
        <p style={{ marginBottom: 0 }}>
          Beides ist der Normalfall bei {O.brand}: Sie geben diese Zustimmung im Bezahlschritt, damit Ihr Brief sofort erstellt und versandt wird.
          Zudem ist jeder Brief nach Ihren Angaben individuell angefertigt (§ 312g Abs. 2 Nr. 1 BGB).
        </p>
      </div>

      <h2>Muster-Widerrufsformular</h2>
      <p>Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.</p>
      <div className="box">
        <p>
          An {O.name}, {O.street}, {O.zip} {O.city}, E-Mail {O.email}:
        </p>
        <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*):</p>
        <p>Bestellt am (*) / erhalten am (*): ______________________</p>
        <p>Name des/der Verbraucher(s): ______________________</p>
        <p>Anschrift des/der Verbraucher(s): ______________________</p>
        <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ______________________</p>
        <p>Datum: ______________________</p>
        <p style={{ marginBottom: 0 }}>(*) Unzutreffendes streichen.</p>
      </div>
    </LegalPage>
  );
}
