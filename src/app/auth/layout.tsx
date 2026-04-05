import type { Metadata } from "next";
export const metadata: Metadata = { title: "Anmelden | pokédax" };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{position:"relative",minHeight:"100vh",background:"#09090b",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 15% 20%, rgba(212,168,67,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 75%, rgba(212,168,67,0.07) 0%, transparent 55%)"}}/>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}