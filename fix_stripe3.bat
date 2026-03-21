@echo off
title Fix Stripe Webhook
color 0A
cls
echo.
echo  Fixing Stripe webhook...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0fix_webhook3.ps1"
if errorlevel 1 (
    echo.
    echo  [FEHLER] Rechtsklick - "Als Administrator ausfuehren"
    pause
    exit /b 1
)
echo.
echo  [FERTIG] GitHub Desktop - Commit - Push!
echo.
pause
