import type { LetterKind } from "./types";

/**
 * Ratgeber-Seiten je Bescheid-Typ (SEO-Einstieg). Reine Information zu Fristen, Form und Ablauf –
 * keine Bewertung des Einzelfalls (RDG). Jede Seite führt in den passenden Brief-Flow.
 */
export interface Guide {
  slug: string;
  kind: LetterKind;
  title: string; // H1
  metaTitle: string; // ≤ 48 Zeichen – das Layout hängt „ – Flinkbrief“ an
  published: string; // ISO-Datum
  updated: string; // ISO-Datum, bei inhaltlichen Änderungen setzen
  description: string; // Meta + Intro
  deadline: string; // ein Satz, prominent
  deadlineShort: string; // für Karten
  sections: Array<{ h: string; p: string[]; list?: string[] }>;
  faq: Array<{ q: string; a: string }>;
  /** Wann ein Brief allein nicht reicht: ehrliche Verweise auf Mieterverein, Sozialverband, Anwalt, Beratungsstellen. */
  elsewhere: string[];
  cta: string;
  related: string[]; // slugs
}

export const GUIDES: Guide[] = [
  {
    slug: "einspruch-bussgeldbescheid",
    kind: "einspruch",
    title: "Einspruch gegen einen Bußgeldbescheid",
    metaTitle: "Einspruch Bußgeldbescheid: Frist, Form, Muster",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Zwei Wochen Frist, schriftlich an die Bußgeldstelle: Was im Bescheid steht, wie der Einspruch aussieht, was danach kommt. Fotografieren, per Post schicken.",
    deadlineShort: "Zwei Wochen ab Zustellung",
    deadline: "Zwei Wochen ab Zustellung. Der Einspruch muss in dieser Zeit bei der Behörde eingehen, nicht nur abgeschickt sein.",
    sections: [
      {
        h: "Was im Bußgeldbescheid steht",
        p: [
          "Ein Bußgeldbescheid kommt von der Bußgeldstelle, die für den Tatort zuständig ist – je nach Bundesland Landratsamt, Polizei, Regierungspräsidium oder Zentrale Bußgeldstelle. Er nennt den Vorwurf (zum Beispiel Geschwindigkeitsüberschreitung, Rotlicht, Handy am Steuer, Parkverstoß), Tatzeit und Tatort, das Kennzeichen, die Geldbuße, Gebühren und Auslagen, eventuell Punkte in Flensburg und ein Fahrverbot.",
          "Am Ende steht die Rechtsbehelfsbelehrung. Dort steht wörtlich, bis wann und wohin der Einspruch muss. Dieser Absatz ist der wichtigste im ganzen Schreiben.",
        ],
      },
      {
        h: "Frist und Form",
        p: [
          "Der Einspruch muss innerhalb von zwei Wochen nach Zustellung bei der Behörde eingehen, die den Bescheid erlassen hat (§ 67 OWiG). Zugestellt wird meist per Postzustellungsurkunde; das Datum steht auf dem gelben Umschlag. Fällt das Fristende auf ein Wochenende oder einen Feiertag, gilt der nächste Werktag.",
          "Der Einspruch geht schriftlich oder zur Niederschrift bei der Behörde. Eine E-Mail reicht in der Regel nicht. Ein Brief mit Unterschrift, Aktenzeichen und dem Satz, dass Sie Einspruch einlegen, genügt. Eine Begründung ist nicht Pflicht – sie kann aber helfen, und sie kann auch später nachgereicht werden.",
        ],
      },
      {
        h: "Was nach dem Einspruch passiert",
        p: [
          "Die Behörde prüft den Fall noch einmal. Sie kann den Bescheid zurücknehmen, ändern oder die Akte an die Staatsanwaltschaft und von dort an das Amtsgericht geben. Dort gibt es eine Verhandlung; der Einspruch kann bis dahin jederzeit zurückgenommen werden.",
          "Wird nicht fristgerecht Einspruch eingelegt, wird der Bescheid rechtskräftig. Dann sind Geldbuße, Punkte und Fahrverbot verbindlich.",
        ],
      },
      {
        h: "Was oft sinnvoll ist",
        p: ["Diese Punkte lassen sich mit dem Einspruch verbinden oder als Nachfrage stellen:"],
        list: [
          "Akteneinsicht beantragen – inklusive Messprotokoll, Eichschein und Fotos",
          "Nachfragen, ob die Fahrereigenschaft überhaupt feststeht (Halter ist nicht automatisch Fahrer)",
          "Bei Fahrverbot: Umstände nennen, die beruflich oder familiär gegen ein Fahrverbot sprechen",
          "Bei knapper Frist: Einspruch zuerst, Begründung nachreichen",
        ],
      },
    ],
    faq: [
      { q: "Muss ich den Einspruch begründen?", a: "Nein. Der Einspruch ist auch ohne Begründung wirksam. Eine Begründung kann aber später nachgereicht werden und hilft der Behörde bei der Prüfung." },
      { q: "Was kostet ein Einspruch?", a: "Der Einspruch selbst ist bei der Behörde kostenlos. Geht der Fall vor das Amtsgericht und Sie verlieren, kommen Gerichtskosten hinzu. Nehmen Sie den Einspruch vorher zurück, bleibt es bei der Geldbuße und den Gebühren des Bescheids." },
      { q: "Reicht eine E-Mail?", a: "In den meisten Bundesländern nicht. Sicher ist der Brief mit Unterschrift oder die Niederschrift bei der Behörde. Für die Frist zählt der Eingang bei der Behörde." },
      { q: "Was ist der Unterschied zum Anhörungsbogen?", a: "Der Anhörungsbogen kommt vor dem Bescheid und ist noch kein Bußgeld. Dort können Sie sich äußern oder schweigen. Der Bußgeldbescheid kommt danach – erst gegen ihn gibt es den Einspruch." },
      { q: "Einspruch per Einschreiben oder einfacher Brief?", a: "Beides ist zulässig – entscheidend ist der Zugang innerhalb der zwei Wochen. Ein Einwurf-Einschreiben belegt, wann der Brief in den Briefkasten der Behörde kam; bei knapper Frist ist das der sichere Weg. Alternativ zur Niederschrift persönlich bei der Behörde." },
      { q: "Frist versäumt – geht noch etwas?", a: "Waren Sie ohne eigenes Verschulden verhindert (Krankenhaus, Zustellung an eine falsche Adresse), können Sie innerhalb von zwei Wochen nach Wegfall des Hindernisses Wiedereinsetzung in den vorigen Stand beantragen und den Einspruch nachholen (§ 52 OWiG, § 44 StPO). Urlaub allein reicht meist nicht." },
      { q: "Wie beantrage ich Akteneinsicht?", a: "Schriftlich bei der Bußgeldstelle, mit Aktenzeichen: Einsicht in Messprotokoll, Eichschein, Schulungsnachweis und Fotos. Betroffene erhalten die Akte in der Regel als Kopie oder digital; Messrohdaten müssen teils gesondert angefordert werden." },
    ],
    elsewhere: [
      "Fahrverbot oder Punkte, die den Führerschein gefährden: Fachanwalt für Verkehrsrecht. Mit Verkehrsrechtsschutz kostet das meist nichts; es gibt auch Prüfdienste, die solche Fälle ohne Kosten für Sie übernehmen.",
      "Die Messung selbst soll angegriffen werden (Eichschein, Messprotokoll, Toleranzen): Dafür braucht es Akteneinsicht und in der Praxis einen Anwalt.",
      "Es geht um einen Strafbefehl statt eines Bußgeldbescheids: immer Anwalt, die Frist beträgt ebenfalls zwei Wochen.",
    ],
    cta: "Bußgeldbescheid fotografieren – Flinkbrief erkennt Aktenzeichen, Frist und Betrag und formuliert den Einspruch.",
    related: ["widerspruch-jobcenter-bescheid", "mahnung-widersprechen"],
  },
  {
    slug: "widerspruch-jobcenter-bescheid",
    kind: "widerspruch",
    title: "Widerspruch gegen einen Jobcenter-Bescheid",
    metaTitle: "Widerspruch Jobcenter-Bescheid: Frist & Inhalt",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Ein Monat Frist, kostenlos, schriftlich: Widerspruch gegen Bürgergeld-Bescheid, Rückforderung oder Sanktion. Bescheid fotografieren, Brief per Post schicken.",
    deadlineShort: "Ein Monat ab Bekanntgabe",
    deadline: "Ein Monat ab Bekanntgabe. Ein Bescheid gilt am dritten Tag nach Aufgabe zur Post als bekannt gegeben – das Datum oben rechts plus drei Tage.",
    sections: [
      {
        h: "Welche Bescheide es gibt",
        p: [
          "Das Jobcenter verschickt Bewilligungsbescheide, Änderungsbescheide, Aufhebungs- und Erstattungsbescheide (Rückforderungen), Sanktions- oder Minderungsbescheide und Ablehnungen. Jeder dieser Bescheide ist ein Verwaltungsakt, gegen den Widerspruch möglich ist.",
          "Im Bescheid stehen Berechnungszeitraum, anerkannte Bedarfe (Regelbedarf, Unterkunft, Heizung), angerechnetes Einkommen und der Zahlbetrag. Bei Rückforderungen steht der Betrag und der Zeitraum, für den zu viel gezahlt worden sein soll.",
        ],
      },
      {
        h: "Frist und Form",
        p: [
          "Der Widerspruch muss innerhalb eines Monats nach Bekanntgabe beim Jobcenter eingehen (§ 84 SGG). Er ist kostenlos. Schriftlich heißt: Brief mit Unterschrift oder zur Niederschrift im Jobcenter; viele Jobcenter akzeptieren auch den Upload über jobcenter.digital.",
          "Nötig sind Name, Anschrift, Aktenzeichen oder Kundennummer, das Datum des Bescheids und der Satz, dass Sie Widerspruch einlegen. Eine Begründung ist nicht Pflicht, kann aber nachgereicht werden. Wer die Frist verpasst, kann einen Überprüfungsantrag nach § 44 SGB X stellen – der ist an keine Frist gebunden, wirkt aber nur begrenzt zurück.",
        ],
      },
      {
        h: "Was nach dem Widerspruch passiert",
        p: [
          "Das Jobcenter prüft den Bescheid noch einmal und erlässt einen Widerspruchsbescheid. Hilft es ab, wird der Bescheid geändert. Lehnt es ab, bleibt die Klage beim Sozialgericht – ebenfalls kostenlos, Frist wieder ein Monat.",
          "Wichtig: Der Widerspruch gegen eine Rückforderung hat aufschiebende Wirkung. Bei Sanktionen und Aufhebungen für die Zukunft meist nicht – dann kann ein Antrag auf aufschiebende Wirkung sinnvoll sein.",
        ],
      },
      {
        h: "Was oft sinnvoll ist",
        p: ["Diese Punkte lassen sich mit dem Widerspruch verbinden:"],
        list: [
          "Akteneinsicht und eine nachvollziehbare Berechnung anfordern",
          "Bei Rückforderung: Nachweise für den Zeitraum beilegen (Kontoauszüge, Lohnabrechnungen, Mietvertrag)",
          "Bei Sanktion: Gründe für das Fehlverhalten nennen (Krankheit, Termin nicht erhalten, Kinderbetreuung)",
          "Bei Unterkunftskosten: Mietvertrag, Nebenkostenabrechnung und Heizkosten nachreichen",
        ],
      },
    ],
    faq: [
      { q: "Kostet der Widerspruch etwas?", a: "Nein. Widerspruch und Klage beim Sozialgericht sind für Leistungsberechtigte kostenlos." },
      { q: "Muss ich während des Widerspruchs zurückzahlen?", a: "Bei Erstattungsbescheiden hat der Widerspruch aufschiebende Wirkung – die Rückforderung ruht, bis entschieden ist. Bei Aufrechnung mit laufenden Leistungen lohnt sich ein ausdrücklicher Hinweis darauf im Widerspruch." },
      { q: "Was, wenn die Frist vorbei ist?", a: "Dann bleibt der Überprüfungsantrag nach § 44 SGB X. Das Jobcenter muss den Bescheid erneut prüfen; Nachzahlungen gibt es aber höchstens für ein Jahr rückwirkend." },
      { q: "Kann ich den Widerspruch per E-Mail schicken?", a: "Eine einfache E-Mail genügt der Schriftform nicht. Sicher sind Brief, Niederschrift im Jobcenter oder der Upload mit Login bei jobcenter.digital." },
      { q: "Rückforderung erhalten – was tun?", a: "Prüfen Sie, für welchen Zeitraum und aus welchem Grund zurückgefordert wird und ob der Bescheid die Berechnung aufschlüsselt. Fehlen Freibeträge oder wurde Einkommen doppelt angerechnet, gehört genau das in den Widerspruch. Ratenzahlung können Sie unabhängig davon beantragen." },
      { q: "Widerspruch per Einschreiben schicken?", a: "Der Zugang zählt, nicht der Versand. Ein Einwurf-Einschreiben dokumentiert den Zugangstag; alternativ geben Sie den Widerspruch persönlich ab und lassen sich den Eingang auf einer Kopie bestätigen." },
      { q: "Ich verstehe den Bescheid nicht – reicht eine Nachfrage?", a: "Eine Nachfrage stoppt die Frist nicht. Legen Sie fristwahrend Widerspruch ein und bitten Sie im selben Schreiben um Erläuterung oder Akteneinsicht – die Begründung können Sie nachreichen." },
    ],
    elsewhere: [
      "Leistungen wurden gekürzt oder gestrichen und Miete oder Essen sind gefährdet: Eilantrag beim Sozialgericht. Sozialberatungen von Caritas, Diakonie, AWO oder ein Fachanwalt für Sozialrecht helfen dabei; Beratungshilfe beim Amtsgericht kostet 15 €.",
      "Der Bescheid ist unverständlich, aber vermutlich richtig: Lieber nachfragen oder Unterlagen nachreichen als pauschal widersprechen.",
      "Jobcenter prüfen jeden Widerspruch vollständig – entscheidend sind Ihre konkreten Angaben zum Fall, nicht Paragrafen oder Textbausteine aus dem Internet.",
    ],
    cta: "Bescheid fotografieren – Flinkbrief erkennt Kundennummer, Zeitraum und Betrag und formuliert den Widerspruch.",
    related: ["widerspruch-rundfunkbeitrag", "mahnung-widersprechen"],
  },
  {
    slug: "widerspruch-nebenkostenabrechnung",
    kind: "nebenkosten",
    title: "Widerspruch gegen die Nebenkostenabrechnung",
    metaTitle: "Widerspruch Nebenkostenabrechnung: Frist, Muster",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Zwölf Monate für Einwendungen, Belegeinsicht, Zahlung unter Vorbehalt: Was Mieter bei einer falschen Abrechnung tun. Abrechnung fotografieren, Brief per Post.",
    deadlineShort: "Zwölf Monate ab Zugang",
    deadline: "Zwölf Monate ab Zugang der Abrechnung für Einwendungen (§ 556 Abs. 3 BGB). Eine Nachzahlung wird trotzdem meist nach 30 Tagen fällig – deshalb unter Vorbehalt zahlen.",
    sections: [
      {
        h: "Was in der Abrechnung stehen muss",
        p: [
          "Eine Nebenkostenabrechnung muss den Abrechnungszeitraum, die Gesamtkosten je Kostenart, den Verteilerschlüssel, den auf die Wohnung entfallenden Anteil und die geleisteten Vorauszahlungen nennen. Fehlt davon etwas, ist die Abrechnung formell unwirksam.",
          "Umgelegt werden dürfen nur Kosten, die im Mietvertrag als Betriebskosten vereinbart sind und in der Betriebskostenverordnung stehen – zum Beispiel Grundsteuer, Wasser, Heizung, Hausreinigung, Gartenpflege, Versicherungen. Verwaltungskosten, Reparaturen und Bankgebühren gehören nicht dazu.",
        ],
      },
      {
        h: "Fristen für Vermieter und Mieter",
        p: [
          "Der Vermieter muss die Abrechnung spätestens zwölf Monate nach Ende des Abrechnungszeitraums zustellen. Kommt sie später, darf er keine Nachzahlung mehr verlangen – ein Guthaben müssen Sie trotzdem bekommen.",
          "Sie als Mieter haben ab Zugang zwölf Monate Zeit, Einwendungen zu erheben. Danach gelten die Posten als anerkannt. Die Einwendung muss konkret sein: welcher Posten, warum.",
        ],
      },
      {
        h: "Belegeinsicht und Zahlung unter Vorbehalt",
        p: [
          "Sie haben das Recht, die Originalbelege einzusehen – Rechnungen, Verträge, Ablesewerte. Solange der Vermieter die Einsicht verweigert, dürfen Sie die Nachzahlung zurückhalten.",
          "Wenn Sie zahlen, aber Zweifel haben: unter Vorbehalt zahlen und das im Schreiben ausdrücklich sagen. So bleibt der Rückforderungsanspruch erhalten.",
        ],
      },
      {
        h: "Typische Fehler in Abrechnungen",
        p: ["Diese Punkte lohnen einen genauen Blick:"],
        list: [
          "Falscher Verteilerschlüssel (Wohnfläche statt Personenzahl oder umgekehrt) oder falsche Quadratmeter",
          "Heizkosten nicht mindestens zur Hälfte nach Verbrauch verteilt",
          "Leerstand auf die Mieter umgelegt statt auf den Vermieter",
          "Kostenarten, die nicht im Mietvertrag vereinbart sind",
          "Vorauszahlungen falsch oder unvollständig angerechnet",
        ],
      },
    ],
    faq: [
      { q: "Muss ich die Nachzahlung sofort zahlen?", a: "Fällig wird sie in der Regel 30 Tage nach Zugang. Bei berechtigten Zweifeln können Sie unter Vorbehalt zahlen oder bis zur Belegeinsicht zurückhalten." },
      { q: "Wie formuliere ich eine Einwendung?", a: "Konkret: Posten benennen, Betrag nennen, Grund angeben. „Ich widerspreche der Position Gartenpflege (312,40 €), weil Gartenpflege im Mietvertrag nicht als Betriebskosten vereinbart ist.“" },
      { q: "Darf der Vermieter Belege nur als Kopie schicken?", a: "Sie haben Anspruch auf Einsicht in die Originale beim Vermieter. Kopien kann er gegen Kostenerstattung schicken; verpflichtet ist er dazu nur, wenn die Einsicht vor Ort unzumutbar ist." },
      { q: "Was ist mit der Heizkostenabrechnung?", a: "Sie gehört zur Nebenkostenabrechnung, folgt aber der Heizkostenverordnung: 50 bis 70 Prozent nach Verbrauch, der Rest nach Fläche. Fehlt die Verbrauchserfassung, dürfen Sie 15 Prozent kürzen." },
      { q: "Nebenkostenabrechnung zu hoch – was tun?", a: "Erst vergleichen: Vorjahr, Betriebskostenspiegel Ihrer Stadt, Wohnfläche laut Mietvertrag. Dann schriftlich Einwendungen erheben, Belegeinsicht verlangen und die Nachzahlung nur unter Vorbehalt oder erst nach der Belegprüfung zahlen. Dafür haben Sie zwölf Monate ab Zugang." },
      { q: "Wo kann ich die Abrechnung prüfen lassen?", a: "Mieterverein (Beratung ist im Mitgliedsbeitrag enthalten), Verbraucherzentrale, Prüfdienste oder ein Fachanwalt für Mietrecht. Eine erste Einordnung der Posten liefert Flinkbrief nach dem Foto kostenlos; die fachliche Prüfung einzelner Positionen ersetzt das nicht." },
      { q: "Welche Frist gilt für meinen Widerspruch?", a: "Zwölf Monate ab Zugang der Abrechnung (§ 556 Abs. 3 BGB). Danach sind Einwendungen ausgeschlossen, es sei denn, Sie haben die Verspätung nicht zu vertreten. Der Vermieter muss die Abrechnung seinerseits binnen zwölf Monaten nach Ende des Abrechnungszeitraums zustellen." },
    ],
    elsewhere: [
      "Sie wollen die Abrechnung Posten für Posten fachlich prüfen lassen: Mieterverein (Beratung ist im Mitgliedsbeitrag enthalten) oder ein Prüfdienst. Die Einwendung über Flinkbrief sichert bis dahin die Frist und die Belegeinsicht.",
      "Streit um Mietpreisbremse, Mieterhöhung oder Kaution: Mieterverein oder spezialisierte Legal-Tech-Anbieter, die mit Erfolgsbeteiligung arbeiten.",
      "Der Vermieter droht mit Kündigung oder Klage: Fachanwalt für Mietrecht.",
    ],
    cta: "Abrechnung fotografieren – Flinkbrief erkennt Zeitraum, Beträge und Vermieter und formuliert die Einwendung mit Bitte um Belegeinsicht.",
    related: ["mahnung-widersprechen", "widerspruch-jobcenter-bescheid"],
  },
  {
    slug: "mahnung-widersprechen",
    kind: "mahnung",
    title: "Auf eine Mahnung oder Zahlungsaufforderung antworten",
    metaTitle: "Mahnung widersprechen: Inkasso, Mahnbescheid",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Mahnung, Inkasso oder gerichtlicher Mahnbescheid – drei Dinge, drei Fristen. Was Sie prüfen und wie Sie antworten. Mahnung fotografieren, Antwort per Post.",
    deadlineShort: "Mahnbescheid: zwei Wochen",
    deadline: "Bei einem gerichtlichen Mahnbescheid: zwei Wochen ab Zustellung für den Widerspruch. Bei einfachen Mahnungen und Inkasso gibt es keine gesetzliche Frist – aber je früher Sie antworten, desto weniger Kosten kommen dazu.",
    sections: [
      {
        h: "Mahnung, Inkasso oder Mahnbescheid?",
        p: [
          "Eine Mahnung kommt vom Unternehmen selbst und erinnert an eine offene Rechnung. Ein Inkassoschreiben kommt von einem beauftragten Inkassodienst und enthält zusätzliche Gebühren. Beides ist ohne Gericht.",
          "Ein gerichtlicher Mahnbescheid kommt vom Mahngericht, in einem gelben Umschlag, mit amtlichem Vordruck. Nur hier läuft eine harte Frist: zwei Wochen für den Widerspruch, sonst folgt ein Vollstreckungsbescheid.",
        ],
      },
      {
        h: "Was Sie prüfen sollten",
        p: ["Bevor Sie zahlen oder widersprechen:"],
        list: [
          "Gibt es einen Vertrag, eine Bestellung oder eine Lieferung – und war es wirklich Ihre?",
          "Stimmen Betrag, Rechnungsnummer und Datum mit Ihren Unterlagen überein?",
          "Ist die Forderung verjährt? Die regelmäßige Verjährung beträgt drei Jahre zum Jahresende.",
          "Sind Mahn- und Inkassogebühren angemessen? Inkassokosten sind gedeckelt; für die erste Mahnung dürfen keine Gebühren verlangt werden, wenn Sie noch nicht in Verzug waren.",
          "Haben Sie schon gezahlt oder widerrufen?",
        ],
      },
      {
        h: "So antworten Sie",
        p: [
          "Schriftlich, mit Rechnungs- oder Aktenzeichen, und klar: Entweder Sie bestreiten die Forderung ganz oder teilweise und sagen warum, oder Sie erkennen sie an und bitten um Ratenzahlung oder Stundung. Verlangen Sie bei Inkasso eine Aufstellung der Forderung mit Nachweis der Vollmacht.",
          "Nichts zu tun ist die teuerste Option: Es folgen weitere Mahnstufen, Inkasso, Mahnbescheid und am Ende Vollstreckung – jedes Mal mit neuen Kosten.",
        ],
      },
      {
        h: "Beim gerichtlichen Mahnbescheid",
        p: [
          "Der Widerspruch geht auf dem beiliegenden Vordruck an das Mahngericht, innerhalb von zwei Wochen. Eine Begründung ist nicht nötig. Danach muss der Gläubiger klagen, wenn er die Forderung weiterverfolgen will. Ein Teilwiderspruch ist möglich, wenn Sie nur einen Teil bestreiten.",
        ],
      },
    ],
    faq: [
      { q: "Muss ich auf eine Mahnung reagieren?", a: "Gesetzlich nicht. Aber wer nicht reagiert, gerät in Verzug und zahlt am Ende Mahnkosten, Inkassogebühren und Zinsen. Eine kurze schriftliche Antwort stoppt das meist." },
      { q: "Darf Inkasso mich anrufen oder zuhause besuchen?", a: "Kontaktaufnahme ist erlaubt, Druck mit falschen Drohungen nicht. Sie können schriftlich verlangen, nur noch per Post kontaktiert zu werden." },
      { q: "Wie hoch dürfen Inkassokosten sein?", a: "Sie richten sich nach dem Rechtsanwaltsvergütungsgesetz und sind bei kleinen Forderungen gedeckelt – bei Forderungen bis 50 Euro maximal 30 Euro für die Inkassotätigkeit." },
      { q: "Was ist ein Vollstreckungsbescheid?", a: "Er folgt, wenn Sie dem Mahnbescheid nicht widersprechen. Auch dagegen gibt es noch zwei Wochen Einspruch – danach kann der Gerichtsvollzieher kommen." },
      { q: "Mahnbescheid vom Gericht – welches Formular?", a: "Dem gerichtlichen Mahnbescheid liegt ein Widerspruchsformular bei. Sie können es nutzen, müssen aber nicht: Ein formloser schriftlicher Widerspruch mit Aktenzeichen an das Mahngericht genügt (§ 694 ZPO). Entscheidend ist der Eingang innerhalb von zwei Wochen ab Zustellung." },
      { q: "Forderung bestreiten – wie formuliere ich das?", a: "Nennen Sie Rechnungs- oder Aktenzeichen, erklären Sie, dass Sie die Forderung bestreiten, und fordern Sie Nachweise: Vertrag, Rechnung, Zugang. Zahlen Sie nichts „zur Sicherheit“ – eine Teilzahlung kann als Anerkenntnis gewertet werden." },
      { q: "Mahnung per Einschreiben beantworten?", a: "Nicht nötig, aber sinnvoll, wenn Inkasso oder Gläubiger später behaupten könnten, nichts erhalten zu haben. Ein Einwurf-Einschreiben belegt den Zugang." },
    ],
    elsewhere: [
      "Es ist ein gerichtlicher Mahnbescheid (gelber Umschlag vom Amtsgericht): Widerspruch innerhalb von zwei Wochen beim Mahngericht, am besten mit dem beiliegenden Formular. Bei Unsicherheit Verbraucherzentrale oder Anwalt.",
      "Inkasso droht mit Schufa-Eintrag oder die Forderung ist Ihnen völlig unbekannt: Verbraucherzentrale (Beratung gegen geringe Gebühr, je nach Bundesland).",
      "Hohe Summe oder Klage angekündigt: Anwalt, mit Rechtsschutz oder Beratungshilfe.",
    ],
    cta: "Mahnung fotografieren – Flinkbrief erkennt Absender, Betrag und Rechnungsnummer und formuliert die Antwort: bestreiten, nachfragen oder Ratenzahlung vorschlagen.",
    related: ["widerspruch-nebenkostenabrechnung", "einspruch-bussgeldbescheid"],
  },
  {
    slug: "widerspruch-rundfunkbeitrag",
    kind: "widerspruch",
    title: "Widerspruch gegen einen Rundfunkbeitrag-Bescheid",
    metaTitle: "Rundfunkbeitrag: Widerspruch, Befreiung, Frist",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Ein Monat Frist gegen den Festsetzungsbescheid des Beitragsservice. Worauf sich ein Widerspruch stützen kann, wer befreit wird, was bei Säumniszuschlägen gilt.",
    deadlineShort: "Ein Monat ab Zugang",
    deadline: "Ein Monat ab Zugang des Festsetzungsbescheids. Der Widerspruch geht an die Landesrundfunkanstalt (zum Beispiel BR, WDR, NDR) – nicht an den Beitragsservice.",
    sections: [
      {
        h: "Was der Beitragsservice schickt",
        p: [
          "Zuerst kommen Zahlungsaufforderungen und Erinnerungen. Erst der Festsetzungsbescheid ist ein Verwaltungsakt – er setzt rückständige Beiträge plus Säumniszuschlag (mindestens 8 Euro) fest und ist die Grundlage für eine Vollstreckung. Nur gegen ihn gibt es den Widerspruch.",
          "Im Bescheid stehen Beitragsnummer, Zeitraum, Betrag und die Rechtsbehelfsbelehrung mit der zuständigen Landesrundfunkanstalt.",
        ],
      },
      {
        h: "Wann ein Widerspruch Aussicht hat",
        p: ["Der Rundfunkbeitrag ist pro Wohnung fällig, unabhängig von Geräten. Ein Widerspruch hat vor allem dann Substanz, wenn:"],
        list: [
          "für dieselbe Wohnung schon jemand anderes zahlt (Mitbewohner, Partner) – Beitragsnummer der anderen Person angeben",
          "die Wohnung im festgesetzten Zeitraum nicht bewohnt oder bereits abgemeldet war",
          "eine Befreiung vorlag oder beantragt war (Bürgergeld, Sozialhilfe, BAföG, Grundsicherung)",
          "eine Ermäßigung zusteht (Merkzeichen RF im Schwerbehindertenausweis)",
          "der Zeitraum falsch ist oder bereits gezahlte Beiträge nicht angerechnet wurden",
        ],
      },
      {
        h: "Befreiung und Ermäßigung",
        p: [
          "Die Befreiung muss beantragt werden – rückwirkend höchstens drei Jahre, und nur mit Nachweis (Bewilligungsbescheid der Sozialleistung). Sie gilt für den Zeitraum der Leistung; danach muss neu beantragt werden. Ein offener Befreiungsantrag ist ein guter Grund, im Widerspruch um Ruhen des Verfahrens zu bitten.",
        ],
      },
      {
        h: "Was nach dem Widerspruch passiert",
        p: [
          "Die Landesrundfunkanstalt erlässt einen Widerspruchsbescheid. Dagegen bleibt die Klage beim Verwaltungsgericht innerhalb eines Monats. Der Widerspruch hat keine aufschiebende Wirkung – die Vollstreckung kann weiterlaufen, deshalb lohnt der Antrag auf Aussetzung, wenn die Beträge strittig sind.",
        ],
      },
    ],
    faq: [
      { q: "Kann ich den Rundfunkbeitrag grundsätzlich verweigern?", a: "Nein. Die Beitragspflicht pro Wohnung ist höchstrichterlich bestätigt. Widersprüche nur mit dem Argument, man habe kein Gerät oder nutze das Angebot nicht, werden abgelehnt." },
      { q: "Was ist der Säumniszuschlag?", a: "Ein Prozent der rückständigen Beiträge, mindestens 8 Euro, pro Festsetzungsbescheid. Er entfällt, wenn der Bescheid aufgehoben wird." },
      { q: "An wen schicke ich den Widerspruch?", a: "An die in der Rechtsbehelfsbelehrung genannte Landesrundfunkanstalt. Der Beitragsservice in Köln ist nur die Verwaltungsstelle; dort eingegangene Widersprüche werden in der Regel weitergeleitet, sicher ist aber der direkte Weg." },
      { q: "Zählt eine Zweitwohnung?", a: "Für eine Nebenwohnung gibt es auf Antrag eine Befreiung, wenn für die Hauptwohnung bereits gezahlt wird." },
      { q: "Befreiung bei Bürgergeld – wie beantrage ich sie?", a: "Mit dem aktuellen Leistungsbescheid beim Beitragsservice, online oder per Post. Die Befreiung gilt ab dem Monat der Antragstellung; rückwirkend nur begrenzt und wenn der Leistungsbescheid selbst rückwirkend gilt. Das ist ein Antrag, kein Widerspruch." },
      { q: "Festsetzungsbescheid trotz Zahlung bekommen?", a: "Dann fehlt beim Beitragsservice vermutlich die Zuordnung Ihrer Zahlung. Legen Sie Widerspruch ein und fügen Sie Kontoauszug oder Zahlungsbeleg mit Beitragsnummer bei." },
      { q: "Widerspruch per Einschreiben oder online?", a: "Der Beitragsservice nimmt den Widerspruch schriftlich per Post entgegen; ein Einwurf-Einschreiben belegt den Zugang innerhalb der Monatsfrist. Eine einfache E-Mail genügt der Schriftform nicht sicher." },
    ],
    elsewhere: [
      "Sie beziehen Bürgergeld, BAföG oder Grundsicherung: Befreiung mit Bescheid beim Beitragsservice beantragen – das ist ein Antrag, kein Widerspruch. Rückwirkend geht das nur begrenzt, also möglichst früh stellen.",
      "Die Vollstreckung läuft bereits (Vollstreckungsankündigung, Gerichtsvollzieher): Beitragsservice oder Vollstreckungsstelle anrufen und Ratenzahlung vereinbaren.",
      "Grundsätzliche Einwände gegen den Beitrag (Verfassungsmäßigkeit, keine Nutzung) hat das Bundesverfassungsgericht 2018 entschieden. Ein Widerspruch bezieht sich deshalb sinnvollerweise auf den konkreten Bescheid: Zeitraum, Befreiung, doppelte Anmeldung, Zahlung bereits erfolgt.",
    ],
    cta: "Festsetzungsbescheid fotografieren – Flinkbrief erkennt Beitragsnummer, Zeitraum und Betrag und formuliert den Widerspruch an die richtige Rundfunkanstalt.",
    related: ["widerspruch-jobcenter-bescheid", "mahnung-widersprechen"],
  },
  {
    slug: "einspruch-steuerbescheid",
    kind: "steuer",
    title: "Einspruch gegen den Steuerbescheid",
    metaTitle: "Einspruch Steuerbescheid: Frist, Form, Muster",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Ein Monat Frist, kostenlos, per Brief oder ELSTER: Einspruch einlegen, Aussetzung der Vollziehung beantragen. Steuerbescheid fotografieren, Einspruch per Post.",
    deadline: "Ein Monat ab Bekanntgabe. Ein Bescheid gilt am vierten Tag nach Aufgabe zur Post als bekannt gegeben – Bescheiddatum plus vier Tage, dann ein Monat.",
    deadlineShort: "Ein Monat ab Bekanntgabe",
    sections: [
      {
        h: "Was im Steuerbescheid steht",
        p: [
          "Der Steuerbescheid vom Finanzamt nennt die festgesetzte Steuer, die bereits gezahlten Beträge und daraus die Nachzahlung oder Erstattung. Entscheidend ist der Erläuterungsteil am Ende: Dort steht, wo das Finanzamt von Ihrer Erklärung abgewichen ist – etwa nicht anerkannte Werbungskosten, gestrichene Fahrtkosten oder fehlende Belege.",
          "Ebenfalls im Bescheid: Vorläufigkeitsvermerke (Punkte, die wegen anhängiger Verfahren offen bleiben) und die Rechtsbehelfsbelehrung mit Frist und Adresse für den Einspruch.",
        ],
      },
      {
        h: "Frist und Form",
        p: [
          "Der Einspruch muss innerhalb eines Monats nach Bekanntgabe beim Finanzamt eingehen, das den Bescheid erlassen hat (§ 355 AO). Bei Post gilt der Bescheid am vierten Tag nach Aufgabe als bekannt gegeben (§ 122 AO); fällt das Fristende auf ein Wochenende oder einen Feiertag, gilt der nächste Werktag.",
          "Der Einspruch ist kostenlos und formlos möglich: per Brief, über ELSTER („Einspruch“ im Formularbereich) oder zur Niederschrift im Finanzamt. Nötig sind Steuernummer, Steuerart und Jahr, das Datum des Bescheids und die Erklärung, dass Sie Einspruch einlegen. Die Begründung darf nachgereicht werden.",
        ],
      },
      {
        h: "Zahlen müssen Sie trotzdem – außer bei Aussetzung",
        p: [
          "Der Einspruch stoppt die Fälligkeit nicht. Die Nachzahlung ist zum genannten Termin fällig, sonst entstehen Säumniszuschläge von einem Prozent pro Monat. Wenn ernstliche Zweifel an der Rechtmäßigkeit bestehen, können Sie zusammen mit dem Einspruch die Aussetzung der Vollziehung beantragen (§ 361 AO) – dann muss der strittige Betrag bis zur Entscheidung nicht gezahlt werden. Wird der Einspruch später abgelehnt, fallen für die Zeit der Aussetzung Zinsen an.",
        ],
      },
      {
        h: "Einspruch oder schlichte Änderung?",
        p: [
          "Beim Einspruch prüft das Finanzamt den ganzen Bescheid neu – auch zu Ihren Ungunsten. Vor einer solchen „Verböserung“ muss es Sie aber hinweisen, und Sie können den Einspruch dann zurücknehmen.",
          "Geht es nur um einen einzelnen Punkt, zum Beispiel einen vergessenen Beleg, reicht oft ein Antrag auf schlichte Änderung (§ 172 AO). Er ist an dieselbe Frist gebunden, löst aber keine Gesamtprüfung aus. Nach Ablauf der Frist bleiben nur enge Ausnahmen: neue Tatsachen, die Sie nicht grob verschuldet verspätet vorbringen, oder offenbare Schreib- und Rechenfehler des Finanzamts.",
        ],
      },
      {
        h: "Häufige Einspruchsgründe",
        p: ["Diese Punkte lohnen einen Blick in den Erläuterungsteil:"],
        list: [
          "Werbungskosten, Sonderausgaben oder außergewöhnliche Belastungen ohne Begründung gekürzt",
          "Entfernungspauschale, Homeoffice-Pauschale oder Arbeitsmittel nicht berücksichtigt",
          "Handwerker- und Haushaltsleistungen nicht angerechnet",
          "Kinderfreibetrag, Kinderbetreuungskosten oder Unterhaltsleistungen fehlen",
          "Zahlendreher gegenüber der Erklärung oder Lohnsteuerbescheinigung",
        ],
      },
    ],
    faq: [
      { q: "Muss ich während des Einspruchs zahlen?", a: "Ja, die Nachzahlung bleibt fällig. Nur ein bewilligter Antrag auf Aussetzung der Vollziehung schiebt die Zahlung des strittigen Betrags auf." },
      { q: "Kann der Bescheid durch den Einspruch schlechter werden?", a: "Grundsätzlich ja, das Finanzamt prüft alles neu. Es muss Sie vorher auf eine Verschlechterung hinweisen; dann können Sie den Einspruch zurücknehmen und es bleibt beim alten Bescheid." },
      { q: "Reicht eine E-Mail an das Finanzamt?", a: "Eine einfache E-Mail genügt in der Regel nicht. Sicher sind Brief, ELSTER oder die Niederschrift im Finanzamt. Für die Frist zählt der Eingang beim Finanzamt." },
      { q: "Was ist mit dem Vorläufigkeitsvermerk?", a: "Punkte mit Vorläufigkeitsvermerk bleiben automatisch offen, solange Musterverfahren laufen. Dafür brauchen Sie keinen eigenen Einspruch – nur für alles andere." },
      { q: "Steuerbescheid prüfen – worauf achten?", a: "Vergleichen Sie Bescheid und Steuererklärung Punkt für Punkt: Werbungskosten, Sonderausgaben, außergewöhnliche Belastungen, Handwerker- und Haushaltsleistungen, Kinderfreibeträge. Abweichungen erklärt das Finanzamt in den „Erläuterungen“ am Ende des Bescheids – dort stehen die Ansatzpunkte für den Einspruch." },
      { q: "Einspruch per Einschreiben oder ELSTER?", a: "Beides wahrt die Frist. Per ELSTER haben Sie sofort eine Eingangsbestätigung; per Brief belegt ein Einwurf-Einschreiben den Zugang. Eine einfache E-Mail reicht nur, wenn das Finanzamt dafür eine Adresse angibt." },
      { q: "Nachzahlung nicht leistbar – was tun?", a: "Stundung oder Ratenzahlung beim Finanzamt beantragen, unabhängig vom Einspruch. Der Einspruch allein schiebt die Fälligkeit nicht auf – dafür ist der Antrag auf Aussetzung der Vollziehung nötig, der ernstliche Zweifel am Bescheid voraussetzt." },
    ],
    elsewhere: [
      "Betrieb, Vermietung, Kapitalerträge im Ausland oder hohe Nachzahlung: Steuerberater. Arbeitnehmer und Rentner bekommen beim Lohnsteuerhilfeverein Beratung inklusive Einspruch (Beitrag nach Einkommen).",
      "Der Einspruch wurde abgelehnt (Einspruchsentscheidung): Klage beim Finanzgericht innerhalb eines Monats, in der Regel mit Berater.",
      "Die Nachzahlung ist nicht leistbar: Stundung oder Ratenzahlung beim Finanzamt beantragen – unabhängig vom Einspruch, der die Zahlung nicht aufschiebt.",
    ],
    cta: "Steuerbescheid fotografieren – Flinkbrief erkennt Steuernummer, Steuerart und Frist und formuliert den Einspruch mit Ihren Beanstandungen.",
    related: ["widerspruch-jobcenter-bescheid", "mahnung-widersprechen"],
  },
  {
    slug: "widerspruch-krankenkasse",
    kind: "widerspruch",
    title: "Widerspruch gegen einen Bescheid der Krankenkasse",
    metaTitle: "Widerspruch Krankenkasse: Ablehnung, Frist, Form",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Ein Monat Frist, kostenlos, schriftlich: Was Sie tun können, wenn die Krankenkasse eine Leistung ablehnt, das Krankengeld beendet oder Geld zurückfordert.",
    deadline: "Ein Monat ab Bekanntgabe – Bescheiddatum plus drei Tage, dann ein Monat. Fehlt die Rechtsbehelfsbelehrung, verlängert sich die Frist auf ein Jahr.",
    deadlineShort: "Ein Monat ab Bekanntgabe",
    sections: [
      {
        h: "Welche Bescheide es gibt",
        p: [
          "Krankenkassen entscheiden per Bescheid über Leistungen: Hilfsmittel wie Rollstuhl oder Hörgerät, Reha und Kuren, Zahnersatz, Psychotherapie, häusliche Krankenpflege, Fahrtkosten – und über das Krankengeld, insbesondere dessen Ende. Dazu kommen Beitragsbescheide für freiwillig Versicherte und Rückforderungen.",
          "Oft stützt sich die Ablehnung auf ein Gutachten des Medizinischen Dienstes (MD). Dieses Gutachten können Sie anfordern; es ist der Ausgangspunkt für jede Begründung.",
        ],
      },
      {
        h: "Frist und Form",
        p: [
          "Der Widerspruch muss innerhalb eines Monats nach Bekanntgabe bei der Krankenkasse eingehen (§ 84 SGG). Ein per Post versandter Bescheid gilt am dritten Tag nach Aufgabe als bekannt gegeben (§ 37 SGB X). Der Widerspruch ist kostenlos; schriftlich heißt Brief mit Unterschrift oder Niederschrift in der Geschäftsstelle. Eine Begründung ist nicht Pflicht und kann nachgereicht werden.",
          "Über den Widerspruch entscheidet der Widerspruchsausschuss der Kasse. Lehnt er ab, bleibt die Klage beim Sozialgericht – ebenfalls kostenlos, Frist wieder ein Monat.",
        ],
      },
      {
        h: "Was Sie in den Widerspruch aufnehmen sollten",
        p: ["Je konkreter, desto besser. Hilfreich sind:"],
        list: [
          "Das MD-Gutachten und die Akte anfordern (Akteneinsicht nach § 25 SGB X)",
          "Aktuelle Befunde und eine Stellungnahme des behandelnden Arztes beilegen, die auf das Gutachten eingeht",
          "Bei Hilfsmitteln: warum das beantragte Hilfsmittel nötig ist und die vorgeschlagene Alternative nicht ausreicht",
          "Beim Krankengeld: lückenlose Arbeitsunfähigkeitsbescheinigungen nachweisen – Lücken sind der häufigste Ablehnungsgrund",
          "Bei Rückforderungen: Zeitraum, Betrag und Berechnung anfordern",
        ],
      },
      {
        h: "Fristen der Kasse: Genehmigungsfiktion",
        p: [
          "Die Krankenkasse muss über einen Leistungsantrag innerhalb von drei Wochen entscheiden, bei Einschaltung des Medizinischen Dienstes innerhalb von fünf Wochen (§ 13 Abs. 3a SGB V). Versäumt sie das ohne Mitteilung eines hinreichenden Grundes, können Sie sich die Leistung selbst beschaffen und die Kosten erstattet verlangen. Prüfen Sie deshalb immer das Datum Ihres Antrags.",
        ],
      },
    ],
    faq: [
      { q: "Kostet der Widerspruch etwas?", a: "Nein. Widerspruch und eine spätere Klage beim Sozialgericht sind für Versicherte kostenlos." },
      { q: "Muss ich das MD-Gutachten hinnehmen?", a: "Nein. Es ist eine Stellungnahme nach Aktenlage. Ein aktueller Befundbericht Ihres Arztes, der sich konkret mit dem Gutachten auseinandersetzt, ist das stärkste Mittel im Widerspruch." },
      { q: "Läuft das Krankengeld während des Widerspruchs weiter?", a: "Bei einer Ablehnung oder Beendigung in der Regel nicht. Umso wichtiger ist, schnell zu widersprechen und die Arbeitsunfähigkeit lückenlos zu belegen." },
      { q: "Was, wenn die Frist vorbei ist?", a: "Dann bleibt der Überprüfungsantrag nach § 44 SGB X. Die Kasse muss den Bescheid erneut prüfen; Leistungen gibt es aber höchstens vier Jahre rückwirkend." },
      { q: "Reha abgelehnt – was gehört in den Widerspruch?", a: "Das Gutachten des Medizinischen Dienstes anfordern, Stellungnahmen der behandelnden Ärzte beilegen und konkret benennen, welche Befunde das Gutachten nicht berücksichtigt hat. Ob der Widerspruch Erfolg hat, hängt vom Einzelfall ab." },
      { q: "Drei Wochen keine Antwort – gilt der Antrag als genehmigt?", a: "Entscheidet die Kasse nicht innerhalb von drei Wochen (fünf Wochen, wenn der Medizinische Dienst eingeschaltet ist) und teilt sie keinen Grund mit, gilt der Antrag als genehmigt (§ 13 Abs. 3a SGB V). Fordern Sie die Leistung dann schriftlich unter Hinweis auf die Genehmigungsfiktion ein." },
      { q: "Widerspruch per Einschreiben?", a: "Der Zugang innerhalb eines Monats zählt. Ein Einwurf-Einschreiben belegt ihn; viele Kassen bestätigen den Eingang auch bei Abgabe in der Geschäftsstelle." },
    ],
    elsewhere: [
      "Reha, Hilfsmittel, Krankengeld oder Behandlung abgelehnt: Unabhängige Patientenberatung (UPD, kostenlos) oder Sozialverband VdK/SoVD, die den Widerspruch auch inhaltlich begründen und bis zum Sozialgericht begleiten.",
      "Die Kasse hat drei Wochen (mit Gutachten fünf Wochen) nicht entschieden: Dann gilt der Antrag als genehmigt (§ 13 Abs. 3a SGB V) – das ist kein Widerspruch, sondern ein Anspruch, den Sie schriftlich geltend machen.",
      "Der Widerspruch wurde abgelehnt (Widerspruchsbescheid): Klage beim Sozialgericht innerhalb eines Monats, gerichtskostenfrei.",
    ],
    cta: "Bescheid fotografieren – Flinkbrief erkennt Versichertennummer, Datum und Frist und formuliert den Widerspruch mit Bitte um das Gutachten.",
    related: ["widerspruch-rentenversicherung", "widerspruch-jobcenter-bescheid"],
  },
  {
    slug: "widerspruch-rentenversicherung",
    kind: "widerspruch",
    title: "Widerspruch gegen einen Bescheid der Rentenversicherung",
    metaTitle: "Widerspruch Rentenbescheid: Frist, Form, Muster",
    published: "2026-10-23",
    updated: "2026-10-27",
    description: "Ein Monat Frist gegen Rentenbescheid, abgelehnte Erwerbsminderungsrente oder Reha. Was Sie prüfen und wie der Widerspruch an die Rentenversicherung aussieht.",
    deadline: "Ein Monat ab Bekanntgabe – Bescheiddatum plus drei Tage, dann ein Monat. Danach wird der Rentenbescheid bestandskräftig.",
    deadlineShort: "Ein Monat ab Bekanntgabe",
    sections: [
      {
        h: "Welche Bescheide es gibt",
        p: [
          "Die Deutsche Rentenversicherung verschickt Rentenbescheide (Altersrente, Höhe, anerkannte Zeiten), Bescheide über Erwerbsminderungsrente oder deren Ablehnung, Reha-Bescheide, Bescheide zum Hinzuverdienst sowie Rückforderungen. Jeder davon ist ein Verwaltungsakt mit Widerspruchsmöglichkeit.",
          "Dem Rentenbescheid liegt der Versicherungsverlauf bei. Er listet jeden Monat Ihres Lebens mit Beitrags-, Anrechnungs- und Berücksichtigungszeiten. Fehler dort wirken sich direkt auf die Rentenhöhe aus.",
        ],
      },
      {
        h: "Frist und Form",
        p: [
          "Der Widerspruch muss innerhalb eines Monats nach Bekanntgabe bei der Rentenversicherung eingehen (§ 84 SGG); der Bescheid gilt am dritten Tag nach Aufgabe zur Post als bekannt gegeben. Der Widerspruch ist kostenlos, schriftlich per Brief oder zur Niederschrift in einer Auskunfts- und Beratungsstelle. Begründung und Unterlagen können nachgereicht werden.",
          "Es entscheidet die Widerspruchsstelle des Rentenversicherungsträgers. Gegen deren Bescheid bleibt die Klage beim Sozialgericht, kostenlos, Frist ein Monat.",
        ],
      },
      {
        h: "Rentenbescheid: den Versicherungsverlauf prüfen",
        p: ["Typische Lücken und Fehler, die sich mit Nachweisen beheben lassen:"],
        list: [
          "Schul- und Hochschulzeiten nach dem 17. Geburtstag nicht als Anrechnungszeit erfasst",
          "Kindererziehungszeiten fehlen oder sind dem falschen Elternteil zugeordnet",
          "Zeiten von Krankheit, Arbeitslosigkeit oder Pflege eines Angehörigen nicht berücksichtigt",
          "Ausbildung, Wehr- oder Zivildienst fehlen",
          "Entgelte einzelner Jahre weichen von den Lohnunterlagen ab",
        ],
      },
      {
        h: "Erwerbsminderungsrente abgelehnt",
        p: [
          "Die Ablehnung stützt sich fast immer auf ein Gutachten mit der Aussage, Sie könnten noch mindestens sechs Stunden täglich arbeiten. Im Widerspruch zählt deshalb: das Gutachten anfordern, aktuelle Facharztberichte beilegen, die konkret die Belastbarkeit beschreiben, und auf Beschwerden hinweisen, die das Gutachten nicht berücksichtigt hat. Wer mehrere Erkrankungen hat, sollte das Zusammenwirken benennen – einzeln betrachtet wirkt jede harmloser.",
        ],
      },
    ],
    faq: [
      { q: "Versicherungsverlauf falsch – Widerspruch oder Kontenklärung?", a: "Vor dem Rentenantrag: Kontenklärung beantragen. Liegt der Rentenbescheid schon vor, muss der Fehler mit dem Widerspruch innerhalb eines Monats gerügt werden – danach bleibt nur der Überprüfungsantrag nach § 44 SGB X mit höchstens vier Jahren Rückwirkung." },
      { q: "Wird die Rente während des Widerspruchs weitergezahlt?", a: "Eine bewilligte Rente läuft weiter. Bei einer Ablehnung gibt es bis zur Entscheidung nichts; bei Rückforderungen hat der Widerspruch aufschiebende Wirkung." },
      { q: "Kostet der Widerspruch etwas?", a: "Nein. Widerspruch und Klage beim Sozialgericht sind für Versicherte kostenlos. Kostenlos beraten die Auskunfts- und Beratungsstellen der Rentenversicherung und die Versichertenältesten." },
      { q: "Wie lange dauert das Widerspruchsverfahren?", a: "Bei Rentenbescheiden meist drei bis sechs Monate, bei Erwerbsminderung mit neuem Gutachten oft länger. Nach drei Monaten ohne Entscheidung ist eine Untätigkeitsklage möglich." },
      { q: "Erwerbsminderungsrente abgelehnt – was gehört in den Widerspruch?", a: "Welche Befunde das Gutachten nicht berücksichtigt hat, aktuelle Atteste der behandelnden Ärzte, Ihr tatsächlicher Tagesablauf und bisherige Reha-Versuche. Fordern Sie das Gutachten und Akteneinsicht an; die Begründung können Sie nachreichen." },
      { q: "Fehlende Zeiten im Versicherungsverlauf – Widerspruch nötig?", a: "Meist nicht: Beantragen Sie Kontenklärung und reichen Sie Nachweise (Ausbildung, Kindererziehung, Krankheit, Ausland) nach. Nur wenn die Rentenversicherung Zeiten ausdrücklich ablehnt, ist der Widerspruch der richtige Weg." },
      { q: "Widerspruch per Einschreiben oder online?", a: "Schriftlich per Post (Einwurf-Einschreiben belegt den Zugang), zur Niederschrift in einer Beratungsstelle oder über das Online-Portal der Deutschen Rentenversicherung. Maßgeblich ist der Eingang innerhalb eines Monats." },
    ],
    elsewhere: [
      "Erwerbsminderungsrente oder Reha abgelehnt: Sozialverband VdK oder SoVD übernimmt für Mitglieder Widerspruch und Klage; alternativ Fachanwalt für Sozialrecht.",
      "Im Rentenbescheid fehlen Zeiten (Ausbildung, Kinder, Ausland): Erst Kontenklärung beantragen und Nachweise einreichen – oft reicht das ohne Widerspruch.",
      "Der Widerspruch wurde abgelehnt: Klage beim Sozialgericht innerhalb eines Monats, gerichtskostenfrei.",
    ],
    cta: "Bescheid fotografieren – Flinkbrief erkennt Versicherungsnummer, Datum und Frist und formuliert den Widerspruch mit Bitte um Gutachten und Akteneinsicht.",
    related: ["widerspruch-krankenkasse", "widerspruch-jobcenter-bescheid"],
  },
];

/** Einstiegsseiten für Anzeigen (/a/<kampagne>): gleicher Inhalt wie der Ratgeber, eigener Pfad je Kampagne – Aufrufe je Kampagne ohne Cookies zählbar. */
/** Anzeigen-Einstiegsseiten (/a/<slug>): Upload zuerst, Text passend zur Suchanfrage, darunter der Ratgeber. */
export interface Campaign {
  guide: string; // Ratgeber-Slug
  h1: string;
  lead: string;
  /** Beschriftung der Foto-Fläche */
  upload: string;
  /** Beispiel, wie das Ergebnis nach dem Foto aussieht (fiktive, typische Werte) */
  example: { summary: string; checks: string[]; deadline: string };
}

export const CAMPAIGNS: Record<string, Campaign> = {
  steuer: {
    upload: "Steuerbescheid fotografieren",
    guide: "einspruch-steuerbescheid",
    h1: "Einspruch gegen den Steuerbescheid: ein Monat Zeit – so nutzen Sie sie.",
    lead: "Fotografieren Sie den Bescheid: Flinkbrief zeigt in einfachen Worten, was das Finanzamt festgesetzt hat, welche Abweichungen auffallen und bis wann der Einspruch eingehen muss. Verstehen ist kostenlos. Den Einspruch schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Das Finanzamt hat die Einkommensteuer 2025 auf 2.140 € festgesetzt. Es ergibt sich eine Nachzahlung von 612 €, fällig bis 28.11.2026.",
      checks: ["Werbungskosten wurden mit 1.230 € statt der erklärten 2.410 € angesetzt", "Fahrtkosten: 180 statt 220 Arbeitstage berücksichtigt", "Handwerkerleistungen (§ 35a EStG) fehlen in der Festsetzung"],
      deadline: "Einspruch bis 24.11.2026 (1 Monat ab Bekanntgabe)",
    },
  },
  nebenkosten: {
    upload: "Abrechnung fotografieren",
    guide: "widerspruch-nebenkostenabrechnung",
    h1: "Nebenkostenabrechnung prüfen: zwölf Monate Zeit für Einwendungen – die Nachzahlung nur unter Vorbehalt.",
    lead: "Fotografieren Sie die Abrechnung oder laden Sie das PDF hoch: Flinkbrief zeigt in einfachen Worten, welche Posten Sie nachprüfen sollten – Verwaltungskosten, Verteilerschlüssel, fehlende Belege. Verstehen ist kostenlos. Die Einwendung mit Bitte um Belegeinsicht schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Die Hausverwaltung rechnet für 2025 Betriebskosten von 2.318 € ab. Nach Abzug der Vorauszahlungen bleibt eine Nachzahlung von 341,60 €, fällig in 30 Tagen.",
      checks: ["Verwaltungskosten 180 € sind aufgeführt – bei Wohnraum in der Regel nicht umlagefähig", "Hausmeister 412 € nach Wohnfläche umgelegt – angesetzt sind 68 m², im Mietvertrag stehen 64 m²", "Abrechnung ging am 14.10.2026 zu – Einwendungen sind 12 Monate lang möglich"],
      deadline: "Einwendungen bis 14.10.2027, Belegeinsicht jederzeit",
    },
  },
  mahnung: {
    upload: "Mahnung fotografieren",
    guide: "mahnung-widersprechen",
    h1: "Mahnung fotografieren – sehen, was gefordert wird und wie Sie antworten.",
    lead: "Flinkbrief liest die Mahnung aus, zeigt Forderung, Absender und Frist in einfachen Worten. Kostenlos. Die Antwort – bestreiten, nachfragen oder Ratenzahlung – schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Ein Inkassobüro fordert 94,00 € für eine angeblich offene Rechnung vom März 2025 zuzüglich 48,50 € Inkassokosten, zahlbar bis 04.11.2026.",
      checks: ["Die Hauptforderung von 94,00 € wird keiner konkreten Rechnung zugeordnet", "Inkassokosten 48,50 € übersteigen die Hauptforderung um die Hälfte", "Keine Angabe, wann und wie die ursprüngliche Rechnung zugegangen sein soll"],
      deadline: "Zahlungsfrist 04.11.2026 – eine Antwort vorher stoppt weitere Kosten nicht automatisch, dokumentiert aber Ihren Widerspruch",
    },
  },
  bussgeld: {
    upload: "Bußgeldbescheid fotografieren",
    guide: "einspruch-bussgeldbescheid",
    h1: "Bußgeldbescheid fotografieren – Frist, Betrag und Punkte sofort sehen.",
    lead: "Flinkbrief liest den Bescheid aus und zeigt in einfachen Worten, was vorgeworfen wird und bis wann Einspruch möglich ist. Kostenlos. Den Einspruch schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Die Bußgeldstelle wirft eine Geschwindigkeitsüberschreitung von 21 km/h innerorts vor. Geldbuße 115 € plus 28,50 € Gebühren, 1 Punkt in Flensburg.",
      checks: ["Messung am 03.09.2026 um 17:42 Uhr, Toleranzabzug 3 km/h – Messprotokoll kann eingesehen werden", "Halter und Fahrer sind nicht identisch angegeben", "Zustellung laut Umschlag am 21.10.2026"],
      deadline: "Einspruch bis 04.11.2026 (2 Wochen ab Zustellung)",
    },
  },
  jobcenter: {
    upload: "Bescheid fotografieren",
    guide: "widerspruch-jobcenter-bescheid",
    h1: "Jobcenter-Bescheid fotografieren – verstehen, was entschieden wurde.",
    lead: "Flinkbrief liest den Bescheid aus und zeigt in einfachen Worten, was bewilligt, abgelehnt oder zurückgefordert wird und bis wann Widerspruch möglich ist. Kostenlos. Den Brief schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Das Jobcenter fordert 486,20 € für Juli bis September 2026 zurück, weil Einkommen nachträglich angerechnet wurde.",
      checks: ["Angerechnet wurde ein Bruttoeinkommen von 1.120 € – Freibeträge sind im Bescheid nicht ausgewiesen", "Der Rückforderungszeitraum endet am 30.09., der Bescheid nennt aber Zahlungen bis 15.10.", "Gefordert wird Rückzahlung in einer Summe bis 20.11.2026"],
      deadline: "Widerspruch bis 23.11.2026 (1 Monat ab Bekanntgabe)",
    },
  },
  krankenkasse: {
    upload: "Bescheid fotografieren",
    guide: "widerspruch-krankenkasse",
    h1: "Bescheid der Krankenkasse fotografieren – Ablehnung und Frist sofort verstehen.",
    lead: "Flinkbrief liest den Bescheid aus und zeigt in einfachen Worten, was abgelehnt wurde, womit die Kasse das begründet und bis wann Widerspruch möglich ist. Kostenlos. Den Widerspruch schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Die Krankenkasse lehnt die beantragte Reha-Maßnahme ab und verweist auf ein Gutachten des Medizinischen Dienstes vom 02.10.2026.",
      checks: ["Das Gutachten wurde nach Aktenlage erstellt – eine Untersuchung fand nicht statt", "Der Antrag ging am 28.08.2026 ein, die Entscheidung erst am 16.10.2026 (7 Wochen)", "Das Gutachten selbst liegt dem Bescheid nicht bei"],
      deadline: "Widerspruch bis 19.11.2026 (1 Monat ab Bekanntgabe)",
    },
  },
  rente: {
    upload: "Bescheid fotografieren",
    guide: "widerspruch-rentenversicherung",
    h1: "Rentenbescheid fotografieren – Zeiten, Beträge und Frist sofort sehen.",
    lead: "Flinkbrief liest den Bescheid aus und zeigt in einfachen Worten, was die Rentenversicherung festgestellt hat und bis wann Widerspruch möglich ist. Kostenlos. Den Widerspruch schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Die Rentenversicherung lehnt die Rente wegen Erwerbsminderung ab: Nach dem Gutachten bestehe ein Leistungsvermögen von sechs Stunden täglich.",
      checks: ["Das Gutachten stammt vom 09.09.2026, der behandelnde Arzt wurde laut Bescheid nicht befragt", "Die Wartezeit von 5 Jahren ist laut Versicherungsverlauf erfüllt", "Der Bescheid nennt keine Reha-Prüfung vor der Ablehnung"],
      deadline: "Widerspruch bis 21.11.2026 (1 Monat ab Bekanntgabe)",
    },
  },
  rundfunk: {
    upload: "Bescheid fotografieren",
    guide: "widerspruch-rundfunkbeitrag",
    h1: "Festsetzungsbescheid fotografieren – Zeitraum, Betrag und Frist sofort sehen.",
    lead: "Flinkbrief liest den Bescheid des Beitragsservice aus und zeigt in einfachen Worten, welcher Zeitraum berechnet wird und bis wann Widerspruch möglich ist. Kostenlos. Den Widerspruch schicken wir auf Wunsch per Post, ab 4,99 €.",
    example: {
      summary: "Der Beitragsservice setzt 220,32 € für Januar bis Dezember 2025 fest, zuzüglich 8,00 € Säumniszuschlag.",
      checks: ["Für die Wohnung war bereits ein Mitbewohner angemeldet (Beitragsnummer im Schreiben genannt)", "Der Zeitraum beginnt am 01.01.2025, der Einzug war laut Meldebescheinigung am 01.04.2025", "Der Säumniszuschlag wird ohne vorherige Mahnung erhoben"],
      deadline: "Widerspruch bis 25.11.2026 (1 Monat ab Bekanntgabe)",
    },
  },
};

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
