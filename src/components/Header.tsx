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
            <div className="flex items-center gap-4 bg-white/10 py-3 px-5 rounded-2xl border border-white/20 backdrop-blur-sm shadow-sm min-w-[350px]">
                {/* Avatar (Left) */}
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-4xl shadow-inner border-2 border-green-200 shrink-0">
                    {AVATARS[profile.avatar_index] || '👤'}
                </div>

                {/* Info Block (Right) */}
                <div className="flex flex-col flex-grow justify-center gap-1">
                    {/* Top Row: Name & Level */}
                    <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-lg shadow-black drop-shadow-sm truncate max-w-[180px]">
                            {profile.username}
                        </span>
                        <div className="flex items-baseline gap-1.5 text-yellow-300 drop-shadow-sm">
                           <span className="text-xs font-bold opacity-90 uppercase tracking-wide">Level</span>
                           <span className="text-2xl font-black leading-none">{profile.level}</span>
                        </div>
                    </div>
                    
                    {/* Bottom Row: Progress & Points */}
                    <div className="w-full">
                        <div className="flex justify-between text-xs text-green-50 mb-1 font-medium">
                           <span>Nächste Stufe</span>
                           <span>{profile.total_points} / {nextLevelPoints} Punkte</span>
                        </div>
                        <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden border border-white/10">
                             <div 
                                className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                             />
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
