"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck",        label:"Preischeck"    },
  { href:"/scanner",           label:"Scanner"       },
  { href:"/portfolio",         label:"Portfolio"     },
  { href:"/fantasy",           label:"Fantasy League"},
  { href:"/forum",             label:"Forum"         },
];

const G  = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,     setUser]     = useState<any>(null);
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Live Ticker */}
      <div style={{
        background:"var(--bg-1)",
        borderBottom:"1px solid var(--br-1)",
        padding:"10px 0",
        overflow:"hidden",
        whiteSpace:"nowrap",
      }}>
        <div style={{
          display:"inline-flex",
          animation:"ticker-scroll 55s linear infinite",
          gap:0,
        }}>
          {Array.from({length:4}).map((_,i)=>(
            <span key={i} style={{
              paddingRight:56,
              fontSize:10.5,
              fontWeight:500,
              letterSpacing:".13em",
              color:"rgba(212,168,67,0.75)",
              textTransform:"uppercase",
            }}>
              LIVE&nbsp;·&nbsp;Glurak ex +12,4 %&nbsp;·&nbsp;Mewtu ex +5,7 %&nbsp;·&nbsp;Umbreon ex +8,2 %&nbsp;·&nbsp;Pikachu ex −3,1 %&nbsp;·&nbsp;Lugia ex +18,3 %&nbsp;·&nbsp;Gardevoir ex +6,9 %&nbsp;·&nbsp;Dragonite ex +18,3 %
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        borderBottom:`1px solid ${scrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}`,
        background: scrolled
          ? "rgba(9,9,11,0.97)"
          : "rgba(9,9,11,0.88)",
        backdropFilter:"blur(48px) saturate(180%)",
        WebkitBackdropFilter:"blur(48px) saturate(180%)",
        position:"sticky",
        top:0,
        zIndex:50,
        transition:"background .3s, border-color .3s",
      }}>
        <div style={{
          maxWidth:1240,margin:"0 auto",
          padding:"0 clamp(16px,3vw,32px)",
          height:72,
          display:"flex",alignItems:"center",
          justifyContent:"space-between",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontFamily:"var(--font-display)",
            fontSize:22,fontWeight:300,
            letterSpacing:"-.08em",
            color:G,textDecoration:"none",
            flexShrink:0,
          }}>pokédax</Link>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:2}}>
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href+"/");
              return (
                <Link key={l.href} href={l.href} className="gold-glow" style={{
                  padding:"9px 18px",borderRadius:14,
                  fontSize:13.5,fontWeight:400,
                  color: active ? G : "var(--tx-2)",
                  textDecoration:"none",
                  background: active ? G08 : "transparent",
                  letterSpacing:"-.01em",
                }}>{l.label}</Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:10}}>
            {user ? (
              <>
                <Link href="/portfolio" style={{padding:"9px 18px",borderRadius:14,fontSize:13.5,color:"var(--tx-2)",textDecoration:"none"}}>
                  Portfolio
                </Link>
                <button onClick={signOut} style={{padding:"9px 18px",borderRadius:14,fontSize:13.5,color:"var(--tx-3)",border:"none",background:"transparent",cursor:"pointer"}}>
                  Abmelden
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="gold-glow" style={{
                padding:"9px 20px",borderRadius:14,
                fontSize:13.5,color:"var(--tx-2)",
                border:"1px solid var(--br-2)",textDecoration:"none",
              }}>Anmelden</Link>
            )}
            <Link href="/dashboard/premium" className="gold-glow" style={{
              padding:"10px 22px",borderRadius:20,
              fontSize:13.5,fontWeight:500,
              background:G,color:"#080608",
              textDecoration:"none",letterSpacing:"-.01em",
            }}>Premium</Link>
          </div>

          {/* Mobile burger */}
          <button className="nav-mobile" onClick={()=>setOpen(o=>!o)} style={{
            width:42,height:42,borderRadius:12,
            background: open ? G08 : "transparent",
            border:`1px solid ${open ? G15 : "var(--br-2)"}`,
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:5,
            cursor:"pointer",padding:0,flexShrink:0,transition:"all .2s",
          }} aria-label="Menü">
            {[0,1,2].map(i=>(
              <span key={i} style={{
                display:"block",width:18,height:1.5,
                background: open ? G : "var(--tx-2)",
                borderRadius:1,
                transform: open
                  ? i===0 ? "rotate(45deg) translate(0,4.7px)"
                  : i===1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(0,-4.7px)"
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
            borderTop:"1px solid var(--br-1)",
            background:"rgba(9,9,11,0.98)",
            backdropFilter:"blur(48px)",
            padding:"10px 16px 20px",
          }}>
            {LINKS.map(l=>(
              <Link key={l.href} href={l.href} style={{
                display:"block",padding:"14px 16px",
                borderRadius:14,marginBottom:2,
                fontSize:17,fontWeight:400,
                color: pathname===l.href ? G : "var(--tx-1)",
                textDecoration:"none",
                background: pathname===l.href ? G08 : "transparent",
                letterSpacing:"-.02em",
              }}>{l.label}</Link>
            ))}
            <div style={{margin:"10px 0 6px",borderTop:"1px solid var(--br-1)",paddingTop:10}}>
              <Link href="/dashboard/premium" style={{
                display:"block",padding:"15px 16px",borderRadius:16,
                fontSize:17,fontWeight:500,
                background:G,color:"#080608",
                textDecoration:"none",textAlign:"center",letterSpacing:"-.01em",
              }}>Premium werden</Link>
              {!user && (
                <Link href="/auth/login" style={{
                  display:"block",padding:"14px 16px",marginTop:6,
                  borderRadius:14,fontSize:16,color:"var(--tx-2)",
                  textDecoration:"none",textAlign:"center",
                }}>Anmelden</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
