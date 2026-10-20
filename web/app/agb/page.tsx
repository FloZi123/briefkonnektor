import { LegalPage } from "@/components/legal";
import { OPERATOR as O, RETENTION_DAYS } from "@/lib/legal";
import { PRICES, euro } from "@/lib/types";

export const metadata = { title: "AGB" };

export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <h2>1. Geltungsbereich, Anbieter</h2>
      <p>
        Diese Bedingungen gelten für alle Verträge, die über {O.brand} ({O.domain}) zwischen {O.name}, {O.street}, {O.zip} {O.city} („wir“) und Ihnen
        als Nutzerin oder Nutzer geschlossen werden. {O.brand} richtet sich an Verbraucher; Unternehmer können den Dienst ebenfalls nutzen.
      </p>

      <h2>2. Leistung</h2>
      <p>{O.brand} ist eine technische Formulierungs- und Versandhilfe für Briefe an Behörden, Unternehmen und andere Stellen. Die Leistung umfasst:</p>
      <ol>
        <li>die optionale Erkennung von Absender, Empfänger, Aktenzeichen, Datum und Fristhinweis aus einem von Ihnen hochgeladenen Foto oder PDF;</li>
        <li>einen automatisch erzeugten Textvorschlag auf Grundlage Ihrer Angaben, den Sie vor der Bestellung vollständig lesen, ändern und freigeben;</li>
        <li>die Erstellung des Briefs als PDF im DIN-5008-Format mit Ihrer auf dem Bildschirm gezeichneten Unterschrift;</li>
        <li>auf Wunsch Druck und Versand des Briefs als Standardbrief oder Einschreiben über einen Druck- und Postdienstleister.</li>
      </ol>
      <p>
        <strong>Keine Rechtsberatung.</strong> Textvorschläge werden maschinell erstellt. Wir prüfen weder die Rechtslage noch die Richtigkeit,
        Vollständigkeit oder Erfolgsaussicht Ihres Schreibens und erbringen keine Rechtsdienstleistung (RDG). Angezeigte Fristen sind unverbindliche
        Hinweise, die wir aus Ihren Angaben oder dem Dokument ableiten; die Berechnung und Einhaltung von Fristen liegt in Ihrer Verantwortung.
      </p>

      <h2>3. Vertragsschluss</h2>
      <p>
        Die Darstellung des Dienstes ist kein verbindliches Angebot. Mit dem Abschluss des Bezahlvorgangs (Klick auf den Bezahlbutton) geben Sie ein
        verbindliches Angebot ab. Der Vertrag kommt zustande, wenn wir die Zahlung bestätigen und den Brief bereitstellen bzw. in den Versand geben.
        Vertragssprache ist Deutsch. Wir speichern Ihre Bestellung einschließlich des Briefs für {RETENTION_DAYS} Tage (Ziffer 8); danach ist der
        Vertragstext bei uns nicht mehr abrufbar.
      </p>

      <h2>4. Preise und Zahlung</h2>
      <p>
        Es gelten die im Bestellvorgang angezeigten Endpreise einschließlich Umsatzsteuer: PDF-Download {euro(PRICES.download.cents)}, Versand als
        Standardbrief {euro(PRICES.post.cents)}, Versand als Einschreiben {euro(PRICES.registered.cents)}. Die Zahlung erfolgt vor Ausführung über
        unseren Zahlungsdienstleister Stripe mit den dort angebotenen Zahlungsarten (u. a. Karte, PayPal, Apple Pay, Google Pay).
      </p>

      <h2>5. Ausführung und Versand</h2>
      <ul>
        <li>
          <strong>Download:</strong> Das PDF steht unmittelbar nach Zahlungsbestätigung auf der Bestätigungsseite und über den Ihnen angezeigten Link
          für {RETENTION_DAYS} Tage zum Abruf bereit.
        </li>
        <li>
          <strong>Standardbrief / Einschreiben:</strong> Wir übergeben Ihren Brief an den Druck- und Postdienstleister in der Regel am selben Werktag
          (Bestellungen bis 12:00 Uhr) und spätestens am folgenden Werktag. Die Beförderung dauert innerhalb Deutschlands üblicherweise ein bis drei
          Werktage; Laufzeiten des Postdienstleisters können wir nicht garantieren. Beim Einschreiben erhalten Sie einen Nachweis über die Einlieferung
          bzw. den Einwurf.
        </li>
        <li>
          Der Zugang beim Empfänger liegt außerhalb unseres Einflusses. Bei knappen Fristen empfehlen wir das Einschreiben oder die persönliche Abgabe
          des heruntergeladenen Briefs.
        </li>
        <li>
          Ein Versandauftrag kann nach Übergabe an den Dienstleister nicht mehr geändert oder gestoppt werden. Prüfen Sie Empfängeranschrift und
          Text daher vor der Bestellung sorgfältig.
        </li>
      </ul>

      <h2>6. Widerrufsrecht</h2>
      <p>
        Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten, das Muster-Widerrufsformular und die Voraussetzungen, unter denen das
        Widerrufsrecht vorzeitig erlischt, finden Sie in der <a href="/widerruf">Widerrufsbelehrung</a>. Im Bezahlschritt stimmen Sie zu, dass wir
        sofort mit der Ausführung beginnen; mit vollständiger Ausführung (Bereitstellung des PDFs bzw. Übergabe an den Postdienstleister) erlischt
        das Widerrufsrecht.
      </p>

      <h2>7. Ihre Pflichten</h2>
      <ul>
        <li>Ihre Angaben, insbesondere Absender- und Empfängeranschrift, müssen zutreffend sein. Sie prüfen den Text vor der Freigabe vollständig.</li>
        <li>Sie unterschreiben nur mit Ihrem eigenen Namen oder als nachweislich bevollmächtigte Person.</li>
        <li>
          Sie versenden über {O.brand} keine Inhalte, die rechtswidrig sind, Dritte beleidigen, bedrohen oder deren Rechte verletzen. Wir dürfen die
          Ausführung in solchen Fällen verweigern; bereits gezahlte Beträge erstatten wir dann.
        </li>
        <li>Fotos und Dokumente laden Sie nur hoch, soweit Sie dazu berechtigt sind. Für Daten Dritter in Ihren Dokumenten sind Sie verantwortlich.</li>
      </ul>

      <h2>8. Unterschrift und Formvorschriften</h2>
      <p>
        Ihre auf dem Bildschirm gezeichnete Unterschrift wird in den Brief eingedruckt. Ein so gedruckter Brief genügt der Textform (§ 126b BGB), die
        für die meisten Widersprüche, Kündigungen und Beschwerden ausreicht. Verlangt ein Gesetz oder Vertrag die Schriftform mit eigenhändiger
        Unterschrift (§ 126 BGB, z. B. Kündigung eines Miet- oder Arbeitsvertrags), genügt der gedruckte Brief nicht. Nutzen Sie dann den
        PDF-Download und unterschreiben Sie den Ausdruck von Hand.
      </p>

      <h2>9. Speicherung und Löschung</h2>
      <p>
        Hochgeladene Fotos und PDFs werden nur zur Erkennung verarbeitet und nicht gespeichert. Bestellung, Brieftext, Unterschrift und das erzeugte
        PDF speichern wir {RETENTION_DAYS} Tage zur Abwicklung, zum Download und zur Klärung von Reklamationen und löschen sie danach automatisch.
        Näheres in der <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>

      <h2>10. Gewährleistung</h2>
      <p>
        Es gelten die gesetzlichen Gewährleistungsrechte. Ist ein Brief aus Gründen, die wir zu vertreten haben, fehlerhaft gedruckt oder nicht in den
        Versand gegeben worden, erstellen und versenden wir ihn kostenfrei erneut oder erstatten den Preis.
      </p>

      <h2>11. Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem
        Produkthaftungsgesetz. Bei einfacher Fahrlässigkeit haften wir nur bei Verletzung einer Pflicht, deren Erfüllung die ordnungsgemäße
        Durchführung des Vertrags erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen dürfen; die Haftung ist dann auf den
        vorhersehbaren, vertragstypischen Schaden begrenzt. Eine weitergehende Haftung, insbesondere für den Inhalt und die rechtliche Wirkung Ihres
        Schreibens, für versäumte Fristen und für Laufzeiten oder Verlust auf dem Postweg, ist ausgeschlossen, soweit nicht vorstehend etwas anderes
        bestimmt ist.
      </p>

      <h2>12. Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland. Bei Verbrauchern gilt diese Rechtswahl nur, soweit dadurch zwingende Verbraucherschutzvorschriften
        des Staates Ihres gewöhnlichen Aufenthalts nicht entzogen werden. Wir nehmen nicht an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teil. Sollten einzelne Bestimmungen unwirksam sein, bleibt der Vertrag im Übrigen wirksam.
      </p>
    </LegalPage>
  );
}
