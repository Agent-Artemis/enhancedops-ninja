'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import AssessmentPicker from '@/components/AssessmentPicker';
import Assessment from '@/components/Assessment';
import Results from '@/components/Results';
import Booking from '@/components/Booking';

type Stage = 'hero' | 'picker' | 'assessment' | 'results' | 'booking';

export default function Home() {
  const [stage, setStage] = useState<Stage>('hero');
  const [type, setType] = useState<'healthcare' | 'business' | null>(null);
  const [results, setResults] = useState<any>(null);
  const [contact, setContact] = useState<{ name: string; email: string } | null>(null);

  const handleStartAssessment = (selectedType: 'healthcare' | 'business') => {
    setType(selectedType);
    setStage('assessment');
  };

  const handleAssessmentComplete = (score: number, gaps: string[], contactInfo: { name: string; email: string }) => {
    setResults({ score, gaps, type });
    setContact(contactInfo);
    setStage('results');
  };

  const handleBooking = () => {
    setStage('booking');
  };

  return (
    <main className="min-h-screen bg-[#0a0e27]">
      {stage === 'hero' && <Hero onStart={() => setStage('picker')} />}
      {stage === 'picker' && <AssessmentPicker onSelect={handleStartAssessment} />}
      {stage === 'assessment' && type && <Assessment type={type} onComplete={handleAssessmentComplete} />}
      {stage === 'results' && results && contact && <Results results={results} contact={contact} onBooking={handleBooking} />}
      {stage === 'booking' && contact && <Booking contact={contact} />}
    </main>
  );
}
