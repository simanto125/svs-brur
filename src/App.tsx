import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import JoinForm from '@/components/JoinForm';
import MembersDirectory from '@/components/MembersDirectory';
import Committee from '@/components/Committee';
import Advisors from '@/components/Advisors';
import Festivals from '@/components/Festivals';
import Events from '@/components/Events';
import Gallery from '@/components/Gallery';
import Books from '@/components/Books';
import Quizzes from '@/components/Quizzes';
import Reveal from '@/components/ui/Reveal';
import CertificatePage from '@/pages/CertificatePage';
import NoticeBoard from '@/components/NoticeBoard';
import Footer from '@/components/Footer';
import AdminPortal from '@/pages/AdminPortal';
import JoinCommittee from '@/pages/JoinCommittee';
import { useHashRoute } from '@/hooks/useHashRoute';
import EntryGate from '@/components/EntryGate';
import { isSoundEnabled, toggleSound } from '@/lib/sound';

export default function App() {
  const { route } = useHashRoute();
  const [entered, setEntered] = useState(false);

  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-cream-50">
        <AdminPortal />
      </div>
    );
  }

  if (route.startsWith('certificate/')) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar onLogoClick={() => {}} />
        <CertificatePage code={route.slice('certificate/'.length)} />
        <Footer />
      </div>
    );
  }

  if (route === 'join-committee') {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar onLogoClick={() => {}} />
        <JoinCommittee />
        <Footer />
      </div>
    );
  }

  if (!entered) return <EntryGate onComplete={() => setEntered(true)} />;

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar onLogoClick={() => {}} />
      <main>
        <Hero />
        <Reveal><About /></Reveal>
        <Reveal><Festivals /></Reveal>
        <Reveal><JoinForm /></Reveal>
        <Reveal><MembersDirectory /></Reveal>
        <Reveal><Committee /></Reveal>
        <Reveal><Advisors /></Reveal>
        <Reveal><Events /></Reveal>
        <Reveal><Gallery /></Reveal>
        <Reveal><Books /></Reveal>
        <Reveal><Quizzes /></Reveal>
        <Reveal><NoticeBoard /></Reveal>
      </main>
      <Footer />
      <AmbientSoundToggle />
    </div>
  );
}

function AmbientSoundToggle() {
  const [enabled, setEnabled] = useState(isSoundEnabled);
  useEffect(() => { if (!enabled) toggleSound(false); }, [enabled]);
  const change = () => { const next = !enabled; setEnabled(next); toggleSound(next); };
  return <button type="button" onClick={change} aria-label={enabled ? 'Mute ambient sound' : 'Unmute ambient sound'} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/90 px-3 py-2 text-xs font-semibold text-navy-700 shadow-soft backdrop-blur transition hover:border-saffron-400 hover:text-saffron-700">{enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}{enabled ? 'Sound on' : 'Muted'}</button>;
}
