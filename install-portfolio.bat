@echo off
echo Kopiere Portfolio-Dateien...

:: Ordner anlegen falls nicht vorhanden
if not exist "src\app\dashboard\portfolio\[setId]" mkdir "src\app\dashboard\portfolio\[setId]"
if not exist "src\components\portfolio" mkdir "src\components\portfolio"

:: Dateien kopieren
copy /Y "portfolio-page.tsx" "src\app\dashboard\portfolio\page.tsx"
copy /Y "set-detail-page.tsx" "src\app\dashboard\portfolio\[setId]\page.tsx"
copy /Y "SetGrid.tsx" "src\components\portfolio\SetGrid.tsx"
copy /Y "CardGrid.tsx" "src\components\portfolio\CardGrid.tsx"
copy /Y "CollectionStats.tsx" "src\components\portfolio\CollectionStats.tsx"

echo.
echo Fertig! Alle Dateien kopiert.
pause
