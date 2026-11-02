/**
 * Vorprüfung und Verkleinerung von Uploads im Browser.
 * - PDF: nur Typ/Größe prüfen
 * - Bilder: auf max. 2000 px verkleinern und als JPEG neu kodieren (kleiner, schneller; HEIC vom iPhone wird dabei
 *   konvertiert, wenn der Browser es dekodieren kann – Safari kann das)
 */
/** Obergrenze für das, was tatsächlich an /api/extract geschickt wird: Vercel nimmt pro Anfrage maximal 4,5 MB an (sonst 413 vor unserem Code). */
export const MAX_SEND = 4 * 1024 * 1024;
/** Bilder dürfen größer sein – sie werden vor dem Senden verkleinert. */
export const MAX_UPLOAD = 25 * 1024 * 1024;
const MAX_EDGE = 2000;

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

const mb = (n: number) => (n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0).replace(".", ",");

/** Vorprüfung vor dem Verkleinern: Typ und grobe Größe. PDFs lassen sich im Browser nicht verkleinern, daher gilt für sie die Sendegrenze sofort. */
export function validateFile(file: File): string | null {
  if (file.size === 0) return "Die Datei ist leer. Bitte eine andere Datei wählen.";
  const isPdf = isPdfFile(file);
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  if (!isPdf && !isImage) return "Bitte ein Foto (JPG, PNG, HEIC) oder ein PDF hochladen.";
  if (isPdf && file.size > MAX_SEND) return `Das PDF ist ${mb(file.size)} MB groß – möglich sind 4 MB. Am einfachsten: die Seiten mit dem Handy fotografieren, oder das PDF in kleinerer Auflösung speichern.`;
  if (file.size > MAX_UPLOAD) return `Die Datei ist ${mb(file.size)} MB groß – bitte ein normales Foto verwenden, keinen Scan in voller Auflösung.`;
  return null;
}

/** Prüfung nach dem Verkleinern – greift, wenn ein Bild nicht verkleinert werden konnte (z. B. HEIC in Chrome) und zu groß bleibt. */
export function validatePrepared(file: File): string | null {
  if (file.size > MAX_SEND) return `Das Foto ist auch nach dem Verkleinern ${mb(file.size)} MB groß – möglich sind 4 MB. Bitte als JPG speichern oder ein neues Foto mit der Kamera aufnehmen.`;
  return null;
}

/** Bild verkleinern → JPEG. Gibt bei Fehlschlag (z. B. HEIC in Chrome) die Originaldatei zurück. */
export async function prepareFile(file: File): Promise<File> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (isPdf) return file;
  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.86));
    if (!blob || blob.size === 0) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    } catch {
      /* Fallback unten */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("decode"));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
