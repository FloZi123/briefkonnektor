import { Logo } from "@/components/ui";
export const metadata = { title: "AGB" };
export default function Page() {
  return (
    <main className="screen" style={{ maxWidth: 720 }}>
      <div className="screen-head"><Logo /></div>
      <h1 style={{ fontSize: 28, paddingTop: 16 }}>AGB</h1>
      <p className="muted" style={{ paddingTop: 12 }}>[Text folgt – vor dem Launch durch die finale Fassung ersetzen.]</p>
    </main>
  );
}
