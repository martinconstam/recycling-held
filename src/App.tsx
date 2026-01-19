import { useRef, useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProcessSection from './components/ProcessSection';
import QuizSection from './components/QuizSection';
import AvatarSelection from './components/AvatarSelection';
import PlayerProfile from './components/PlayerProfile';
import Leaderboard from './components/Leaderboard';
import ConveyorBeltGame from './components/ConveyorBeltGame';
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
  const [showConveyorGame, setShowConveyorGame] = useState(false);

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

  if (showConveyorGame) {
    return (
      <div className="min-h-screen bg-white">
        <Header profileName={profile?.username} />
        <ConveyorBeltGame
          onGameComplete={() => setShowConveyorGame(false)}
          onAddPoints={handleAddPoints}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header & Navigation */}
      <Header profileName={profile?.username} />
      
      {/* 2. User Dashboard (Sticky) */}
      {profile && (
        <div className="bg-white/80 backdrop-blur-md sticky top-16 z-40 border-b border-gray-100 shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4 py-3">
             <PlayerProfile profile={profile} />
          </div>
        </div>
      )}

      {/* 3. Hero Introduction */}
      <main>
        <HeroSection onStart={handleStart} />

        {/* 4. Action Section: Game */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-y border-blue-100">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6">
              <Gamepad2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Interaktives Training</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Beweise dein Können im Recycling-Simulator! Sortiere den Müll richtig und sammle Punkte für die Bestenliste.
            </p>
            
            <button
              onClick={() => setShowConveyorGame(true)}
              className="group relative inline-flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-10 py-5 rounded-2xl shadow-blue-500/30 shadow-xl transform transition-all hover:scale-105 hover:-translate-y-1"
            >
              <span className="text-2xl animate-bounce">🎮</span>
              <span>Spiel starten</span>
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40"></div>
            </button>
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
