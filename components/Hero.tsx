export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0e27] to-[#141829]">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-12">
          <img src="/logo.jpg" alt="Enhanced Ops Ninja" className="h-32 mx-auto" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-white mb-6">
          Your Operations Are Costing You Money
        </h1>

        <p className="text-xl text-slate-300 mb-8">
          Get a professional assessment in 10 minutes. See your score instantly. No credit card required.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg mb-12 transition-colors"
        >
          Start Assessment →
        </button>

        {/* Trust */}
        <div className="text-slate-400 text-sm space-y-1">
          <p>Built by Augeo LLC</p>
          <p>Powered by Artemis</p>
        </div>
      </div>
    </div>
  );
}
