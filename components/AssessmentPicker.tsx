export default function AssessmentPicker({
  onSelect,
}: {
  onSelect: (type: 'healthcare' | 'business') => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0e27] to-[#141829]">
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl font-bold text-white mb-4 text-center">Which Assessment?</h2>
        <p className="text-center text-slate-300 mb-12">Choose the assessment type that matches your business.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Healthcare */}
          <button
            onClick={() => onSelect('healthcare')}
            className="bg-slate-800 border border-slate-700 hover:border-blue-500 p-8 rounded-lg text-left transition-colors"
          >
            <div className="text-3xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-white mb-3">Healthcare Clinics</h3>
            <p className="text-slate-300 mb-4">For medical clinics, dental practices, therapy centers.</p>
            <div className="text-blue-400 font-semibold">Start Assessment →</div>
          </button>

          {/* Business */}
          <button
            onClick={() => onSelect('business')}
            className="bg-slate-800 border border-slate-700 hover:border-blue-500 p-8 rounded-lg text-left transition-colors"
          >
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-white mb-3">General Business</h3>
            <p className="text-slate-300 mb-4">For service businesses, agencies, consultancies.</p>
            <div className="text-blue-400 font-semibold">Start Assessment →</div>
          </button>
        </div>
      </div>
    </div>
  );
}
