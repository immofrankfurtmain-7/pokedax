# sync-all-prices.ps1
# Führt den Preis-Sync für alle Sets in Supabase durch
# Aufruf: .\sync-all-prices.ps1

$BASE_URL     = "https://pokedax2.vercel.app"
$ADMIN_SECRET = "pokedax_admin_2026"
$SUPABASE_URL = "https://asvmrvchuuosjubujjrx.supabase.co"   # z.B. https://xyz.supabase.co
$SUPABASE_KEY = "sb_publishable_ylTRRe5GB91CD66oM2fqrw_F9DbLF3n"
$BATCH_SIZE   = 50
$SLEEP_MS     = 500  # Pause zwischen Batches in ms

# ─── Farben für Output ───────────────────────────────────────────
function Write-OK    { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-WARN  { param($msg) Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-INFO  { param($msg) Write-Host "  [..] $msg" -ForegroundColor Cyan }
function Write-HEAD  { param($msg) Write-Host "`n$msg" -ForegroundColor Magenta }

# ─── Alle Set-IDs aus Supabase holen ────────────────────────────
Write-HEAD "=== POKÉDAX PREIS-SYNC ==="
Write-INFO "Lade alle Set-IDs aus Supabase..."

$headers = @{
    "apikey"        = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
}

try {
    $setsResponse = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/sets?select=id,name&order=id" `
        -Headers $headers `
        -Method GET
} catch {
    Write-Host "FEHLER beim Laden der Sets: $_" -ForegroundColor Red
    exit 1
}

$totalSets = $setsResponse.Count
Write-OK "$totalSets Sets gefunden"

# ─── Statistik-Variablen ─────────────────────────────────────────
$totalUpdated = 0
$totalFailed  = 0
$setsDone     = 0
$startTime    = Get-Date

# ─── Jeden Set durchgehen ────────────────────────────────────────
foreach ($set in $setsResponse) {
    $setsDone++
    $setId   = $set.id
    $setName = $set.name
    $elapsed = [int]((Get-Date) - $startTime).TotalMinutes

    Write-HEAD "[$setsDone/$totalSets] $setName ($setId) — ${elapsed}min vergangen"

    $offset   = 0
    $hasMore  = $true
    $setBatch = 0

    while ($hasMore) {
        $setBatch++
        Write-INFO "Batch $setBatch (Offset $offset)..."

        try {
            $url = "$BASE_URL/api/admin/sync-prices?setId=$setId&offset=$offset&limit=$BATCH_SIZE"
            $result = Invoke-RestMethod `
                -Uri $url `
                -Headers @{ "x-admin-secret" = $ADMIN_SECRET } `
                -Method GET `
                -TimeoutSec 60

            $updated = $result.updated
            $failed  = $result.failed
            $hasMore = $result.hasMore

            $totalUpdated += $updated
            $totalFailed  += $failed

            if ($failed -gt 0) {
                Write-WARN "Updated: $updated | Failed: $failed"
            } else {
                Write-OK "Updated: $updated"
            }

            $offset += $BATCH_SIZE

        } catch {
            Write-Host "  FEHLER bei Batch: $_" -ForegroundColor Red
            $hasMore = $false
        }

        # Pause zwischen Batches
        if ($hasMore) {
            Start-Sleep -Milliseconds $SLEEP_MS
        }
    }

    # Kurze Pause zwischen Sets
    Start-Sleep -Milliseconds 300
}

# ─── Zusammenfassung ─────────────────────────────────────────────
$duration = [int]((Get-Date) - $startTime).TotalMinutes
Write-HEAD "=== FERTIG ==="
Write-Host "  Sets verarbeitet : $setsDone" -ForegroundColor White
Write-Host "  Karten updated   : $totalUpdated" -ForegroundColor Green
Write-Host "  Karten failed    : $totalFailed"  -ForegroundColor $(if ($totalFailed -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Dauer            : ca. $duration Minuten" -ForegroundColor White
