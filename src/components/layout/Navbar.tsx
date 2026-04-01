"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck",     label:"Preischeck"  },
  { href:"/scanner",        label:"Scanner"     },
  { href:"/forum",          label:"Forum"       },
  { href:"/top-movers",     label:"Top Movers"  },
  { href:"/spiel",          label:"Spiel"       },
];

const G = "#E9A84B";
const G18 = "rgba(233,168,75,0.18)";
const G06 = "rgba(233,168,75,0.06)";

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,      setUser]      = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        sb.from("profiles").select("is_premium").eq("id", user.id).single()
          .then(({ data }) => { if (data) setIsPremium(data.is_premium); });
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  return (
    <header style={{ position:"sticky", top:0, zIndex:50, padding:"10px 20px 0" }}>
      <nav style={{
        height:56, padding:"0 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"rgba(7,7,15,0.92)",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:20,
        backdropFilter:"blur(32px) saturate(180%)",
        WebkitBackdropFilter:"blur(32px) saturate(180%)",
      }}>
        {/* Brand */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
          <div style={{
            width:25, height:25, borderRadius:8,
            background:G06, border:`1px solid ${G18}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background .15s, border-color .15s",
          }}>
            <Image src="/pokedax-logo.png" alt="PokéDax" width={16} height={16} style={{ objectFit:"contain" }}/>
          </div>
          <span style={{ fontSize:14.5, fontWeight:500, letterSpacing:"-.025em", color:"#EDEAF6" }}>
            PokéDax
          </span>
        </Link>

        {/* Links */}
        <div className="hidden-mobile" style={{ display:"flex" }}>
          {LINKS.map(l => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} style={{
                padding:"5px 13px", borderRadius:7,
                fontSize:12, fontWeight:400,
                color: active ? "#EDEAF6" : "#8A89A8",
                textDecoration:"none", position:"relative",
                transition:"color .12s, background .12s",
              }}
              onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.035)"; (e.currentTarget as HTMLElement).style.color="#EDEAF6"; }}
              onMouseLeave={e=>{ if(!active){ (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color="#8A89A8"; }}}
              >
                {l.label}
                {active && (
                  <span style={{
                    position:"absolute", bottom:-2, left:13, right:13,
                    height:1, background:G, opacity:.6, borderRadius:1,
                  }}/>
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Link href="/dashboard/premium" style={{
            padding:"4px 11px", borderRadius:7, fontSize:11, fontWeight:500,
            background:G06, color:G, border:`1px solid ${G18}`,
            textDecoration:"none", whiteSpace:"nowrap",
          }}>
            {isPremium ? "✦ Premium" : "👑 Premium"}
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" style={{
                width:30, height:30, borderRadius:"50%",
                background:"var(--b3)", border:"1px solid rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:600, color:G, textDecoration:"none",
              }}>
                {user.email?.[0]?.toUpperCase()}
              </Link>
              <button onClick={signOut} style={{
                padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:400,
                color:"#8A89A8", border:"1px solid rgba(255,255,255,0.08)",
                background:"transparent", cursor:"pointer",
              }}>Abmelden</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:400,
                color:"#8A89A8", border:"1px solid rgba(255,255,255,0.08)",
                background:"transparent", textDecoration:"none",
              }}>Anmelden</Link>
              <Link href="/auth/register" style={{
                padding:"6px 14px", borderRadius:7, fontSize:12, fontWeight:500,
                background:G, color:"#09070E", textDecoration:"none",
                letterSpacing:"-.01em",
                boxShadow:"0 1px 8px rgba(233,168,75,0.2)",
              }}>Registrieren</Link>
            </>
          )}
        </div>
      </nav>
      <style>{`
        @media(min-width:769px){.hidden-mobile{display:flex!important}}
        @media(max-width:768px){.hidden-mobile{display:none!important}}
      `}</style>
    </header>
  );
}
