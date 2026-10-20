import { LegalPage } from "@/components/legal";
import { OPERATOR as O } from "@/lib/legal";

export const metadata = { title: "Impressum" };

export default function Page() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <address>
        {O.name}
        <br />
        {O.street}
        <br />
        {O.zip} {O.city}
        <br />
        {O.country}
      </address>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={`tel:${O.phone.replace(/\s/g, "")}`}>{O.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${O.email}`}>{O.email}</a>
      </p>

      {O.vatId && (
        <>
          <h2>Umsatzsteuer-Identifikationsnummer</h2>
          <p>USt-IdNr. gemäß § 27a UStG: {O.vatId}</p>
        </>
      )}

      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        {O.name}, Anschrift wie oben (§ 18 Abs. 2 MStV).
      </p>

      <h2>Hinweis zur Art der Leistung</h2>
      <p>
        {O.brand} ist eine technische Formulierungs- und Versandhilfe. Texte werden auf Grundlage Ihrer Angaben erstellt, von Ihnen geprüft und
        freigegeben und auf Wunsch gedruckt und versandt. {O.brand} erbringt keine Rechtsdienstleistung im Sinne des Rechtsdienstleistungsgesetzes
        (RDG), prüft keine Rechtslage und übernimmt keine Fristenkontrolle. Für rechtliche Beratung wenden Sie sich an eine Rechtsanwältin oder einen
        Rechtsanwalt, bei Behördenbescheiden gegebenenfalls an die zuständige Beratungsstelle.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
      </p>
    </LegalPage>
  );
}
