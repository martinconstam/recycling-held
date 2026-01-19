import { Trophy, Medal, Star } from 'lucide-react';
import { Profile } from '../services/supabase';

const AVATARS = [
  '🦸',
  '🌱',
  '♻️',
  '🌍',
  '🧑‍🔬',
  '👨‍💼',
  '🎯',
  '⚡',
  '🎨',
  '🏆',
];

interface LeaderboardProps {
  players: Profile[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const getMedalIcon = (position: number) => {
    if (position === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return <Star className="w-6 h-6 text-blue-400" />;
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Rangliste</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Top Recycling-Helden
          </h2>
        </div>

        {players.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              Noch keine Spieler! Sei der Erste!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-5 rounded-2xl shadow-lg transition-all duration-300 ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400'
                      : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400'
                        : 'bg-white border border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                  {getMedalIcon(index)}
                </div>

                <div className="text-4xl">{AVATARS[player.avatar_index]}</div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {player.username}
                  </h3>
                  <div className="flex gap-3 text-sm text-gray-600">
                    <span>Level {player.level}</span>
                    <span className="text-yellow-600 font-semibold">
                      {player.total_points} Punkte
                    </span>
                  </div>
                </div>

                {index === 0 && (
                  <div className="text-3xl animate-bounce">👑</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
