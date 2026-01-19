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
  addProcessPoints,
  getLeaderboard,
  Profile,
} from './services/supabase';

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

  if (showAvatarSelection) {
    return <AvatarSelection onSelectAvatar={handleSelectAvatar} />;
  }

  if (showConveyorGame) {
    return (
      <div className="min-h-screen bg-white">
        <Header profileName={profile?.username} />
        <ConveyorBeltGame
          onGameComplete={(finalScore) => {
            setShowConveyorGame(false);
          }}
          onAddPoints={handleAddPoints}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header profileName={profile?.username} />
      {profile && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-6 sticky top-16 z-30 shadow-md">
          <div className="container mx-auto">
            <PlayerProfile profile={profile} />
          </div>
        </div>
      )}
      <HeroSection onStart={handleStart} />
      <section className="py-12 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto max-w-4xl text-center">
          <button
            onClick={() => setShowConveyorGame(true)}
            className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            <span className="text-3xl">🎮</span>
            Müll-Sortier Spiel starten
          </button>
        </div>
      </section>
      <div ref={processSectionRef}>
        <ProcessSection
          profileId={profile?.id}
          onAddPoints={handleAddPoints}
          selectedStep={selectedTopicId}
          onSelectStep={setSelectedTopicId}
        />
      </div>
      <QuizSection
        profileId={profile?.id}
        selectedTopicId={selectedTopicId}
        onQuizComplete={handleQuizComplete}
      />
      <Leaderboard players={leaderboard} />
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-300">
            Erstellt für ein Schulprojekt • Werde auch du zum Recycling-Helden! 🌱
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
