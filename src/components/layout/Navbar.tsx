"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck",      label:"Preischeck"  },
  { href:"/scanner",         label:"Scanner"     },
  { href:"/portfolio",       label:"Portfolio"   },
  { href:"/fantasy",         label:"Fantasy"     },
  { href:"/forum",           label:"Forum"       },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,   setUser]   = useState<any>(null);
  const [isPrem, setIsPrem] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        sb.from("profiles").select("is_premium").eq("id", user.id).single()
          .then(({ data }) => { if (data?.is_premium) setIsPrem(true); });
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
    <header style={{ position:"sticky", top:0, zIndex:50, padding:"12px 24px 0" }}>
      <nav style={{
        height:54, padding:"0 22px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"rgba(10,10,10,0.92)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:22,
        backdropFilter:"blur(36px) saturate(200%)",
        WebkitBackdropFilter:"blur(36px) saturate(200%)",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize:17, fontWeight:300, letterSpacing:"-.035em",
          color:"#f0f0f5", textDecoration:"none",
          fontFamily:"var(--font-display)",
        }}>
          pokédax
        </Link>

        {/* Nav links */}
        <div className="hidden-mobile" style={{ display:"flex", gap:1 }}>
          {LINKS.map(l => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} style={{
                padding:"5px 14px", borderRadius:8,
                fontSize:12.5, fontWeight:400,
                color: active ? "#f0f0f5" : "#a8a8b8",
                textDecoration:"none", position:"relative",
                transition:"color .12s, background .12s",
              }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; if(!active){el.style.color="#f0f0f5";el.style.background="rgba(255,255,255,0.04)";} }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; if(!active){el.style.color="#a8a8b8";el.style.background="transparent";} }}
              >
                {l.label}
                {active && (
                  <span style={{
                    position:"absolute", bottom:-2, left:14, right:14,
                    height:1, background:"#E9A84B", opacity:.55, borderRadius:1,
                  }}/>
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Link href="/dashboard/premium" style={{
            padding:"5px 12px", borderRadius:8,
            fontSize:11.5, fontWeight:500,
            background:"rgba(233,168,75,0.08)", color:"#E9A84B",
            border:"1px solid rgba(233,168,75,0.16)", textDecoration:"none",
            transition:"background .15s, border-color .15s",
          }}>
            {isPrem ? "✦ Premium" : "✦ Premium"}
          </Link>
          {user ? (
            <>
              <Link href="/portfolio" style={{
                width:30, height:30, borderRadius:"50%",
                background:"var(--bg-2)", border:"1px solid rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:600, color:"#E9A84B", textDecoration:"none",
              }}>
                {user.email?.[0]?.toUpperCase()}
              </Link>
              <button onClick={signOut} style={{
                padding:"5px 13px", borderRadius:8, fontSize:12, fontWeight:400,
                color:"#a8a8b8", border:"1px solid rgba(255,255,255,0.07)",
                background:"transparent", cursor:"pointer",
              }}>Abmelden</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding:"5px 13px", borderRadius:8, fontSize:12, fontWeight:400,
                color:"#a8a8b8", border:"1px solid rgba(255,255,255,0.07)",
                background:"transparent", textDecoration:"none",
              }}>Anmelden</Link>
              <Link href="/auth/register" style={{
                padding:"6px 16px", borderRadius:8, fontSize:12, fontWeight:500,
                background:"#E9A84B", color:"#0a0808",
                textDecoration:"none", letterSpacing:"-.01em",
                boxShadow:"0 2px 14px rgba(233,168,75,0.2)",
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
