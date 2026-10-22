import { LegalPage } from "@/components/legal";
import { OPERATOR as O, RETENTION_DAYS } from "@/lib/legal";

export const metadata = { title: "Datenschutzerklärung" };

export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>
        {O.brand} verarbeitet nur die Daten, die für Ihren Brief nötig sind – und löscht sie nach {RETENTION_DAYS} Tagen. Keine Cookies, kein
        Tracking, keine Werbung. Im Einzelnen:
      </p>

      <h2>1. Verantwortlicher</h2>
      <address>
        {O.name}
        <br />
        {O.street}, {O.zip} {O.city}
        <br />
        Telefon {O.phone} · E-Mail <a href={`mailto:${O.email}`}>{O.email}</a>
      </address>

      <h2>2. Aufruf der Website</h2>
      <p>
        Beim Aufruf übermittelt Ihr Browser technisch notwendige Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browsertyp) an unseren
        Hosting-Anbieter Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. Vercel verarbeitet diese Daten in unserem Auftrag; die
        Anwendung selbst läuft auf Servern in Frankfurt. Soweit Daten in die USA gelangen, stützt sich die Übermittlung auf das EU-US Data Privacy
        Framework, dem Vercel angehört, und auf Standardvertragsklauseln. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und
        stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Server-Protokolle werden nach kurzer Zeit gelöscht.
      </p>
      <p>
        Die Schriften der Website liefern wir von unserem eigenen Server aus; es wird keine Verbindung zu Google Fonts aufgebaut. Wir setzen keine
        Cookies und keine Werbedienste ein. Ihr laufender Entwurf wird ausschließlich im lokalen Speicher Ihres Browsers (localStorage) gehalten,
        damit er beim Fotografieren oder Bezahlen nicht verloren geht; er wird nach 24 Stunden oder beim Abschluss der Bestellung automatisch
        gelöscht und nie an uns übertragen.
      </p>
      <p>
        Zur Reichweitenmessung nutzen wir Vercel Web Analytics. Der Dienst arbeitet ohne Cookies und ohne geräteübergreifende Kennungen: Es werden
        aufgerufene Seite, Verweisquelle, Land, Browser- und Gerätetyp erfasst; aus der IP-Adresse wird ein kurzlebiger, nicht rückrechenbarer
        Hashwert gebildet, der nach 24 Stunden verworfen wird. Eine Identifizierung einzelner Personen ist damit nicht möglich. Rechtsgrundlage ist
        unser berechtigtes Interesse, zu erfahren, welche Seiten genutzt werden (Art. 6 Abs. 1 lit. f DSGVO).
      </p>

      <h2>3. Erkennung aus Foto oder PDF</h2>
      <p>
        Wenn Sie ein Foto oder PDF hochladen, übermitteln wir die Datei einmalig an die KI-Schnittstelle von Anthropic (Anthropic PBC, 548 Market St,
        San Francisco, CA 94104, USA; für Nutzer im EWR vertraglich über Anthropic Ireland, Limited) zur Erkennung von Absender, Empfänger,
        Aktenzeichen, Datum und Fristhinweis. Die Datei wird dabei nicht auf unseren Servern gespeichert; wir übernehmen nur die erkannten Felder
        in Ihren Entwurf. Anthropic verarbeitet API-Daten als Auftragsverarbeiter, verwendet sie nicht zum Training seiner Modelle und löscht sie nach
        seinen Richtlinien. Die Übermittlung in die USA erfolgt auf Grundlage von Standardvertragsklauseln. Rechtsgrundlage ist die Durchführung des
        Vertrags bzw. vorvertraglicher Maßnahmen auf Ihre Anfrage (Art. 6 Abs. 1 lit. b DSGVO).
      </p>
      <p>
        Behördenschreiben können Angaben enthalten, die besonderen Schutz genießen (z. B. zu Gesundheit oder Sozialleistungen). Laden Sie solche
        Dokumente nur hoch, wenn Sie das möchten; Sie können alle Felder auch von Hand eingeben. Mit dem Hochladen willigen Sie in die Verarbeitung
        dieser Angaben für die Erkennung ein (Art. 9 Abs. 2 lit. a DSGVO); die Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.
      </p>

      <h2>4. Erstellung des Brieftexts</h2>
      <p>
        Ihre Angaben (Briefart, Empfänger, Absender, Betreff, Aktenzeichen, Stichpunkte zum Sachverhalt sowie bei Überarbeitungen der bisherige Text)
        werden zur Formulierung des Textvorschlags an Anthropic übermittelt (siehe Ziffer 3). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2>5. Bestellung, Unterschrift und Brief-PDF</h2>
      <p>
        Bei der Bestellung speichern wir Ihre Bestellnummer, E-Mail-Adresse, Versandart, Preis, Absender- und Empfängeranschrift, Betreff, den
        freigegebenen Brieftext, Ihre gezeichnete Unterschrift als Bild und das erzeugte PDF. Die Daten liegen in einer Datenbank bei Supabase Pte. Ltd.
        (65 Chulia Street #38-02/03, OCBC Centre, Singapur 049513) auf Servern von Amazon Web Services in Irland (Region eu-west-1); Supabase ist unser Auftragsverarbeiter.
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Wir löschen Bestellung und PDF automatisch {RETENTION_DAYS} Tage nach der Bestellung;
        Rechnungsdaten bewahren wir gemäß den handels- und steuerrechtlichen Pflichten auf (Art. 6 Abs. 1 lit. c DSGVO).
      </p>

      <h2>6. Zahlung</h2>
      <p>
        Die Zahlung wickelt Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland ab. Stripe erhält Ihre Zahlungsdaten,
        E-Mail-Adresse, Betrag und Bestellnummer; wir erhalten keine vollständigen Karten- oder Kontodaten, sondern nur die Bestätigung der Zahlung.
        Stripe ist für die Zahlungsabwicklung eigenständig verantwortlich; Einzelheiten unter{" "}
        <a href="https://stripe.com/de/privacy" rel="noopener noreferrer" target="_blank">
          stripe.com/de/privacy
        </a>
        . Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2>7. Druck und Versand</h2>
      <p>
        Wählen Sie Versand per Post oder Einschreiben, übermitteln wir das PDF mit Absender- und Empfängeranschrift an unseren Druck- und
        Postdienstleister Pingen GmbH (Schweiz, Kontakt laut Impressum unter pingen.com), der den Brief druckt, kuvertiert und der Post übergibt. Pingen
        handelt als Auftragsverarbeiter; für die Schweiz besteht ein Angemessenheitsbeschluss der EU-Kommission. Pingen löscht die Briefdaten nach
        Abschluss des Versands gemäß seinen Löschfristen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2>8. E-Mails</h2>
      <p>
        An die von Ihnen angegebene Adresse senden wir die Bestellbestätigung mit Download-Link sowie Statusmeldungen zum Versand. Werbung
        versenden wir nicht. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2>9. Empfänger im Überblick</h2>
      <ul>
        <li>Vercel Inc. (USA) – Hosting, Server in Frankfurt; DPF und Standardvertragsklauseln</li>
        <li>Anthropic (USA / Irland) – Felderkennung und Textvorschlag; Standardvertragsklauseln</li>
        <li>Supabase Pte. Ltd. (Singapur) – Datenbank und Dateiablage, Server in Irland</li>
        <li>Stripe Payments Europe, Ltd. (Irland) – Zahlung</li>
        <li>Pingen GmbH (Schweiz) – Druck und Versand; Angemessenheitsbeschluss</li>
      </ul>
      <p>Eine Weitergabe zu anderen Zwecken findet nicht statt.</p>

      <h2>10. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21). Eine erteilte
        Einwilligung können Sie jederzeit widerrufen. Wenden Sie sich dazu an {O.email}. Außerdem können Sie sich bei einer Aufsichtsbehörde
        beschweren, z. B. beim Bayerischen Landesamt für Datenschutzaufsicht, Promenade 18, 91522 Ansbach.
      </p>

      <h2>11. Keine automatisierte Entscheidung</h2>
      <p>
        Die KI erstellt Textvorschläge, die Sie prüfen und ändern. Eine automatisierte Entscheidung mit rechtlicher Wirkung Ihnen gegenüber im Sinne
        von Art. 22 DSGVO findet nicht statt.
      </p>

      <h2>12. Pflicht zur Bereitstellung</h2>
      <p>
        Für die Bestellung benötigen wir Ihre Anschrift (als Absender des Briefs), die Empfängeranschrift und eine E-Mail-Adresse. Ohne diese
        Angaben können wir den Brief nicht erstellen oder versenden. Das Hochladen eines Fotos ist freiwillig.
      </p>
    </LegalPage>
  );
}
