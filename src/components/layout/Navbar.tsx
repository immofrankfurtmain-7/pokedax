"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck", label:"Preischeck" },
  { href:"/scanner",    label:"Scanner"    },
  { href:"/portfolio",  label:"Portfolio"  },
  { href:"/fantasy",    label:"Fantasy"    },
  { href:"/forum",      label:"Forum"      },
];

const G="#E9A84B", G18="rgba(233,168,75,0.18)", G08="rgba(233,168,75,0.08)";
const TX1="#f0f0f5", TX2="#a8a8b8", TX3="#6b6b7a";
const BG1="#111113", BR2="rgba(255,255,255,0.085)";

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user,   setUser]   = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <header style={{ position:"sticky", top:0, zIndex:50, padding:"12px 16px 0" }}>
        <nav style={{
          height:54, padding:"0 18px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"rgba(10,10,10,0.92)",
          border:`1px solid ${BR2}`,
          borderRadius:22,
          backdropFilter:"blur(36px) saturate(200%)",
          WebkitBackdropFilter:"blur(36px) saturate(200%)",
        }}>
          {/* Logo — gold */}
          <Link href="/" style={{
            fontSize:17, fontWeight:300, letterSpacing:"-.035em",
            color:G, textDecoration:"none",
            fontFamily:"var(--font-display)",
            flexShrink:0,
          }}>
            pokédax
          </Link>

          {/* Desktop links */}
          <div style={{ display:"flex", gap:1 }} className="nav-desktop">
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} style={{
                  padding:"5px 13px", borderRadius:8,
                  fontSize:12.5, fontWeight:400,
                  color: active ? TX1 : TX2,
                  textDecoration:"none", position:"relative",
                  transition:"color .12s",
                }}>
                  {l.label}
                  {active && (
                    <span style={{
                      position:"absolute", bottom:-2, left:13, right:13,
                      height:1, background:G, opacity:.55, borderRadius:1,
                    }}/>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }} className="nav-desktop">
            <Link href="/dashboard/premium" style={{
              padding:"5px 12px", borderRadius:8,
              fontSize:11.5, fontWeight:500,
              background:G08, color:G,
              border:`1px solid ${G18}`, textDecoration:"none",
            }}>✦ Premium</Link>
            {user ? (
              <button onClick={signOut} style={{
                padding:"5px 13px", borderRadius:8, fontSize:12,
                color:TX2, border:`1px solid ${BR2}`,
                background:"transparent", cursor:"pointer",
              }}>Abmelden</button>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  padding:"5px 13px", borderRadius:8, fontSize:12,
                  color:TX2, border:`1px solid ${BR2}`,
                  background:"transparent", textDecoration:"none",
                }}>Anmelden</Link>
                <Link href="/auth/register" style={{
                  padding:"6px 15px", borderRadius:8, fontSize:12, fontWeight:500,
                  background:G, color:"#0a0808", textDecoration:"none",
                  letterSpacing:"-.01em",
                }}>Registrieren</Link>
              </>
            )}
          </div>

          {/* Mobile: Premium pill + Hamburger */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }} className="nav-mobile">
            <Link href="/dashboard/premium" style={{
              padding:"4px 10px", borderRadius:7,
              fontSize:11, fontWeight:600,
              background:G08, color:G,
              border:`1px solid ${G18}`, textDecoration:"none",
            }}>✦</Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width:36, height:36, borderRadius:9,
                background:menuOpen ? "rgba(255,255,255,0.06)" : "transparent",
                border:`1px solid ${menuOpen ? BR2 : "rgba(255,255,255,0.06)"}`,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:5,
                cursor:"pointer", padding:0,
                transition:"all .15s",
              }}
              aria-label="Menü"
            >
              <span style={{
                display:"block", width:16, height:1.5,
                background:menuOpen ? G : TX2,
                borderRadius:1,
                transform:menuOpen ? "rotate(45deg) translate(0,5px)" : "none",
                transition:"all .2s",
              }}/>
              <span style={{
                display:"block", width:16, height:1.5,
                background:menuOpen ? G : TX2,
                borderRadius:1,
                opacity:menuOpen ? 0 : 1,
                transition:"all .2s",
              }}/>
              <span style={{
                display:"block", width:16, height:1.5,
                background:menuOpen ? G : TX2,
                borderRadius:1,
                transform:menuOpen ? "rotate(-45deg) translate(0,-5px)" : "none",
                transition:"all .2s",
              }}/>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            marginTop:8,
            background:"rgba(10,10,10,0.97)",
            border:`1px solid ${BR2}`,
            borderRadius:18,
            padding:"8px",
            backdropFilter:"blur(36px)",
            WebkitBackdropFilter:"blur(36px)",
          }}>
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} style={{
                  display:"flex", alignItems:"center",
                  padding:"12px 16px", borderRadius:12,
                  fontSize:15, fontWeight:400,
                  color: active ? G : TX1,
                  textDecoration:"none",
                  background: active ? G08 : "transparent",
                  borderLeft: active ? `2px solid ${G}` : "2px solid transparent",
                  transition:"all .1s",
                }}>
                  {l.label}
                </Link>
              );
            })}
            <div style={{ borderTop:`1px solid rgba(255,255,255,0.05)`, margin:"8px 0 4px", padding:"8px 0 0" }}>
              {user ? (
                <button onClick={signOut} style={{
                  display:"block", width:"100%", padding:"12px 16px",
                  borderRadius:12, fontSize:15, color:TX2,
                  background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
                }}>Abmelden</button>
              ) : (
                <>
                  <Link href="/auth/login" style={{
                    display:"block", padding:"12px 16px", borderRadius:12,
                    fontSize:15, color:TX2, textDecoration:"none",
                  }}>Anmelden</Link>
                  <Link href="/auth/register" style={{
                    display:"block", padding:"12px 16px", borderRadius:12, marginTop:4,
                    fontSize:15, fontWeight:500,
                    background:G, color:"#0a0808", textDecoration:"none",
                    textAlign:"center",
                  }}>Kostenlos registrieren</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none  !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none  !important; }
          .nav-mobile  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
