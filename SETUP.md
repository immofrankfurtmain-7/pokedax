# PokeDax – Windows Setup (Schritt für Schritt)

## Das Problem
Der Fehler "next ist nicht erkannt" bedeutet: `npm install` wurde noch nicht ausgeführt,
oder du bist im falschen Ordner.

---

## Schritt 1 – ZIP entpacken
1. `pokedax-complete.zip` herunterladen
2. Rechtsklick → "Alle extrahieren"
3. Zielordner wählen, z.B.: `C:\Users\lenovo\pokedax`

Nach dem Entpacken siehst du:
```
C:\Users\lenovo\pokedax\
├── package.json          ← muss hier sein!
├── next.config.ts
├── tailwind.config.ts
├── src\
└── ...
```

---

## Schritt 2 – Terminal öffnen (PowerShell)
Drücke `Win + X` → "Windows PowerShell" oder "Terminal"

---

## Schritt 3 – In den richtigen Ordner navigieren
```powershell
cd C:\Users\lenovo\pokedax
```

Prüfen ob du richtig bist:
```powershell
dir
```
Du solltest `package.json` sehen. Falls nicht → falscher Ordner!

---

## Schritt 4 – Node.js prüfen
```powershell
node --version
npm --version
```

Falls Fehler → Node.js installieren: https://nodejs.org (LTS Version)
Nach Installation: Terminal neu starten!

---

## Schritt 5 – Dependencies installieren (nur einmal nötig)
```powershell
npm install
```
Dauert 1-3 Minuten. Du siehst viele Zeilen Text – das ist normal.

---

## Schritt 6 – Umgebungsvariablen anlegen
```powershell
copy .env.local.example .env.local
```
Dann `.env.local` im Editor öffnen und Supabase-Keys eintragen.
(Ohne Keys startet die App trotzdem, aber Auth funktioniert nicht)

---

## Schritt 7 – App starten
```powershell
npm run dev
```

Du siehst:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
✓ Ready
```

Browser öffnen: http://localhost:3000

---

## Häufige Fehler

### "next ist nicht erkannt" / "'next' is not recognized"
→ `npm install` wurde nicht ausgeführt, oder falscher Ordner
→ Lösung: `cd C:\Users\lenovo\pokedax` dann `npm install`

### "Cannot find module" 
→ Gleiche Ursache: `npm install` fehlt

### Port 3000 belegt
```powershell
npm run dev -- --port 3001
```

### PowerShell Execution Policy Fehler
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Für Vercel Deployment (nach lokalem Test)

1. GitHub Desktop → Neues Repository aus `C:\Users\lenovo\pokedax`
2. Commit + Push
3. vercel.com → Import → Dein Repo auswählen
4. Environment Variables eintragen (alle aus .env.local)
5. Deploy!

