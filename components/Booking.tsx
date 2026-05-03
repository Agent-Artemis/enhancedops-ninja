export default function Booking({ contact }: { contact: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0e27] to-[#141829]">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white mb-4">Schedule Your Assessment</h2>
        <p className="text-slate-300 mb-8">Pick a time that works for you.</p>

        {/* Cal.com iframe */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-6">
          <iframe
            src="https://cal.com/agentartemis?embed=true"
            width="100%"
            height="600"
            frameBorder="0"
            style={{ background: '#141829' }}
          ></iframe>
        </div>

        <p className="text-center text-slate-400 text-sm">
          Questions? Email jeff@enhancedops.ninja
        </p>
      </div>
    </div>
  );
}
