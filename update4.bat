@echo off
title PokeDax Update 4 - Echter Pikachu + Weniger Blitze
color 0A
cls
echo.
echo  PokeDax Update 4 - Echter Pikachu + Weniger Blitze
echo  ====================================================
echo.
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
pause & exit /b 1
:found
echo  Ordner: %BASE%
echo.
set "SD=%~dp0"
set E=0

if not exist "%BASE%\public" mkdir "%BASE%\public"

call :cp "PikachuPeek.tsx"         "%BASE%\src\components\layout\PikachuPeek.tsx"
call :cp "LightningBackground.tsx" "%BASE%\src\components\layout\LightningBackground.tsx"
call :cp "pikachu-right.png"       "%BASE%\public\pikachu-right.png"
call :cp "pikachu-left.png"        "%BASE%\public\pikachu-left.png"

echo.
if %E%==0 (
    echo  [OK] Alle 4 Dateien ersetzt!
    echo.
    echo  GitHub Desktop - Commit "Real Pikachu + Less Lightning" - Push
) else ( echo  [WARNUNG] %E% Fehler )
echo.
pause & exit /b 0
:cp
set "S=%SD%%~1" & set "D=%~2"
if not exist "%S%" ( echo  [SKIP] %~1 & exit /b 0 )
copy /Y "%S%" "%D%" >nul 2>&1
if errorlevel 1 ( echo  [FEHLER] %~1 & set /a E+=1 ) else ( echo  [OK] %~1 )
exit /b 0
