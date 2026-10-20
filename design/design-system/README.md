# Flinkbrief

**Richtig geschrieben. Nachweisbar angekommen.**

Flinkbrief hilft Privatpersonen, einen Brief zu schreiben, den sie heute noch brauchen: Widerspruch gegen einen Bescheid, Mängelanzeige an den Vermieter, Mahnung, Beschwerde. Bescheid fotografieren, Entwurf prüfen, mit dem Finger unterschreiben, fertig. Wir drucken und liefern bei der Deutschen Post ein – oder geben das PDF zum Selbstdrucken.

Dieses Design-System ist die Referenz für Website, Bestell-Flow, E-Mails und PDF-Briefbogen.

## Wer uns benutzt

Menschen mit einem Brief in der Hand und einer Frist im Nacken. Sie sind nicht technikbegeistert, sondern unter Druck. Sie wollen keine KI, sie wollen, dass es stimmt und ankommt. Deshalb:

- **Erst beruhigen, dann handeln.** Jede Ansicht sagt zuerst, was als Nächstes passiert.
- **Keine Fachsprache ohne Übersetzung.** "Widerspruch" ja, aber mit "gegen den Bescheid vom …" daneben.
- **Fristen sind das Wichtigste auf dem Bildschirm.** Sie bekommen die Farbe `frist` und stehen oben.
- **Nichts passiert ohne Freigabe.** Versand- und Zahlungsschritte sind unübersehbar und bestätigen zurück.

## Stimme

Sie-Form, kurze Sätze, aktiv. Wir sagen, was wir tun ("Wir lesen Behörde und Aktenzeichen aus dem Foto"), nicht was die Technik kann. Kein "KI" im Vordergrund – "automatisch erkannt" reicht. Keine Ausrufezeichen, kein Marketing-Englisch, keine Emojis.

Beispiele:

| statt | besser |
| --- | --- |
| Powered by AI | Wird automatisch erkannt |
| Jetzt durchstarten! | Bescheid fotografieren |
| Oops, da ist was schiefgelaufen | Das Foto war zu unscharf. Bitte noch einmal aufnehmen, am besten bei Tageslicht. |
| Rechtssicher | Nach Ihren Angaben formuliert – keine Rechtsberatung |

Der Hinweis "Formulierungshilfe, keine Rechtsberatung" steht bei jedem Entwurf. Erfolgsaussichten werden nie versprochen.

## Name und Logo

Der Name wird **Flinkbrief** geschrieben – ein Wort, großes F. In der Wortmarke steht er klein: `flink` in `ink`, `brief` in `flink`-Blau. Das Zeichen ist ein Kuvert, aus dessen rechter unterer Ecke ein blauer Pfeil ausbricht; drei Linien links stehen für Tempo. Lesart: *Der Brief ist schon unterwegs.*

Dateien in `assets/Logos/`:

- `flinkbrief-lockup.svg` – Zeichen + Wortmarke, Standard auf hellem Grund
- `flinkbrief-lockup-inverse.svg` – auf `ink` oder dunklen Flächen
- `flinkbrief-mark.svg` / `flinkbrief-mark-inverse.svg` – nur das Zeichen
- `flinkbrief-mark-tile.svg` – Zeichen weiß auf blauer Kachel (App-Icon, Social)
- `flinkbrief-favicon.svg` – Kuvert mit Pfeil ohne Tempo-Linien, für 16–32 px
- `flinkbrief-wordmark.svg` – nur der Schriftzug

Regeln: Mindesthöhe des Zeichens 24 px, der Wortmarke 20 px. Schutzraum = Höhe des Kuverts. Nicht drehen, nicht verzerren, keine anderen Farben als `ink`/`flink` bzw. Weiß/`flink`-Hell. Die Wortmarke wird nie neu gesetzt – immer die SVG verwenden.

## Farbe

Drei Rollen, strikt getrennt:

1. **Grund und Tinte** – `paper-000/100/200`, `line`, `ink`, `ink-muted`. Warmes Papierweiß statt reinem Weiß, Tintenblau statt Schwarz. Das ist 90 % jeder Ansicht.
2. **Marke** – `flink` und `flink-soft`. Ein Blau, das Verlässlichkeit sagt (Behörde, Bank) und trotzdem frisch ist. Primärbutton, Links, aktive Auswahl, der Pfeil im Logo. Pro Ansicht ein Primärbutton.
3. **Zustand** – `zugestellt` (grün), `frist` (orange), `fehler` (rot), jeweils mit `-soft`-Hintergrund. Nur für echte Zustände, nie als Schmuck. Frist ist orange, nicht rot: Eine Frist ist Handlungsbedarf, kein Fehler.

Kontrast: Alle Textfarben erreichen 4,5:1 auf ihrem Grund in beiden Themes (`ink-muted` auf `paper-000`: 4,6:1). Zustände unterscheiden sich in Helligkeit, nicht nur im Farbton.

## Typografie

- **Sora** (Display, 700/800) für Headlines und Screen-Titel. Geometrisch, freundlich, deutlich – auch für Leute, die Behördenbriefe sonst meiden.
- **Source Sans 3** (Text, 400/600) für alles Laufende. Große x-Höhe, gut lesbar auf dem Handy bei 16 px.
- **JetBrains Mono** (Daten, 500) für Aktenzeichen, Sendungsnummern, Preise, Schritt-Zähler. Alles, was der Nutzer abtippen oder vergleichen muss.

Alle drei von Google Fonts laden (`display=swap`), Fallback-Stacks stehen in `type.families`. Fließtext 16 px, nie kleiner als 14 px; Labels 12 px nur in Versalien mit Laufweite.

## Abstand, Radius, Fläche

Achterraster: `space-4` (16 px) ist der Grundabstand mobil, `space-6`/`space-8` auf Desktop. Buttons und Felder mindestens 48 px hoch (Daumen). Radien: 10 px für Bedienelemente, 14 px für Karten, Pill für Status.

Karten im Fluss haben einen Rahmen (`line`), keinen Schatten. Schatten (`shadow-card`) nur für die Briefvorschau, damit sie wie ein Blatt auf dem Tisch liegt.

## Bausteine

- **Button** – Primär (`flink`), Sekundär (Rahmen), Textlink. Immer volle Breite auf dem Handy.
- **Fristbox** – orange Hinweisbox mit Uhr-Icon, Datum des Bescheids und letztem Tag der Frist. Steht über dem Formular, nicht darunter.
- **Statuspill** – Entwurf / In Produktion / Eingeliefert / Zugestellt / Unzustellbar, in den Zustandsfarben.
- **Option** – auswählbare Karte mit Radio, Titel, Preis rechts, Hinweis darunter (Versandart, Briefart).
- **Briefvorschau** – A4-Miniatur mit `shadow-card`, zeigt Absender, Empfänger, Betreff und die ersten Zeilen.
- **Schrittzähler** – `mono`, "Schritt 2 von 5", links oben in jedem Flow-Screen neben dem Zurück-Pfeil.

## Icons

Linien-Icons, 2 px Strich, runde Enden, 24 px Raster (Lucide-Stil). Farbe erbt vom Text. Kein Icon ohne Text daneben, außer Zurück und Schließen (dann `aria-label`).

## Briefbogen (PDF)

DIN 5008 Form B. Absender im Kopf, Rücksendeangabe über dem Anschriftfeld, Falzmarken. Schrift im Brief: Helvetica/Arial (Standard-PDF-Fonts), nicht die Web-Schriften – der Brief soll wie ein normaler Brief aussehen, nicht wie Werbung. Kein Logo auf Briefen, die der Kunde als Privatperson verschickt.
