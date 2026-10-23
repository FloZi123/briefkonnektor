import { ogImage, OG_SIZE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Flinkbrief – Bescheid fotografieren, Antwort per Post";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage("Bescheid bekommen? Die Antwort ist in fünf Minuten in der Post.", "Brief fotografieren, verstehen, Widerspruch formulieren lassen, mit dem Finger unterschreiben – Flinkbrief verschickt ihn per Post.");
}
