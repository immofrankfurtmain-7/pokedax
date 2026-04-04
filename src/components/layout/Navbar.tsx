"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck", label:"Preischeck"    },
  { href:"/scanner",    label:"Scanner"       },
  { href:"/portfolio",  label:"Portfolio"     },
  { href:"/fantasy",    label:"Fantasy League"},
  { href:"/forum",      label:"Forum"         },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]   = useState<any>(null);
  const [open, setOpen]   = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* Ticker */}
      <div style={{
        background:"#111113",
        borderBottom:"1px solid rgba(255,255,255,0.1)",
        padding:"12px 0",
        overflow:"hidden",
        whiteSpace:"nowrap",
      }}>
        <div style={{
          display:"inline-flex",
          animation:"ticker-scroll 50s linear infinite",
          fontSize:11,
          fontWeight:500,
          letterSpacing:".14em",
          color:"#E9A84B",
          textTransform:"uppercase",
          gap:0,
        }}>
          {Array.from({length:4}).map((_,i)=>(
            <span key={i} style={{paddingRight:48}}>
              LIVE&nbsp;•&nbsp;Glurak ex +12,4 %&nbsp;•&nbsp;Mewtu ex +5,7 %&nbsp;•&nbsp;Umbreon ex +8,2 %&nbsp;•&nbsp;Pikachu ex −3,1 %&nbsp;•&nbsp;Lugia ex +18,3 %&nbsp;•&nbsp;Gardevoir ex +6,9 %&nbsp;•&nbsp;Dragonite ex +18,3 %
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        borderBottom:"1px solid rgba(255,255,255,0.1)",
        background:"rgba(10,10,10,0.95)",
        backdropFilter:"blur(40px)",
        WebkitBackdropFilter:"blur(40px)",
        position:"sticky",
        top:0,
        zIndex:50,
      }}>
        <div style={{
          maxWidth:1200,
          margin:"0 auto",
          padding:"0 24px",
          height:80,
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
        }}>
          {/* Logo */}
          <Link href="/" style={{
            fontFamily:"var(--font-display)",
            fontSize:28,
            fontWeight:300,
            letterSpacing:"-.095em",
            color:"#f0f0f5",
            textDecoration:"none",
            flexShrink:0,
          }}>
            pokédax
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:4}}>
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href+"/");
              return (
                <Link key={l.href} href={l.href} className="gold-glow" style={{
                  padding:"12px 24px",
                  borderRadius:18,
                  fontSize:13.5,
                  fontWeight:500,
                  color: active ? "#E9A84B" : "#a8a8b8",
                  textDecoration:"none",
                  background: active ? "rgba(233,168,75,0.06)" : "transparent",
                }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:16}}>
            {user ? (
              <button onClick={signOut} className="gold-glow" style={{
                padding:"12px 28px", borderRadius:18,
                fontSize:13.5, color:"#a8a8b8",
                border:"none", background:"transparent", cursor:"pointer",
              }}>Abmelden</button>
            ) : (
              <Link href="/auth/login" className="gold-glow" style={{
                padding:"12px 28px", borderRadius:18,
                fontSize:13.5, color:"#a8a8b8", textDecoration:"none",
              }}>Anmelden</Link>
            )}
            <Link href="/dashboard/premium" className="gold-glow" style={{
              padding:"12px 32px", borderRadius:24,
              fontSize:13.5, fontWeight:600,
              background:"#E9A84B", color:"#0a0808",
              textDecoration:"none",
            }}>Premium</Link>
          </div>

          {/* Mobile burger */}
          <button className="nav-mobile" onClick={() => setOpen(o=>!o)} style={{
            width:44, height:44, borderRadius:14,
            background:"transparent",
            border:"1px solid rgba(255,255,255,0.1)",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:5,
            cursor:"pointer", padding:0,
            transition:"all .2s",
          }} aria-label="Menü">
            {[0,1,2].map(i=>(
              <span key={i} style={{
                display:"block", width:20, height:1.5,
                background: open ? "#E9A84B" : "#a8a8b8",
                borderRadius:1,
                transform: open
                  ? i===0 ? "rotate(45deg) translate(0,5px)"
                  : i===1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(0,-5px)"
                  : "none",
                opacity: open && i===1 ? 0 : 1,
                transition:"all .22s var(--ease)",
              }}/>
            ))}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            borderTop:"1px solid rgba(255,255,255,0.06)",
            background:"rgba(10,10,10,0.98)",
            backdropFilter:"blur(40px)",
            padding:"12px 16px 20px",
          }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                display:"block", padding:"16px 20px",
                borderRadius:16, marginBottom:2,
                fontSize:18, fontWeight:400,
                color: pathname===l.href ? "#E9A84B" : "#f0f0f5",
                textDecoration:"none",
                background: pathname===l.href ? "rgba(233,168,75,0.06)" : "transparent",
              }}>{l.label}</Link>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",margin:"12px 0",paddingTop:12}}>
              <Link href="/dashboard/premium" style={{
                display:"block", padding:"16px 20px", borderRadius:18,
                fontSize:18, fontWeight:600,
                background:"#E9A84B", color:"#0a0808",
                textDecoration:"none", textAlign:"center",
              }}>Premium werden</Link>
              {!user && (
                <Link href="/auth/login" style={{
                  display:"block", padding:"14px 20px", marginTop:8,
                  borderRadius:16, fontSize:16, color:"#a8a8b8",
                  textDecoration:"none", textAlign:"center",
                }}>Anmelden</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .nav-desktop{display:flex!important}
        .nav-mobile{display:none!important}
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-mobile{display:flex!important}
        }
      `}</style>
    </>
  );
}
