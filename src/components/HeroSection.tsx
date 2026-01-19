import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-green-50 to-white py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Willkommen beim Recycling-Abenteuer! 🌍
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Jeden Tag werfen wir Dinge weg – aber was passiert dann eigentlich damit?
            Recycling ist wie Zauberei: Aus alten Dingen werden neue! Das spart Energie,
            schützt die Natur und macht unseren Planeten sauberer.
          </p>
          <p className="text-base md:text-lg text-gray-500 mb-10">
            Begleite uns auf einer spannenden Reise durch den Recycling-Kreislauf
            und werde selbst zum Recycling-Helden!
          </p>
          <button
            onClick={onStart}
            className="group bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-10 py-5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              Los geht's!
              <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
