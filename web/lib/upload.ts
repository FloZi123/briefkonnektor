/**
 * Vorprüfung und Verkleinerung von Uploads im Browser.
 * - PDF: nur Typ/Größe prüfen
 * - Bilder: auf max. 2000 px verkleinern und als JPEG neu kodieren (kleiner, schneller; HEIC vom iPhone wird dabei
 *   konvertiert, wenn der Browser es dekodieren kann – Safari kann das)
 */
export const MAX_UPLOAD = 12 * 1024 * 1024;
const MAX_EDGE = 2000;

export function validateFile(file: File): string | null {
  if (file.size === 0) return "Die Datei ist leer. Bitte eine andere Datei wählen.";
  if (file.size > MAX_UPLOAD) return `Die Datei ist ${(file.size / 1024 / 1024).toFixed(0)} MB groß – erlaubt sind 12 MB. Bitte ein Foto statt eines Scans in voller Auflösung verwenden.`;
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  if (!isPdf && !isImage) return "Bitte ein Foto (JPG, PNG, HEIC) oder ein PDF hochladen.";
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
