/**
 * pokédax Perceptual Hash Library
 * Runs on Vercel (pure TypeScript + sharp WebAssembly)
 * No native binaries needed.
 *
 * Implements: pHash (DCT-based), dHash (difference hash), aHash (average hash)
 * All produce 64-bit hashes as binary strings for Hamming-Distance matching.
 */

import sharp from "sharp";

export interface ImageHashes {
  phash: string;  // 64-bit perceptual hash (DCT)
  dhash: string;  // 64-bit difference hash
  ahash: string;  // 64-bit average hash
  combined: string; // All three concatenated for multi-hash matching
}

/** Fetch image from URL and return raw buffer */
async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Preprocess image: resize, grayscale, normalize */
async function preprocessImage(
  input: Buffer | string,
  size: number = 32
): Promise<{ pixels: number[]; width: number; height: number }> {
  const src = typeof input === "string" ? await fetchImage(input) : input;

  const { data } = await sharp(src)
    .resize(size, size, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    pixels: Array.from(data),
    width: size,
    height: size,
  };
}

/** DCT-based Perceptual Hash (pHash) - most robust */
export async function computePhash(input: Buffer | string): Promise<string> {
  const SIZE = 32;
  const SMALL = 8;
  const { pixels } = await preprocessImage(input, SIZE);

  // Apply 2D DCT
  const dct: number[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
  for (let u = 0; u < SIZE; u++) {
    for (let v = 0; v < SIZE; v++) {
      let sum = 0;
      for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
          sum += pixels[x * SIZE + y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * SIZE)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * SIZE));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      dct[u][v] = (2 / SIZE) * cu * cv * sum;
    }
  }

  // Take top-left 8x8 (low frequencies), skip DC component
  const lowFreq: number[] = [];
  for (let u = 0; u < SMALL; u++) {
    for (let v = 0; v < SMALL; v++) {
      if (u === 0 && v === 0) continue;
      lowFreq.push(dct[u][v]);
    }
  }

  const median = [...lowFreq].sort((a, b) => a - b)[Math.floor(lowFreq.length / 2)];
  return lowFreq.map(v => (v > median ? "1" : "0")).join("");
}

/** Difference Hash (dHash) - fast, good for near-duplicates */
export async function computeDhash(input: Buffer | string): Promise<string> {
  const { pixels } = await preprocessImage(input, 9); // 9x8 = 72 pixels → 64 differences
  let hash = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = pixels[row * 9 + col];
      const right = pixels[row * 9 + col + 1];
      hash += left > right ? "1" : "0";
    }
  }
  return hash;
}

/** Average Hash (aHash) - fastest, good for thumbnails */
export async function computeAhash(input: Buffer | string): Promise<string> {
  const { pixels } = await preprocessImage(input, 8);
  const avg = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  return pixels.map(v => (v >= avg ? "1" : "0")).join("");
}

/** Compute all hashes at once */
export async function computeAllHashes(input: Buffer | string): Promise<ImageHashes> {
  const [phash, dhash, ahash] = await Promise.all([
    computePhash(input),
    computeDhash(input),
    computeAhash(input),
  ]);
  return { phash, dhash, ahash, combined: phash + dhash + ahash };
}

/** Hamming distance between two binary hash strings */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 999;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

/** Confidence score from Hamming distance (0-100) */
export function hashConfidence(dist: number, hashLength: number = 64): number {
  return Math.round((1 - dist / hashLength) * 100 * 10) / 10;
}

/**
 * Match a query hash against a list of candidates.
 * Returns sorted by confidence descending.
 */
export function matchHashes(
  queryHash: string,
  candidates: { id: string; phash: string; name?: string }[],
  maxDistance: number = 12
): Array<{ id: string; distance: number; confidence: number; name?: string }> {
  return candidates
    .map(c => ({
      id: c.id,
      name: c.name,
      distance: hammingDistance(queryHash, c.phash),
      confidence: hashConfidence(hammingDistance(queryHash, c.phash)),
    }))
    .filter(r => r.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

/** Normalize card image for consistent hashing */
export async function normalizeCardImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(300, 420, { fit: "contain", background: { r: 0, g: 0, b: 0 } })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Calculate image quality score based on sharpness + contrast */
export async function imageQualityScore(input: Buffer): Promise<number> {
  const { data, info } = await sharp(input)
    .grayscale()
    .resize(100, 140)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data as Uint8Array);
  const mean = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  const variance = pixels.reduce((s, v) => s + (v - mean) ** 2, 0) / pixels.length;
  const std = Math.sqrt(variance);

  // Score: higher std = more contrast = better quality
  // Normalize to 0-100
  return Math.min(100, Math.round(std * 2));
}
