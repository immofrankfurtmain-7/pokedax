@echo off
title PokeDax - Lightning + Stylische Kacheln
color 0A
cls

echo.
echo  ================================================
echo   PokeDax - Komplettes Update
echo   Lightning-Blitze + Stylische Dashboard-Kacheln
echo  ================================================
echo.

:: Projektordner suchen
set "BASE="
if exist "package.json" ( set "BASE=%CD%" & goto :found )
for /d %%D in (*) do (
    if exist "%%D\package.json" ( set "BASE=%CD%\%%D" & goto :found )
    for /d %%E in ("%%D\*") do (
        if exist "%%E\package.json" ( set "BASE=%CD%\%%E" & goto :found )
        for /d %%F in ("%%E\*") do (
            if exist "%%F\package.json" ( set "BASE=%CD%\%%F" & goto :found )
        )
    )
)
echo  [FEHLER] Projektordner nicht gefunden!
echo  Script in den Ordner legen der pokedax enthaelt.
pause & exit /b 1

:found
echo  Projektordner gefunden: %BASE%
echo.

set "SD=%~dp0"
set ERRORS=0

:: Ordner anlegen falls nicht vorhanden
if not exist "%BASE%\src\components\layout" mkdir "%BASE%\src\components\layout"
if not exist "%BASE%\src\components\ui"     mkdir "%BASE%\src\components\ui"

:: Alle Dateien kopieren
call :copy "LightningBackground.tsx" "%BASE%\src\components\layout\LightningBackground.tsx"
call :copy "Hero.tsx"                "%BASE%\src\components\layout\Hero.tsx"
call :copy "DashboardCards.tsx"      "%BASE%\src\components\ui\DashboardCards.tsx"
call :copy "layout.tsx"              "%BASE%\src\app\layout.tsx"
call :copy "dashboard_page.tsx"      "%BASE%\src\app\dashboard\page.tsx"

echo.
if %ERRORS%==0 (
    echo  ================================================
    echo   FERTIG! Alle 5 Dateien erfolgreich ersetzt.
    echo  ================================================
    echo.
    echo  Jetzt in GitHub Desktop:
    echo  1. Du siehst die 5 geaenderten Dateien
    echo  2. Summary: "Lightning Background + Stylische Kacheln"
    echo  3. Commit to main
    echo  4. Push to origin
    echo.
    echo  Vercel deployed automatisch in ~2 Minuten.
) else (
    echo  [WARNUNG] %ERRORS% Datei(en) fehlgeschlagen - manuell kopieren!
)
echo.
pause
exit /b 0

:copy
set "SRC=%SD%%~1"
set "DST=%~2"
if not exist "%SRC%" (
    echo  [SKIP]   %~1 nicht gefunden - uebersprungen
    exit /b 0
)
copy /Y "%SRC%" "%DST%" >nul 2>&1
if errorlevel 1 (
    echo  [FEHLER] %~1
    set /a ERRORS+=1
) else (
    echo  [OK]     %~1
)
exit /b 0
