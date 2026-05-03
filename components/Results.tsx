export default function Results({
  results,
  contact,
  onBooking,
}: {
  results: any;
  contact: any;
  onBooking: () => void;
}) {
  const riskColor = results.score >= 70 ? 'text-red-400' : results.score >= 50 ? 'text-yellow-400' : 'text-green-400';
  const riskLabel = results.score >= 70 ? 'High Risk' : results.score >= 50 ? 'Moderate Risk' : 'Low Risk';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0e27] to-[#141829]">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white mb-8">Your Results</h2>

        {/* Score */}
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg mb-6 text-center">
          <div className={`text-6xl font-bold ${riskColor} mb-2`}>{results.score}</div>
          <div className={`text-xl font-semibold ${riskColor}`}>{riskLabel}</div>
        </div>

        {/* Gaps */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Gaps</h3>
          <ul className="space-y-3">
            {results.gaps.map((gap: string, idx: number) => (
              <li key={idx} className="flex gap-3 text-slate-300">
                <span className="text-orange-400">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
          <p className="text-slate-300 mb-6">
            Schedule a deep assessment to get a detailed action plan and ROI projections.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 p-4 rounded border border-slate-600">
              <p className="text-slate-400 text-sm mb-1">Quick Audit</p>
              <p className="text-2xl font-bold text-white">$250</p>
            </div>
            <div className="bg-slate-900 p-4 rounded border border-slate-600">
              <p className="text-slate-400 text-sm mb-1">Deep Assessment</p>
              <p className="text-2xl font-bold text-white">$2,500</p>
            </div>
          </div>
        </div>

        <button
          onClick={onBooking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mb-4"
        >
          Schedule Assessment
        </button>

        <p className="text-center text-slate-400 text-sm">
          Confirmation will be sent to {contact.email}
        </p>
      </div>
    </div>
  );
}
