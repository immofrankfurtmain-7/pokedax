# PokeDax – Karten-Sync Auto-Loop
# Lauft automatisch bis alle Karten synchronisiert sind
$root    = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$baseUrl = "https://pokedax2.vercel.app/api/admin/sync-cards"
$secret  = "pokedax_admin_2026"
$limit   = 30
$offset  = 0
$total   = 0
$failed  = 0
$rounds  = 0

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  PokeDax Karten-Sync Auto-Loop" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Holt: types, rarity, hp, category, stage," -ForegroundColor Gray
Write-Host "      illustrator, name_de, image_url" -ForegroundColor Gray
Write-Host ""

do {
    $rounds++
    $body = '{"offset":' + $offset + ',"limit":' + $limit + '}'
    
    try {
        $result = Invoke-RestMethod `
            -Uri $baseUrl `
            -Method POST `
            -Headers @{'x-admin-secret' = $secret} `
            -ContentType 'application/json' `
            -Body $body

        $total  += $result.updated
        $failed += $result.failed
        $hasMore = $result.hasMore

        $pct = if ($result.total -gt 0) { [math]::Round(($result.updated / $result.total) * 100) } else { 0 }
        
        Write-Host "  Runde $rounds | Offset $offset | Updated: $($result.updated)/$($result.total) | Gesamt: $total" -ForegroundColor $(if ($result.updated -gt 0) { "Green" } else { "Yellow" })

        $offset += $limit

        # Kurze Pause damit Vercel/TCGdex nicht überlastet wird
        if ($hasMore) { Start-Sleep -Milliseconds 500 }

    } catch {
        Write-Host "  FEHLER in Runde $rounds`: $_" -ForegroundColor Red
        Write-Host "  Warte 5 Sekunden und versuche erneut..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        # Nicht offset erhöhen - nochmal versuchen
    }

} while ($hasMore -eq $true)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Sync abgeschlossen!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Gesamt aktualisiert: $total" -ForegroundColor Green
Write-Host "  Fehlgeschlagen:      $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "  Runden:              $rounds" -ForegroundColor White
Write-Host ""
Write-Host "Stats pruefen:" -ForegroundColor Yellow
$stats = Invoke-RestMethod `
    -Uri "https://pokedax2.vercel.app/api/admin/sync-cards" `
    -Method GET `
    -Headers @{'x-admin-secret' = $secret}
Write-Host "  Gesamt Karten:     $($stats.total)" -ForegroundColor White
Write-Host "  Ohne Types:        $($stats.missingTypes)" -ForegroundColor White
Write-Host "  Ohne Rarity:       $($stats.missingRarity)" -ForegroundColor White
Write-Host "  Ohne Bild:         $($stats.missingImages)" -ForegroundColor White
Write-Host "  Ohne DE Name:      $($stats.missingNameDe)" -ForegroundColor White
Write-Host "  Vollstaendigkeit:  $($stats.completePct)%" -ForegroundColor Cyan
