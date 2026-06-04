export default function AuthLeftPanel() {
  return (
    <div 
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center p-16 text-center items-center select-none"
      style={{
        
        background: "linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-900) 60%, var(--color-tertiary-500) 100%)"
      }}
    >
      {/* Ambient background glow effects matching screen_3.jpg */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[100px]" 
          style={{ backgroundColor: "var(--color-primary-300)" }}
        />
        <div 
          className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[120px]" 
          style={{ backgroundColor: "var(--color-secondary-400)" }}
        />
      </div>

      {/* Floating Device Image/Mockup Wrapper */}
      <div 
        className="w-full max-w-sm aspect-4/3 rounded-xl border p-4 mb-14 shadow-2xl backdrop-blur-xs flex items-center justify-center transition-transform duration-500 hover:scale-[1.01]"
        style={{ 
          backgroundColor: "rgba(0, 46, 0, 0.35)", // Primary-800 with transparency
          borderColor: "rgba(255, 255, 255, 0.12)" 
        }}
      >
        <div 
          className="w-full h-full rounded-lg border flex flex-col items-center justify-center p-4 relative overflow-hidden"
          style={{ 
            backgroundColor: "rgba(0, 82, 0, 0.45)", // Primary-600 with transparency
            borderColor: "rgba(255, 255, 255, 0.06)" 
          }}
        >
          {/* Internal simulated dashboard frame elements */}
          <span className="material-symbols-outlined text-white/15 text-5xl mb-2">dashboard</span>
          <div className="w-24 h-2 bg-white/10 rounded mb-1.5" />
          <div className="w-16 h-2 bg-white/10 rounded" />
        </div>
      </div>

      {/* Text Copy Group */}
      <div className="relative z-10 max-w-md">
        {/* Crisp white title string */}
        <h1 
          className="text-4xl font-bold font-headline leading-tight tracking-tight mb-4"
          style={{ color: "var(--color-neutral-50)" }}
        >
          Empowering Nigeria's Future Leaders.
        </h1>
        
        {/* Soft emerald description layer */}
        <p 
          className="text-sm font-500 font-body leading-relaxed max-w-md mx-auto text-balance"
          style={{ color: "var(--color-primary-200)" }}
        >
          Access TRCN & ANCOPPS accredited leadership modules designed for the next generation of academic excellence.
        </p>
      </div>

      {/* Muted structural shield graphic sitting in the lower right background */}
      <div 
        className="absolute bottom-6 right-12 pointer-events-none select-none mix-blend-lightbox"
        style={{ color: "var(--color-secondary-600)", opacity: 0.18 }}
      >
        <span className="material-symbols-outlined text-[130px] font-100">
          shield_with_heart
        </span>
      </div>
    </div>
  );
}