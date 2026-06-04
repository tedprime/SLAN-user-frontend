export default function AuthFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-4 text-center text-[11px] font-body text-neutral-400 border-t border-neutral-100 mt-auto bg-white/40">
      © {currentYear} School Leadership Academy Nigeria (SLAN). Accredited by TRCN.
    </footer>
  );
}