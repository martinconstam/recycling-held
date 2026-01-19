import { useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

const AVATARS = [
  { icon: '🦸', name: 'Super Held' },
  { icon: '🌱', name: 'Öko Warrior' },
  { icon: '♻️', name: 'Recycling Pro' },
  { icon: '🌍', name: 'Welt Retter' },
  { icon: '🧑‍🔬', name: 'Wissenschaftler' },
  { icon: '👨‍💼', name: 'Profi' },
  { icon: '🎯', name: 'Fokus Master' },
  { icon: '⚡', name: 'Speed Runner' },
  { icon: '🎨', name: 'Kreative Seele' },
  { icon: '🏆', name: 'Champion' },
];

interface AvatarSelectionProps {
  onSelectAvatar: (username: string, avatarIndex: number) => void;
}

export default function AvatarSelection({
  onSelectAvatar,
}: AvatarSelectionProps) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (username.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein');
      return;
    }

    if (username.trim().length > 20) {
      setError('Name darf maximal 20 Zeichen lang sein');
      return;
    }

    setError('');
    setSubmitted(true);
    onSelectAvatar(username.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Werde zum Recycling-Helden!</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Wähle deinen Avatar
          </h2>
          <p className="text-gray-600">
            Personalisiere dein Spielerlebnis und sammle Punkte!
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Dein Name:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="z.B. Recycling-Max"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
              error
                ? 'border-red-500 bg-red-50'
                : 'border-green-300 focus:border-green-600 bg-green-50'
            }`}
            maxLength={20}
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <p className="text-gray-500 text-sm mt-2">
            {username.length}/20 Zeichen
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-4">
            Wähle deinen Avatar:
          </label>
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(index)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 border-2 ${
                  selectedAvatar === index
                    ? 'border-green-500 bg-green-100 scale-110 shadow-lg'
                    : 'border-gray-200 bg-gray-50 hover:border-green-300'
                }`}
                title={avatar.name}
              >
                {avatar.icon}
              </button>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm mt-3">
            {AVATARS[selectedAvatar].name}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            submitted
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          <Trophy className="w-5 h-5" />
          Spiel starten!
        </button>
      </div>
    </div>
  );
}
