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

interface PlayerProfileProps {
  profile: Profile;
}

export default function PlayerProfile({ profile }: PlayerProfileProps) {
  const nextLevelPoints = profile.level * 100;
  const currentLevelPoints = (profile.level - 1) * 100;
  const progressPercent =
    ((profile.total_points - currentLevelPoints) /
      (nextLevelPoints - currentLevelPoints)) *
    100;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-green-200 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-6xl bg-white rounded-2xl p-4 shadow-md border-2 border-green-200">
          {AVATARS[profile.avatar_index]}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800">{profile.username}</h3>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold text-blue-600">
                {profile.level}
              </span>
              <span className="text-gray-600 text-sm">Level</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold text-yellow-600">
                {profile.total_points}
              </span>
              <span className="text-gray-600 text-sm">Punkte</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 font-semibold">
            Fortschritt Level {profile.level}
          </span>
          <span className="text-gray-600">
            {profile.total_points - currentLevelPoints} /{' '}
            {nextLevelPoints - currentLevelPoints}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
