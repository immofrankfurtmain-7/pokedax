"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck", label:"Preischeck"   },
  { href:"/scanner",    label:"Scanner"      },
  { href:"/portfolio",  label:"Portfolio"    },
  { href:"/fantasy",    label:"Fantasy"      },
  { href:"/forum",      label:"Forum"        },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  const NAV_LINK_STYLE = (active: boolean): React.CSSProperties => ({
    padding:"10px 18px", borderRadius:16,
    fontSize:14, fontWeight:400,
    color: active ? "#E9A84B" : "#a8a8b8",
    textDecoration:"none",
    background: active ? "rgba(233,168,75,0.06)" : "transparent",
    transition:"color .2s, background .2s",
    whiteSpace:"nowrap" as const,
  });

  return (
    <>
      <header style={{
        position:"sticky", top:0, zIndex:100,
        padding: scrolled ? "10px 24px 0" : "16px 24px 0",
        transition:"padding .3s",
      }}>
        <nav style={{
          height:72,
          padding:"0 28px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: scrolled ? "rgba(10,10,10,0.96)" : "rgba(10,10,10,0.85)",
          border:`1px solid rgba(255,255,255,${scrolled ? "0.10" : "0.07"})`,
          borderRadius:24,
          backdropFilter:"blur(40px) saturate(180%)",
          WebkitBackdropFilter:"blur(40px) saturate(180%)",
          transition:"all .3s",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontSize:22, fontWeight:300, letterSpacing:"-.055em",
            color:"#E9A84B", textDecoration:"none",
            fontFamily:"var(--font-display)",
            flexShrink:0,
          }}>
            pokédax
          </Link>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:2 }}>
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} className="gold-glow" style={NAV_LINK_STYLE(active)}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:10 }}>
            {user ? (
              <>
                <Link href="/portfolio" className="gold-glow" style={{
                  padding:"8px 18px", borderRadius:14,
                  fontSize:13.5, color:"#a8a8b8",
                  border:"1px solid rgba(255,255,255,0.10)",
                  textDecoration:"none",
                }}>Portfolio</Link>
                <button onClick={signOut} style={{
                  padding:"8px 18px", borderRadius:14,
                  fontSize:13.5, color:"#6b6b7a",
                  border:"none", background:"transparent", cursor:"pointer",
                }}>Abmelden</button>
              </>
            ) : (
              <Link href="/auth/login" className="gold-glow" style={{
                padding:"8px 20px", borderRadius:14,
                fontSize:13.5, color:"#a8a8b8",
                border:"1px solid rgba(255,255,255,0.10)",
                textDecoration:"none",
              }}>Anmelden</Link>
            )}
            <Link href="/dashboard/premium" className="gold-glow" style={{
              padding:"9px 22px", borderRadius:20,
              fontSize:13.5, fontWeight:500,
              background:"#E9A84B", color:"#0a0808",
              textDecoration:"none", letterSpacing:"-.01em",
            }}>Premium</Link>
          </div>

          {/* Mobile burger */}
          <button
            className="nav-mobile"
            onClick={() => setOpen(o => !o)}
            style={{
              width:40, height:40, borderRadius:12,
              background: open ? "rgba(233,168,75,0.08)" : "transparent",
              border:`1px solid ${open ? "rgba(233,168,75,0.2)" : "rgba(255,255,255,0.08)"}`,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:5,
              cursor:"pointer", padding:0, flexShrink:0,
              transition:"all .2s",
            }}
            aria-label="Menü"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:18, height:1.5,
                background: open ? "#E9A84B" : "#a8a8b8",
                borderRadius:1,
                transform: open
                  ? i===0 ? "rotate(45deg) translate(0,4.5px)"
                  : i===1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(0,-4.5px)"
                  : "none",
                transition:"all .22s var(--ease)",
                opacity: open && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            marginTop:8,
            background:"rgba(10,10,10,0.98)",
            border:"1px solid rgba(255,255,255,0.10)",
            borderRadius:22,
            padding:12,
            backdropFilter:"blur(40px)",
            WebkitBackdropFilter:"blur(40px)",
          }}>
            {LINKS.map(l => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  display:"flex", alignItems:"center",
                  padding:"14px 18px", borderRadius:14, marginBottom:2,
                  fontSize:16, fontWeight:400,
                  color: active ? "#E9A84B" : "#f0f0f5",
                  textDecoration:"none",
                  background: active ? "rgba(233,168,75,0.06)" : "transparent",
                  borderLeft:`2px solid ${active ? "#E9A84B" : "transparent"}`,
                }}>
                  {l.label}
                </Link>
              );
            })}
            <div style={{ margin:"10px 0 6px", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10 }}>
              <Link href="/dashboard/premium" style={{
                display:"block", padding:"14px 18px", borderRadius:14,
                fontSize:16, fontWeight:500,
                background:"#E9A84B", color:"#0a0808",
                textDecoration:"none", textAlign:"center",
              }}>Premium werden</Link>
              {!user && (
                <Link href="/auth/login" style={{
                  display:"block", padding:"14px 18px", marginTop:6, borderRadius:14,
                  fontSize:16, color:"#a8a8b8", textDecoration:"none", textAlign:"center",
                }}>Anmelden</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        .nav-desktop { display:flex!important; }
        .nav-mobile  { display:none!important; }
        @media(max-width:768px){
          .nav-desktop { display:none!important; }
          .nav-mobile  { display:flex!important; }
        }
      `}</style>
    </>
  );
}
