import { Logo } from "@/components/ui";
export const metadata = { title: "Meine Briefe" };
export default function Page() {
  return (
    <main className="screen">
      <div className="screen-head"><Logo /></div>
      <h1 style={{ fontSize: 24, paddingTop: 16 }}>Meine Briefe</h1>
      <p className="muted" style={{ paddingTop: 8 }}>Den Status Ihrer Bestellung erreichen Sie über den Link in der Bestätigungs-E-Mail. Ein Kundenkonto ist nicht nötig.</p>
    </main>
  );
}
