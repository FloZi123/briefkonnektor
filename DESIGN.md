---
name: Flinkbrief
description: Bescheid fotografieren, verstehen, Antwort per Post – der Brief ist das Objekt.
colors:
  paper-000: "#eef1f6"
  paper-100: "#ffffff"
  paper-200: "#e4e8ef"
  line: "#d4d9e3"
  line-strong: "#aeb6c6"
  ink: "#0f1b3d"
  ink-muted: "#5b6680"
  ink-faint: "#8a93a8"
  flink: "#2f5bea"
  flink-ink: "#ffffff"
  flink-soft: "#e4ebff"
  flink-hover: "#2246c7"
  flink-deep: "#1a3bb0"
  marker: "#fff1a8"
  marker-ink: "#5a4500"
  zugestellt: "#0e8a5f"
  zugestellt-soft: "#dff4ea"
  frist: "#d9480f"
  frist-soft: "#ffede3"
  fehler: "#b42318"
  fehler-soft: "#fde9e7"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 6vw, 46px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 3vw, 28px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
rounded:
  sheet: "4px"
  s: "6px"
  m: "10px"
  l: "14px"
  pill: "999px"
spacing:
  gutter: "16px"
  section: "36px"
  container: "1080px"
  flow: "520px"
components:
  button-primary:
    backgroundColor: "{colors.flink}"
    textColor: "{colors.flink-ink}"
    rounded: "{rounded.m}"
    padding: "0 20px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.flink-hover}"
  button-secondary:
    backgroundColor: "{colors.paper-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "0 20px"
    height: "52px"
  input:
    backgroundColor: "{colors.paper-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "10px 12px"
    height: "48px"
  card:
    backgroundColor: "{colors.paper-100}"
    rounded: "{rounded.l}"
    padding: "16px 18px"
  kind-link:
    backgroundColor: "{colors.paper-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "11px 14px"
  dropzone:
    backgroundColor: "{colors.flink}"
    textColor: "{colors.flink-ink}"
    rounded: "{rounded.l}"
    padding: "20px 16px"
  fristbox:
    backgroundColor: "{colors.frist-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "12px 14px"
  mark:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.marker-ink}"
    rounded: "2px"
    padding: "0 3px"
---

# Design System: Flinkbrief

<!-- Quelle der Wahrheit für Werte ist web/app/globals.css (:root, Light + Dark). Diese Datei beschreibt sie. design/design-system/tokens.json ist ein älterer Stand (Sora/Source Sans 3, andere Hex-Werte) und wird hier nicht übernommen. -->

## Overview

**Creative North Star: "Das Blatt auf dem Tisch"**

Flinkbrief zeigt sein Produkt als das, was es ist: ein Blatt Papier. Seiten liegen als weiße Blätter auf kühlem Papiergrau, der Beispiel-Bescheid ist ein echt gesetzter Brief mit Falzmarken, und das Einzige, was schmückt, ist ein gelber Textmarker – so wie man selbst die wichtigen Stellen auf einem Bescheid anstreicht.

Alles andere tritt zurück. Tintenblau statt Schwarz, ein einziges Markenblau für die eine Handlung pro Ansicht, Zustandsfarben nur für echte Zustände. Die Dichte ist ruhig und mobil gedacht: große Tippflächen, kurze Zeilen, eine klare Reihenfolge von oben nach unten. Gestresste Menschen mit einer Frist sollen sofort sehen, was zu tun ist.

Die Bedienelemente sind griffig und ruhig: deutliche Rahmen, kaum Schatten, sofortiges Druck-Feedback, kein Effekt um seiner selbst willen.

**Key Characteristics:**
- Papier als Material: weiße Blätter (`paper-100`) auf Papiergrau (`paper-000`).
- Marker-Gelb als einziger Schmuck, nur auf Inhalten, die erkannt oder wichtig sind.
- Ein Markenblau, eine Primärhandlung pro Ansicht.
- Frist in Orange – Handlungsbedarf, kein Fehler.
- Light und Dark gleichwertig gepflegt.

## Colors

Drei strikt getrennte Rollen: Grund und Tinte, eine Marke, Zustände.

### Primary
- **Flink-Blau** (`flink`): Primärbutton, Kamera-Fläche, Links, aktive Auswahl, Logo-Pfeil. `flink-hover` für Hover, `flink-deep` für Text auf `flink-soft`, `flink-soft` für ausgewählte Optionen und Fokus-Höfe.

### Secondary
- **Textmarker-Gelb** (`marker` mit `marker-ink`): Hervorhebung erkannter Inhalte im Beispielbrief und Platzhalter im Entwurf. Bleibt auch im Dark Mode hellgelb auf dem hellen Blatt.

### Tertiary
- **Zugestellt-Grün** (`zugestellt`, `zugestellt-soft`): Erfolg, erkannt, bezahlt, Häkchen.
- **Frist-Orange** (`frist`, `frist-soft`): Fristen, Platzhalter, Handlungsbedarf.
- **Fehler-Rot** (`fehler`, `fehler-soft`): nur echte Fehler und Unzustellbarkeit.

### Neutral
- **Papiergrau** (`paper-000`): Seitenhintergrund.
- **Blattweiß** (`paper-100`): Karten, Felder, Blätter.
- **Abgesetztes Grau** (`paper-200`): ruhige Flächen wie der Ehrlichkeits-Block.
- **Linie** (`line`, `line-strong`): Rahmen und Feldränder.
- **Tintenblau** (`ink`, `ink-muted`, `ink-faint`): Text in drei Stufen. `ink-faint` nur für Platzhalter, nie für Lesetext.

### Named Rules
**The One Voice Rule.** Pro Ansicht genau eine Fläche in `flink` – die Handlung, die als Nächstes kommt.
**The Real State Rule.** Grün, Orange und Rot erscheinen nur für echte Zustände, nie als Dekoration.
**The Marker Rule.** Gelb markiert Inhalt, nie Rahmen, Flächen oder Buttons.

## Typography

**Display Font:** Bricolage Grotesque (mit ui-sans-serif, system-ui)
**Body Font:** IBM Plex Sans (mit ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono

**Character:** Eine eigenwillige, warme Grotesk für Überschriften trifft auf eine sachliche, gut lesbare Textschrift; Zahlen, Aktenzeichen und Preise bekommen eine Monospace, damit man sie vergleichen kann.

### Hierarchy
- **Display** (800, clamp(32px, 6vw, 46px), 1.02): Hero-Headline, eine pro Seite, max. 15ch auf Desktop.
- **Headline** (700, clamp(22px, 3vw, 28px), 1.1): Abschnittsüberschriften.
- **Title** (700, 16–18px, 1.25): Schritt-, Karten- und Gruppentitel.
- **Body** (400, 16px, 1.55): Fließtext; Lead 17px in `ink-muted`, max. 48–56ch.
- **Label** (500, 14px): Feldbeschriftungen, Zweitzeilen. Kleiner als 13px nur in der Brief-Miniatur.

### Named Rules
**The 14px Floor Rule.** Lesbarer Text ist mindestens 14px, Hilfstext mindestens 13px. Ausnahme ist nur der Brief im Brief (Demo-Blatt), der als Abbild gemeint ist.

## Layout

Mobil zuerst, eine Spalte mit 16px Seitenrand (inkl. Safe-Area). Startseite und Ratgeber laufen in einem 1080px-Container, der Bestellflow in einer schmalen 520px-Spalte wie eine App. Abschnitte trennt Luft (rund 36px), nicht Linien. Ab 720px werden Schritte, Briefarten und Preise dreispaltig, ab 900px steht der Hero zweispaltig (Text 7fr, Blatt 6fr). Bedienelemente sind mindestens 48px, Buttons 52px hoch und mobil volle Breite.

## Elevation & Depth

Flach im Fluss, Tiefe nur für Papier. Karten und Felder haben einen Rahmen, keinen Schatten. Schatten bekommen nur Dinge, die wie ein Blatt auf dem Tisch liegen oder darüber schweben: die Briefvorschau und Notizzettel am Demo-Blatt. Ausgewählte Elemente bekommen statt Schatten einen 3px-Hof in `flink-soft`.

### Shadow Vocabulary
- **Blatt** (`box-shadow: 0 1px 0 rgba(15,27,61,.06), 0 10px 30px -12px rgba(15,27,61,.25)`): Briefvorschau, Demo-Bescheid.
- **Zettel** (`box-shadow: 0 1px 2px rgba(15,27,61,.05), 0 6px 20px -8px rgba(15,27,61,.12)`): Notizen am Blatt, angefangener Brief, Ratgeber-CTA.

### Named Rules
**The Paper Only Rule.** Schatten heißt „liegt als Papier darauf“. Was kein Papier ist, wirft keinen Schatten.

## Shapes

Papier hat fast scharfe Ecken (4px), Bedienelemente sind weich gerundet (10px), größere Flächen und Karten etwas runder (14px), Status-Pills ganz rund. Rahmen sind 1px `line`, auswählbare Elemente 1,5px. Hinweisboxen tragen links eine 3px-Kante in ihrer Zustandsfarbe.

## Components

### Buttons
- **Shape:** weich gerundet (10px), 52px hoch, mobil volle Breite.
- **Primary:** `flink` mit `flink-ink`, 600er Schnitt.
- **Hover / Focus:** Hover nur auf Zeigegeräten nach `flink-hover`; Fokus 2px Outline in `focus` mit 2px Abstand; Druck 1px nach unten.
- **Secondary:** Blattweiß mit `line-strong`-Rahmen, Hover-Rahmen `ink`. Link-Button unterstrichen in `flink`.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** `paper-100` auf `paper-000`.
- **Shadow Strategy:** keiner (siehe Elevation); hervorgehobene Karte mit `flink`-Rahmen und 3px `flink-soft`-Hof.
- **Border:** 1px `line`, Hover `ink`.
- **Internal Padding:** 16–20px.

### Inputs / Fields
- **Style:** 48px, 1px `line-strong`, 10px Radius, Blattweiß, 16px Text.
- **Focus:** Rahmen `flink` plus 3px `flink-soft`-Hof.
- **Error:** `errorbox` in `fehler-soft` mit roter Kante.

### Navigation
- Kopfzeile mit Logo links und einem ruhigen Textlink „Meine Briefe“ in `ink-muted` rechts. Im Flow ersetzt die Schrittleiste (fünf Segmente, Schrittname in Worten) die Navigation.

### Kamera-Fläche (Signature)
Die eine große blaue Fläche der Startseite: 176px hoch, `flink`, Kamera-Kreis, Titel in Display-Schrift. Sie ist die Primärhandlung der Startseite.

### Beispiel-Bescheid (Signature)
Ein gesetzter Bescheid auf Blattweiß, leicht gedreht (−1,2°), mit Falzmarken und Marker-Hervorhebungen; Notizzettel in `ink` bzw. `flink` zeigen, was erkannt wurde. Mobil stehen die Zettel als Reihe unter dem Blatt.

### Fristbox
Orange Hinweisbox mit Uhr-Icon und 3px-Kante; steht immer über dem Formular.

## Do's and Don'ts

### Do:
- **Do** nur Tokens aus `web/app/globals.css` verwenden und Light und Dark gemeinsam pflegen.
- **Do** genau eine `flink`-Fläche pro Ansicht setzen.
- **Do** Zahlen, Aktenzeichen und Preise in JetBrains Mono setzen.
- **Do** Hover nur in `@media (hover: hover) and (pointer: fine)` definieren und Druck-Feedback per `scale(0.98)` geben.
- **Do** Text mindestens 4,5:1 gegen seinen Grund halten (WCAG 2.2 AA).

### Don't:
- **Don't** neue Farben, Schriften, Radien oder Schatten einführen.
- **Don't** Farbverläufe, Glows, Karten in Karten oder Bounce-Easings verwenden.
- **Don't** Stock- oder Archivfotos zeigen – das Produkt ist das Blatt Papier.
- **Don't** Gelb für Flächen, Buttons oder Rahmen verwenden.
- **Don't** Lesetext unter 14px setzen (außer im Demo-Blatt).
