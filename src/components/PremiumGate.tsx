"use client";
import Link from "next/link";
import { usePremium } from "@/hooks/usePremium";
export default function PremiumGate({ children }: { children: React.ReactNode }) {
  const { isPremium, loading } = usePremium();
  if (loading) return null;
  if (!isPremium) return (
    <div style={{textAlign:"center",padding:"48px",background:"#16161A",border:"0.5px solid rgba(212,168,67,0.2)",borderRadius:20}}>
      <div style={{fontSize:14,color:"#BEB9B0",marginBottom:16}}>Dieses Feature ist nur für Premium-Mitglieder verfügbar.</div>
      <Link href="/dashboard/premium" style={{display:"inline-block",padding:"10px 24px",borderRadius:12,background:"#C9A66B",color:"#0A0A0C",textDecoration:"none",fontSize:14}}>Premium werden ✦</Link>
    </div>
  );
  return <>{children}</>;
}
