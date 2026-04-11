# Hotfix: Kartendetail + Sets-Filter + Leaderboard
# Nutzt Python um [id] und [username] Pfade zu schreiben
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"

Write-Host ""
Write-Host "Hotfix via Python (loest PS [id] Problem)" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Python muss installiert sein (python3 oder python)
$pyFile = "$env:TEMP\pokedax_fix.py"

# Kopiere fix_files.py in temp
Copy-Item "fix_files.py" $pyFile -ErrorAction SilentlyContinue

# Versuche python3, dann python
$ran = $false
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 $pyFile
    $ran = $true
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python $pyFile
    $ran = $true
}

if (-not $ran) {
    Write-Host "Python nicht gefunden! Bitte python.org/downloads installieren." -ForegroundColor Red
    Write-Host "Oder: fix_files.py manuell mit Python ausfuehren." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "WICHTIG: In Vercel pruefen:" -ForegroundColor Cyan
Write-Host "  SUPABASE_SERVICE_ROLE_KEY gesetzt?" -ForegroundColor White
Write-Host "  (Supabase Dashboard -> Settings -> API -> service_role key)" -ForegroundColor White
Write-Host ""
Write-Host "GitHub Desktop -> Commit -> Push" -ForegroundColor Yellow
