import { Leaf } from 'lucide-react';
import { Profile } from '../services/supabase';

const AVATARS = [
  '🦸', '🌱', '♻️', '🌍', '🧑‍🔬', 
  '👨‍💼', '🎯', '⚡', '🎨', '🏆'
];

interface HeaderProps {
  profile: Profile | null;
}

export default function Header({ profile }: HeaderProps) {
  // Progress Calculation
  const nextLevelPoints = profile ? profile.level * 100 : 100;
  const currentLevelPoints = profile ? (profile.level - 1) * 100 : 0;
  const progressPercent = profile 
    ? ((profile.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    : 0;

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg sticky top-0 z-50 h-18">
      <div className="container mx-auto px-4 py-3 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Leaf className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold leading-tight">Der Recycling-Held</h1>
              <p className="text-green-100 text-[10px] md:text-xs hidden md:block">
                Spielerisches Recycling-Abenteuer
              </p>
            </div>
          </div>
          
          {profile && (
            <div className="flex items-center gap-3 bg-white/10 p-2 pl-4 rounded-xl border border-white/20 backdrop-blur-sm">
                {/* Info Block */}
                <div className="flex flex-col items-end justify-center">
                    <div className="flex items-center gap-2 text-sm leading-none mb-1">
                        <span className="font-bold text-white shadow-black drop-shadow-sm">{profile.username}</span>
                        <span className="bg-yellow-500 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            LVL {profile.level}
                        </span>
                    </div>
                    {/* Points & Progress */}
                    <div className="w-32 flex flex-col items-end gap-0.5">
                        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                             <div 
                                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                             />
                        </div>
                        <span className="text-[10px] text-green-100 font-mono">
                            {profile.total_points} / {nextLevelPoints} XP
                        </span>
                    </div>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl shadow-inner border-2 border-green-200">
                    {AVATARS[profile.avatar_index] || '👤'}
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
