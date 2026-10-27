import { berechneFrist, feiertage, plusMonate, bekanntgabe, naechsterWerktag } from "../lib/frist";

const d = (s: string) => { const [t, m, j] = s.split(".").map(Number); return new Date(j, m - 1, t); };
const f = (x: Date) => x.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const check = (name: string, got: string, want: string) => { if (got !== want) throw new Error(`${name}: ${got} ≠ ${want}`); console.log("ok", name, got); };

// Feiertage 2026: Ostern 05.04.2026 → Karfreitag 03.04., Ostermontag 06.04., Himmelfahrt 14.05., Pfingstmontag 25.05.
const ft = feiertage(2026).map(f);
check("Karfreitag 2026", ft[1], "03.04.2026");
check("Pfingstmontag 2026", ft[5], "25.05.2026");

// § 188 Abs. 3 BGB: 31.01. + 1 Monat → 28.02. (2026 kein Schaltjahr)
check("Monatsende", f(plusMonate(d("31.01.2026"), 1)), "28.02.2026");

// Bekanntgabe: Bescheid Mi 14.10.2026 → +4 = So 18.10. → Mo 19.10.2026
check("Bekanntgabe Wochenende", f(bekanntgabe(d("14.10.2026")).tag), "19.10.2026");
// vor 2025: 3 Tage
check("Bekanntgabe 2024", f(bekanntgabe(d("05.03.2024")).tag), "08.03.2024");

// Widerspruch: Bescheid 14.10.2026 per Post → Bekanntgabe 19.10. → Ende 19.11.2026 (Do)
let r = berechneFrist({ art: "widerspruch", datum: d("14.10.2026"), zugang: "post" });
check("Widerspruch Ende", f(r.ende), "19.11.2026");
if (!r.fiktion) throw new Error("Fiktion erwartet");

// Steuer: Bescheid 01.12.2026 → +4 = Sa 05.12. → Mo 07.12. → +1 Monat = 07.01.2027 (Do)
r = berechneFrist({ art: "steuer", datum: d("01.12.2026"), zugang: "post" });
check("Steuer Ende", f(r.ende), "07.01.2027");

// Steuer mit Ende auf Feiertag: Bekanntgabe so wählen, dass Ende 01.05.2027 (Sa) → 03.05.2027 (Mo)
r = berechneFrist({ art: "steuer", datum: d("01.04.2027"), zugang: "erhalten" });
check("Steuer Ende Feiertag/Wochenende", f(r.ende), "03.05.2027");
if (!r.verschoben) throw new Error("Verschiebung erwartet");

// Bußgeld: Zustellung Fr 02.10.2026 → +14 = Fr 16.10.2026
r = berechneFrist({ art: "bussgeld", datum: d("02.10.2026"), zugang: "zustellung" });
check("Bußgeld Ende", f(r.ende), "16.10.2026");
if (r.fiktion) throw new Error("keine Fiktion bei Zustellung");

// Bußgeld: Zustellung Sa 19.09.2026 → +14 = Sa 03.10. (Feiertag + Wochenende) → Mo 05.10.2026
r = berechneFrist({ art: "bussgeld", datum: d("19.09.2026"), zugang: "zustellung" });
check("Bußgeld Ende Feiertag", f(r.ende), "05.10.2026");

// Mahnbescheid: Zustellung 10.12.2026 → 24.12.2026 (Do, kein Feiertag)
r = berechneFrist({ art: "mahnbescheid", datum: d("10.12.2026"), zugang: "zustellung" });
check("Mahnbescheid Ende", f(r.ende), "24.12.2026");

// Nebenkosten: Zugang 29.02.2028 → 28.02.2029
r = berechneFrist({ art: "nebenkosten", datum: d("29.02.2028"), zugang: "erhalten" });
check("Nebenkosten Ende", f(r.ende), "28.02.2029");

// nächster Werktag über Weihnachten: Fr 25.12.2026 → Mo 28.12.2026
check("Werktag Weihnachten", f(naechsterWerktag(d("25.12.2026"))), "28.12.2026");
console.log("alle Fristtests bestanden");

// Flow-Helfer nutzen dieselbe Logik
import { widerspruchsfrist, einspruchsfrist, steuerfrist } from "../lib/dates";
check("flow widerspruch", widerspruchsfrist("14.10.2026") ?? "", "19.11.2026");
check("flow steuer", steuerfrist("01.12.2026") ?? "", "07.01.2027");
// Bußgeld: Bescheid 16.09.2026 → Zustellung angenommen 19.09. → +14 = Sa 03.10. (Feiertag) → Mo 05.10.2026
check("flow bussgeld", einspruchsfrist("16.09.2026") ?? "", "05.10.2026");
console.log("Flow-Fristen konsistent");
