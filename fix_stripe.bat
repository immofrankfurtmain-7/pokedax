@echo off
title Fix Stripe Webhook Type Error
color 0A
cls

echo.
echo  ================================================
echo   PokeDax - Fix Stripe Webhook
echo  ================================================
echo.
echo  Schreibe korrigierte Datei...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0fix_webhook.ps1"

if errorlevel 1 (
    echo.
    echo  [FEHLER] Etwas ist schiefgelaufen.
    echo  Rechtsklick auf fix_stripe.bat - "Als Administrator ausfuehren"
    pause
    exit /b 1
)

echo.
echo  ================================================
echo   FERTIG!
echo  ================================================
echo.
echo  Jetzt in GitHub Desktop:
echo  1. Geaenderte Datei ist sichtbar
echo  2. Summary: "Fix Stripe webhook types"
echo  3. Commit to main - dann Push origin
echo.
echo  Vercel deployed automatisch - diesmal ohne Fehler!
echo.
pause
