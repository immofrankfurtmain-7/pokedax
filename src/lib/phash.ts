/**
 * pokédax pHash Library — Pure TypeScript + sharp
 * Läuft auf Vercel (WebAssembly, keine native Binaries)
 * 
 * Implementiert: pHash (DCT), dHash (Differenz), aHash (Durchschnitt)
 * Alle produzieren 64-Bit Binär-Strings für Hamming-Distance Matching.
 */
import sharp from "sharp";

export interface ImageHashes {
  phash: string; // 64-bit DCT Hash — robustester
  dhash: string; // 64-bit Differenz Hash — schnellster
  ahash: string; // 64-bit Durchschnitts Hash — simpelster
}

/** Bild laden (URL oder Buffer) */
async function loadImage(input: Buffer | string): Promise<Buffer> {
  if (typeof input === "string") {
    const res = await fetch(input, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${input}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return input;
}

/** Bild vorverarbeiten: resize + graustufen + normalisieren */
async function preprocess(
  input: Buffer | string,
  width: number,
  height: number
): Promise<number[]> {
  const buf = await loadImage(input);
  const { data } = await sharp(buf)
    .resize(width, height, { fit: "fill" })
    .grayscale()
    .normalise() // Kontrast normalisieren → bessere Hash-Stabilität
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Array.from(data as Uint8Array);
}

/** DCT-basierter Perceptual Hash (pHash) — robustester Algorithmus */
export async function computePhash(input: Buffer | string): Promise<string> {
  const SIZE = 32;
  const KEEP = 8; // Nur 8x8 low-frequency DCT-Koeffizienten
  const pixels = await preprocess(input, SIZE, SIZE);

  // 2D DCT berechnen
  const dct: number[][] = [];
  for (let u = 0; u < SIZE; u++) {
    dct[u] = [];
    for (let v = 0; v < SIZE; v++) {
      let sum = 0;
      for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
          sum += pixels[x * SIZE + y]
            * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * SIZE))
            * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * SIZE));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      dct[u][v] = (2 / SIZE) * cu * cv * sum;
    }
  }

  // Top-left 8x8 extrahieren (ohne DC-Komponente [0][0])
  const lowFreq: number[] = [];
  for (let u = 0; u < KEEP; u++) {
    for (let v = 0; v < KEEP; v++) {
      if (u === 0 && v === 0) continue;
      lowFreq.push(dct[u][v]);
    }
  }

  // Median berechnen → Bit = 1 wenn Wert > Median
  const sorted = [...lowFreq].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return lowFreq.map(v => (v > median ? "1" : "0")).join("");
}

/** Differenz-Hash (dHash) — schnell, gut für Duplikate */
export async function computeDhash(input: Buffer | string): Promise<string> {
  // 9 Spalten × 8 Zeilen = 72 Pixel → 64 horizontale Differenzen
  const pixels = await preprocess(input, 9, 8);
  let hash = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      hash += pixels[row * 9 + col] > pixels[row * 9 + col + 1] ? "1" : "0";
    }
  }
  return hash;
}

/** Durchschnitts-Hash (aHash) — ultra-schnell, grobe Klassifikation */
export async function computeAhash(input: Buffer | string): Promise<string> {
  const pixels = await preprocess(input, 8, 8);
  const avg = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  return pixels.map(v => (v >= avg ? "1" : "0")).join("");
}

/** Alle drei Hashes auf einmal berechnen */
export async function computeAllHashes(input: Buffer | string): Promise<ImageHashes> {
  const buf = await loadImage(input);
  const [phash, dhash, ahash] = await Promise.all([
    computePhash(buf),
    computeDhash(buf),
    computeAhash(buf),
  ]);
  return { phash, dhash, ahash };
}

/** Hamming-Distance zwischen zwei Hash-Strings */
export function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 999;
  let d = 0;
  for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++;
  return d;
}

/** Konfidenz aus Hamming-Distance (0-100%) */
export function hashConfidence(dist: number, len = 64): number {
  return Math.round((1 - dist / len) * 1000) / 10;
}

/**
 * Karte normalisieren für konsistentes Hashing.
 * 800px breit, WebP Quality 82 = ~700KB-1.2MB pro Karte.
 */
export async function normalizeCardImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(800, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}

/** Bildqualitäts-Score basierend auf Schärfe/Kontrast (0-100) */
export async function imageQualityScore(input: Buffer): Promise<number> {
  const { data } = await sharp(input)
    .resize(100, 140)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = Array.from(data as Uint8Array);
  const mean = px.reduce((s, v) => s + v, 0) / px.length;
  const variance = px.reduce((s, v) => s + (v - mean) ** 2, 0) / px.length;
  return Math.min(100, Math.round(Math.sqrt(variance) * 2));
}
