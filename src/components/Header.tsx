import { Leaf } from 'lucide-react';

interface HeaderProps {
  profileName?: string;
}

export default function Header({ profileName }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Der Recycling-Held</h1>
              <p className="text-green-50 text-xs md:text-sm">
                Spielerisches Recycling-Abenteuer
              </p>
            </div>
          </div>
          {profileName && (
            <div className="text-right">
              <p className="text-sm text-green-100">Spieler:</p>
              <p className="font-bold text-lg">{profileName}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
