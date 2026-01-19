import { useRef, useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProcessSection from './components/ProcessSection';
import QuizSection from './components/QuizSection';
import AvatarSelection from './components/AvatarSelection';
import Leaderboard from './components/Leaderboard';
import ConveyorBeltGame from './components/ConveyorBeltGame';
import OceanCleanupGame from './components/OceanCleanupGame';
import {
  getOrCreateProfile,
  updatePoints,
  updateQuizScore,
  getLeaderboard,
  Profile,
} from './services/supabase';
import { Gamepad2, BookOpen, Trophy } from 'lucide-react';

function App() {
  const processSectionRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [showAvatarSelection, setShowAvatarSelection] = useState(true);
  
  // Game States
  const [activeGame, setActiveGame] = useState<'conveyor' | 'ocean' | null>(null);

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  useEffect(() => {
    if (profile) {
      loadLeaderboard();
    }
  }, [profile]);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(10);
    setLeaderboard(data);
  };

  const handleSelectAvatar = async (username: string, avatarIndex: number) => {
    const newProfile = await getOrCreateProfile(username, avatarIndex);
    setProfile(newProfile);
    setShowAvatarSelection(false);
    await loadLeaderboard();
  };

  const handleAddPoints = async (points: number) => {
    if (!profile) return;
    const updated = await updatePoints(profile.id, points);
    if (updated) {
      setProfile(updated);
      await loadLeaderboard();
    }
  };

  const handleQuizComplete = async (correctAnswers: number, points: number) => {
    if (!profile) return;
    await updateQuizScore(profile.id, correctAnswers);
    await handleAddPoints(points);
  };

  const handleStart = () => {
    processSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Screens ---

  if (showAvatarSelection) {
    return <AvatarSelection onSelectAvatar={handleSelectAvatar} />;
  }

  if (activeGame === 'conveyor') {
    return (
      <div className="min-h-screen bg-white">
        <Header profile={profile} />
        <ConveyorBeltGame
          onGameComplete={() => setActiveGame(null)}
          onAddPoints={handleAddPoints}
        />
        <div className="text-center pb-8 sticky bottom-0 pointer-events-none">
           <button onClick={() => setActiveGame(null)} className="pointer-events-auto text-gray-400 hover:text-gray-600 font-bold underline">Spiel verlassen</button>
        </div>
      </div>
    );
  }

  if (activeGame === 'ocean') {
    return (
      <div className="min-h-screen bg-sky-50">
        <OceanCleanupGame
          onGameComplete={() => setActiveGame(null)}
          onAddPoints={handleAddPoints}
          onBack={() => setActiveGame(null)}
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header & Navigation */}
      {/* 1. Header & Navigation */}
      <Header profile={profile} />
      
      {/* 2. Hero Introduction (previously sticky dashboard removed) */}
      <main>
        <HeroSection onStart={handleStart} />

        {/* 4. Action Section: Games */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-y border-blue-100">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6">
                <Gamepad2 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Interaktives Training</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Wähle ein Spiel und beweise dein Können! Sammle Punkte für die Bestenliste.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Game Card 1: Sorting */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                 <div className="mb-6 p-6 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                   <span className="text-6xl">♻️</span>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Müll-Sortierer</h3>
                 <p className="text-gray-500 mb-8 flex-grow">
                   Sortiere den Müll auf dem Förderband in die richtigen Tonnen. Schnell und präzise!
                 </p>
                 <button
                    onClick={() => setActiveGame('conveyor')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all transform group-hover:-translate-y-1"
                  >
                    Jetzt Sortieren
                 </button>
              </div>

              {/* Game Card 2: Ocean */}
              <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                 <div className="mb-6 p-6 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                   <span className="text-6xl">🌊</span>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Ozean-Retter</h3>
                 <p className="text-gray-500 mb-8 flex-grow">
                   Das Meer ist voller Müll! Fange ihn mit deinem Netz auf, bevor er den Meeresgrund verschmutzt.
                 </p>
                 <button
                    onClick={() => setActiveGame('ocean')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform group-hover:-translate-y-1"
                  >
                    Meer Retten
                 </button>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Learning Section */}
        <div ref={processSectionRef} className="py-16 bg-white">
          <div className="container mx-auto px-4 mb-8 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
               <BookOpen className="w-4 h-4" />
               <span>Wissen</span>
             </div>
             <h2 className="text-4xl font-extrabold text-gray-900">Wie funktioniert Recycling?</h2>
          </div>
          
          <ProcessSection
            profileId={profile?.id}
            onAddPoints={handleAddPoints}
            selectedStep={selectedTopicId}
            onSelectStep={setSelectedTopicId}
          />
        </div>

        {/* 6. Quiz Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
          <QuizSection
            profileId={profile?.id}
            selectedTopicId={selectedTopicId}
            onQuizComplete={handleQuizComplete}
          />
        </div>

        {/* 7. Leaderboard */}
        <div className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center mb-10">
             <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
             <h2 className="text-4xl font-black text-gray-900">Die Recycling-Champions</h2>
          </div>
          <Leaderboard players={leaderboard} />
        </div>
      </main>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center">
          <p className="font-medium text-lg mb-2">Die Recycling-Helden 🌱</p>
          <p className="text-sm opacity-60">
            Erstellt für ein Schulprojekt • Gemeinsam für eine saubere Zukunft.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
