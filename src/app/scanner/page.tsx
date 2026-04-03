// src/app/scanner/page.tsx
"use client";

import { useState } from "react";

export default function ScannerPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setScanning(true);

      // Simulierte KI-Scan (später echte API)
      setTimeout(() => {
        setScanning(false);
        setResult({
          name: "Gardevoir ex",
          set: "Scarlet & Violet",
          number: "245",
          price: "189,90 €",
          confidence: "98%"
        });
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-10 pt-12">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="uppercase text-xs tracking-widest text-[var(--tx-3)] mb-3">GEMINI FLASH POWERED</div>
          <h1 className="text-5xl font-light tracking-[-2px] mb-4">Foto machen.<br />Preis wissen.</h1>
          <p className="text-[var(--tx-2)] text-lg">
            Halte deine Karte vor die Kamera oder lade ein Foto hoch.<br />
            Die KI erkennt sie in Sekunden.
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto">
          <div 
            className={`border-2 border-dashed rounded-3xl h-[420px] flex flex-col items-center justify-center transition-all duration-300
              ${isDragging ? "border-[var(--g)] bg-[var(--g06)]" : "border-[var(--br-2)] hover:border-[var(--g18)]"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadedImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded card" 
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" 
                />
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-transparent border-t-[var(--g)] rounded-full animate-spin mb-4"></div>
                      <div className="text-[var(--g)] text-sm font-medium">KI analysiert Karte...</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--g06)] flex items-center justify-center text-4xl">
                  📸
                </div>
                <div className="text-lg font-medium mb-2">Karte hier ablegen</div>
                <div className="text-[var(--tx-3)] text-sm mb-8">oder klicken zum Hochladen</div>
                <label className="cursor-pointer px-8 py-4 bg-[var(--g)] text-black font-medium rounded-3xl hover:bg-[#f5c16e] transition-colors">
                  Datei auswählen
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-10 bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10">
              <div className="text-xs uppercase tracking-widest text-[var(--tx-3)] mb-4">ERGEBNIS</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-medium">{result.name}</div>
                  <div className="text-[var(--tx-3)] mt-1">{result.set} • #{result.number}</div>
                </div>
                <div className="text-right">
                  <div className="price text-4xl">{result.price}</div>
                  <div className="text-xs text-emerald-400 mt-1">KI-Konfidenz: {result.confidence}</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}