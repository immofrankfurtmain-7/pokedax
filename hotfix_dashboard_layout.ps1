# Hotfix: Dashboard Layout (Sidebar entfernen)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

New-Item -ItemType Directory -Path "$root\src\app\dashboard" -Force | Out-Null

# Leeres Layout ohne Sidebar
$layout = @'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\layout.tsx", $layout, $enc)
Write-Host "  OK  dashboard/layout.tsx (Sidebar entfernt)" -ForegroundColor Green

Write-Host ""
Write-Host "GitHub Desktop -> Commit 'fix: remove dashboard sidebar layout' -> Push" -ForegroundColor Yellow
