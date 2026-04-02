export default function Footer() {
  return (
    <footer className="border-t border-[var(--br-1)] py-16 px-10 text-xs text-[var(--tx-3)]">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="font-medium tracking-tight text-[var(--g)]">PokéDax</div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-center md:text-left">
          <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Twitter</a>
          <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Discord</a>
          <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Datenschutz</a>
          <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Impressum</a>
          <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Kontakt</a>
        </div>

        <div className="text-center md:text-right">
          © 2026 PokéDax — For serious collectors
        </div>
      </div>
    </footer>
  );
}