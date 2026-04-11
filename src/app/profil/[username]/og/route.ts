import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // Load profile + portfolio value
  const { data: profile } = await sb.from("profiles")
    .select("id,username,is_premium,created_at")
    .eq("username", username)
    .single();

  let portfolioValue = 0;
  let cardCount = 0;
  if (profile?.id) {
    const { data: col } = await sb.from("user_collection")
      .select("quantity,cards!user_collection_card_id_fkey(price_market)")
      .eq("user_id", profile.id);
    portfolioValue = (col??[]).reduce((s:number,c:any)=>s+(c.cards?.price_market??0)*(c.quantity??1),0);
    cardCount = (col??[]).reduce((s:number,c:any)=>s+(c.quantity??1),0);
  }

  return new ImageResponse(
    <div style={{
      width:"100%",height:"100%",
      background:"#09090b",
      display:"flex",flexDirection:"column",
      justifyContent:"center",alignItems:"center",
      fontFamily:"Inter,sans-serif",
      position:"relative",
    }}>
      {/* Gold gradient top */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,transparent,#D4A843,transparent)",display:"flex"}}/>

      {/* Background glow */}
      <div style={{position:"absolute",top:"-20%",left:"10%",width:"40%",height:"60%",
        background:"radial-gradient(ellipse,rgba(212,168,67,0.15) 0%,transparent 70%)",display:"flex"}}/>

      {/* Logo */}
      <div style={{fontSize:16,color:"rgba(212,168,67,0.6)",letterSpacing:"-0.03em",marginBottom:32,display:"flex"}}>
        pokédax<span style={{color:"#D4A843"}}>.</span>
      </div>

      {/* Avatar */}
      <div style={{width:80,height:80,borderRadius:"50%",
        background:"rgba(212,168,67,0.12)",border:"1px solid rgba(212,168,67,0.25)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:32,color:"#D4A843",marginBottom:20,fontWeight:300}}>
        {username[0]?.toUpperCase()}
      </div>

      {/* Username */}
      <div style={{fontSize:36,fontWeight:300,color:"#ededf2",letterSpacing:"-0.04em",marginBottom:8,display:"flex"}}>
        @{username}
      </div>

      {/* Premium badge */}
      {profile?.is_premium && (
        <div style={{fontSize:12,color:"#D4A843",background:"rgba(212,168,67,0.1)",
          padding:"4px 14px",borderRadius:20,border:"1px solid rgba(212,168,67,0.2)",
          marginBottom:24,letterSpacing:"0.08em",display:"flex"}}>
          ✦ PREMIUM
        </div>
      )}

      {/* Stats */}
      {portfolioValue > 0 && (
        <div style={{display:"flex",gap:40,marginTop:16}}>
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{fontSize:28,fontWeight:300,color:"#D4A843",letterSpacing:"-0.04em",display:"flex"}}>
              {Math.round(portfolioValue).toLocaleString("de-DE")} €
            </div>
            <div style={{fontSize:12,color:"#62626f",marginTop:4,display:"flex"}}>Portfolio-Wert</div>
          </div>
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{fontSize:28,fontWeight:300,color:"#ededf2",letterSpacing:"-0.04em",display:"flex"}}>
              {cardCount}
            </div>
            <div style={{fontSize:12,color:"#62626f",marginTop:4,display:"flex"}}>Karten</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{position:"absolute",bottom:24,fontSize:12,color:"rgba(98,98,111,0.6)",display:"flex"}}>
        pokedax.de
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
