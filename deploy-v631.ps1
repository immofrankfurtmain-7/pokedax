# PokéDax v6.3.1 — auth/callback Konflikt-Fix
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "pokEdax v6.3.1 — auth/callback Fix" -ForegroundColor Cyan
Write-Host ""

# Loesche die kolliderende page.tsx
$oldPage = "$root\src\app\auth\callback\page.tsx"
if (Test-Path $oldPage) {
  Remove-Item $oldPage -Force
  Write-Host "  DEL  auth/callback/page.tsx (Konflikt entfernt)" -ForegroundColor Yellow
}

# Stelle sicher dass route.ts korrekt geschrieben ist
if (-not (Test-Path "$root\src\app\auth\callback")) {
  New-Item -ItemType Directory -Path "$root\src\app\auth\callback" -Force | Out-Null
}


$route = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portfolio";

  if (code) {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}

'@
[System.IO.File]::WriteAllText("$root\src\app\auth\callback\route.ts", $route, $enc)
Write-Host "  OK   auth/callback/route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "Fix erledigt!" -ForegroundColor Green
Write-Host "GitHub Desktop -> Commit 'v6.3.1: fix auth callback conflict'" -ForegroundColor Yellow
Write-Host "-> Push -> Vercel" -ForegroundColor White
Write-Host ""
