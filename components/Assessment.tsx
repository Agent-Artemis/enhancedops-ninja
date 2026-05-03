'use client';

import { useState } from 'react';

const HEALTHCARE_QUESTIONS = [
  'How many hours per week on manual billing and claims?',
  'Do you have HIPAA-compliant voice systems?',
  'How much time on insurance verification?',
  'What % of revenue goes to AR follow-up?',
  'Do you have consolidated patient records?',
  'Are you offering CCM or RPM?',
  'How transparent are your dashboards?',
  'How many manual tasks could be automated?',
];

const BUSINESS_QUESTIONS = [
  'How many hours per week on repetitive admin tasks?',
  'Do you have clear visibility into KPIs?',
  'How efficient is team onboarding?',
  'What % of operations could be automated?',
  'Do you have documented SOPs?',
];

export default function Assessment({
  type,
  onComplete,
}: {
  type: 'healthcare' | 'business';
  onComplete: (score: number, gaps: string[], contact: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const questions = type === 'healthcare' ? HEALTHCARE_QUESTIONS : BUSINESS_QUESTIONS;

  const handleAnswer = (idx: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      alert('Please enter your name and email');
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions');
      return;
    }

    // Simple scoring
    const answerStr = Object.values(answers).join(' ').toLowerCase();
    const score = Math.min(100, 50 + (answerStr.match(/no|manual|hours|not/g) || []).length * 10);

    // Generate gaps
    const gaps = [];
    if (type === 'healthcare') {
      if (answerStr.includes('no') && answerStr.includes('hipaa')) gaps.push('Missing HIPAA-compliant voice systems');
      if (answerStr.includes('manual') || answerStr.includes('hours')) gaps.push('Manual billing consuming too much time');
      if (answerStr.includes('no') && answerStr.includes('ccm')) gaps.push('Not leveraging CCM/RPM revenue');
    } else {
      if (answerStr.includes('hours')) gaps.push('Too much time on manual admin tasks');
      if (answerStr.includes('no') && answerStr.includes('sop')) gaps.push('No documented SOPs');
    }

    if (gaps.length === 0) gaps.push('Operations review recommended');

    onComplete(score, gaps.slice(0, 4), { name, email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-b from-[#0a0e27] to-[#141829]">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white mb-8">
          {type === 'healthcare' ? 'Healthcare' : 'Business'} Assessment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <label className="block text-white font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white mb-4"
              placeholder="Your name"
            />

            <label className="block text-white font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
              placeholder="you@company.com"
            />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <label className="block text-white font-semibold mb-3">
                  {idx + 1}. {q}
                </label>
                <div className="space-y-2">
                  {['Yes', 'No', 'Partially', 'Not sure'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={opt}
                        checked={answers[idx] === opt}
                        onChange={() => handleAnswer(idx, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Get Your Results
          </button>
        </form>
      </div>
    </div>
  );
}
