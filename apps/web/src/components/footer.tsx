import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-surface flex flex-col md:flex-row justify-between items-center px-12 border-t border-outline/30">
      <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
        <div className="font-headline text-xl text-primary">Peerfolio</div>
        <p className="font-sans text-xs uppercase tracking-widest text-on-surface-variant">© 2024 Peerfolio. Curadoria para o Intelectual.</p>
      </div>
      
      <div className="flex gap-12 flex-wrap justify-center md:justify-end">
        <Link href="#" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Manifesto</Link>
        <Link href="#" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Termos</Link>
        <Link href="#" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Privacidade</Link>
        <Link href="#" className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Suporte</Link>
      </div>
    </footer>
  );
}
