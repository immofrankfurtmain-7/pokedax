@echo off
title PokeDax Setup
color 0A
cls

echo.
echo  ================================================
echo   POKEDAX - Windows Setup Script
echo  ================================================
echo.

:: Prüfe ob wir im richtigen Ordner sind
if not exist "package.json" (
    echo  [FEHLER] package.json nicht gefunden!
    echo  Bitte dieses Script in den pokedax/ Ordner legen.
    echo  Aktueller Ordner: %CD%
    echo.
    pause
    exit /b 1
)

:: Prüfe Node.js
echo  [1/4] Pruefe Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  [FEHLER] Node.js nicht installiert!
    echo  Bitte installieren: https://nodejs.org ^(LTS^)
    echo  Nach Installation Terminal neu starten.
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo  Node.js %%i gefunden - OK

:: npm install
echo.
echo  [2/4] Installiere Dependencies...
echo  Das dauert 1-3 Minuten...
echo.
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo  [FEHLER] npm install fehlgeschlagen!
    echo  Versuche es manuell: npm install --force
    pause
    exit /b 1
)
echo  Dependencies installiert - OK

:: .env.local anlegen falls nicht vorhanden
echo.
echo  [3/4] Pruefe .env.local...
if not exist ".env.local" (
    copy ".env.local.example" ".env.local" >nul
    echo  .env.local erstellt ^(Supabase-Keys eintragen fuer Auth^)
) else (
    echo  .env.local vorhanden - OK
)

:: Starten
echo.
echo  [4/4] Starte PokeDax...
echo.
echo  ================================================
echo   App laeuft auf: http://localhost:3000
echo   Zum Beenden: Strg + C druecken
echo  ================================================
echo.
start http://localhost:3000
call npm run dev

pause
