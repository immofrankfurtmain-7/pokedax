@echo off
title PokeDax - Update Files
color 0A
cls

echo.
echo  ================================================
echo   PokeDax - Dateien werden ersetzt...
echo  ================================================
echo.

:: Finde den pokedax-Ordner (da wo package.json liegt)
set "BASE="

:: Pruefe ob wir direkt im richtigen Ordner sind
if exist "package.json" (
    set "BASE=%CD%"
    goto :found
)

:: Suche in Unterordnern
for /d %%D in (*) do (
    if exist "%%D\package.json" (
        set "BASE=%CD%\%%D"
        goto :found
    )
    for /d %%E in ("%%D\*") do (
        if exist "%%E\package.json" (
            set "BASE=%CD%\%%E"
            goto :found
        )
    )
)

echo  [FEHLER] Kein pokedax-Ordner gefunden!
echo  Bitte das Script in den Ordner legen der pokedax enthaelt.
echo.
pause
exit /b 1

:found
echo  Projektordner gefunden: %BASE%
echo.

:: Pruefe ob src-Ordner existiert
if not exist "%BASE%\src" (
    echo  [FEHLER] Kein src-Ordner in: %BASE%
    pause
    exit /b 1
)

set "SCRIPT_DIR=%~dp0"

:: Erstelle fehlende Ordner
if not exist "%BASE%\src\components\ui" mkdir "%BASE%\src\components\ui"

:: Ersetze alle Dateien
set ERRORS=0

call :copy_file "MewtwoCanvas.tsx"     "%BASE%\src\components\mewtwo\MewtwoCanvas.tsx"
call :copy_file "ForumSection.tsx"     "%BASE%\src\components\forum\ForumSection.tsx"
call :copy_file "AvatarUpload.tsx"     "%BASE%\src\components\ui\AvatarUpload.tsx"
call :copy_file "marketplace_page.tsx" "%BASE%\src\app\dashboard\marketplace\page.tsx"
call :copy_file "dashboard_page.tsx"   "%BASE%\src\app\dashboard\page.tsx"
call :copy_file "globals.css"          "%BASE%\src\styles\globals.css"

echo.
if %ERRORS%==0 (
    echo  ================================================
    echo   FERTIG! Alle Dateien ersetzt.
    echo  ================================================
    echo.
    echo  Jetzt:
    echo  1. GitHub Desktop oeffnen
    echo  2. Commit: "Update UI files"
    echo  3. Push to origin
) else (
    echo  [WARNUNG] %ERRORS% Datei(en) konnten nicht kopiert werden.
    echo  Bitte manuell kopieren.
)
echo.
pause
exit /b 0

:copy_file
set "SRC=%SCRIPT_DIR%%~1"
set "DST=%~2"
if not exist "%SRC%" (
    echo  [SKIP] %~1 nicht gefunden - uebersprungen
    exit /b 0
)
copy /Y "%SRC%" "%DST%" >nul 2>&1
if errorlevel 1 (
    echo  [FEHLER] %~1 konnte nicht kopiert werden
    set /a ERRORS+=1
) else (
    echo  [OK] %~1
)
exit /b 0
