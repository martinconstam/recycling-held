import { useState, useEffect, useRef } from 'react';
import { Trash2, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface Waste {
  id: number;
  type: string;
  icon: string;
  correctBin: string;
  position: number;
  falling: boolean;
  binColor?: string;
}

interface BinItem {
  name: string;
  icon: string;
  color: string;
  accepts: string[];
}

const WASTE_ITEMS = [
  { type: 'paper', icon: '📰', name: 'Papier', correctBin: 'blue' },
  { type: 'plastic', icon: '🍾', name: 'Plastik', correctBin: 'yellow' },
  { type: 'glass', icon: '🥫', name: 'Glas', correctBin: 'green' },
  { type: 'metal', icon: '🥫', name: 'Metall', correctBin: 'gray' },
  { type: 'organic', icon: '🍎', name: 'Bio', correctBin: 'brown' },
  { type: 'electronics', icon: '📱', name: 'Elektronik', correctBin: 'red' },
];

const BINS: Record<string, BinItem> = {
  blue: {
    name: 'Papier',
    icon: '📰',
    color: 'from-blue-400 to-blue-600',
    accepts: ['paper'],
  },
  yellow: {
    name: 'Plastik',
    icon: '🍾',
    color: 'from-yellow-400 to-yellow-600',
    accepts: ['plastic'],
  },
  green: {
    name: 'Glas',
    icon: '🥫',
    color: 'from-green-400 to-green-600',
    accepts: ['glass'],
  },
  gray: {
    name: 'Metall',
    icon: '🔩',
    color: 'from-gray-400 to-gray-600',
    accepts: ['metal'],
  },
  brown: {
    name: 'Bio',
    icon: '🌱',
    color: 'from-amber-600 to-amber-800',
    accepts: ['organic'],
  },
  red: {
    name: 'Elektronik',
    icon: '📱',
    color: 'from-red-500 to-red-700',
    accepts: ['electronics'],
  },
};

const BIN_COLORS = {
  blue: '#3B82F6',
  yellow: '#FBBF24',
  green: '#10B981',
  gray: '#9CA3AF',
  brown: '#92400E',
  red: '#EF4444',
};

interface ConveyorBeltGameProps {
  onGameComplete: (finalScore: number) => void;
  onAddPoints: (points: number) => void;
}

export default function ConveyorBeltGame({
  onGameComplete,
  onAddPoints,
}: ConveyorBeltGameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wasteItems, setWasteItems] = useState<Waste[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [hearts, setHearts] = useState(3);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
    x: number;
    y: number;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedWaste, setScannedWaste] = useState<string | null>(null);
  const wasteIdRef = useRef(0);

  useEffect(() => {
    if (!gameActive || hearts <= 0) {
      setGameActive(false);
      return;
    }
  }, [gameActive, hearts]);

  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      const newWaste: Waste = {
        id: wasteIdRef.current++,
        type: WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)].type,
        icon: WASTE_ITEMS.find(
          (w) =>
            w.type ===
            WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)].type
        )?.icon!,
        correctBin: WASTE_ITEMS.find(
          (w) =>
            w.type ===
            WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)].type
        )?.correctBin!,
        position: Math.random() * 80,
        falling: false,
      };
      setWasteItems((prev) => [...prev, newWaste]);
    }, 1500);

    return () => clearInterval(spawnInterval);
  }, [gameActive]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setWasteItems((prev) =>
        prev
          .map((waste) => ({
            ...waste,
            position: waste.position + 1.5,
          }))
          .filter((waste) => waste.position < 100)
      );
    }, 30);

    return () => clearInterval(animationInterval);
  }, []);

  const handleWasteClick = (wasteId: number, wasteType: string) => {
    if (selectedBin === null || !gameActive) return;

    const waste = wasteItems.find((w) => w.id === wasteId);
    if (!waste) return;

    const isCorrect = BINS[selectedBin].accepts.includes(wasteType);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      onAddPoints(1);
      setFeedback({
        message: '+1 Punkt! Richtig!',
        type: 'correct',
        x: waste.position,
        y: 70,
      });
      playSound('correct');
    } else {
      setCombo(0);
      onAddPoints(-1);
      setHearts((prev) => {
        const newHearts = prev - 1;
        if (newHearts <= 0) {
          setGameActive(false);
        }
        return newHearts;
      });
      setFeedback({
        message: '❌ Falsch!',
        type: 'wrong',
        x: waste.position,
        y: 70,
      });
      playSound('wrong');
    }

    setWasteItems((prev) => prev.filter((w) => w.id !== wasteId));
    setSelectedBin(null);

    setTimeout(() => setFeedback(null), 1500);
  };

  const playSound = (type: 'correct' | 'wrong') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else {
      oscillator.frequency.value = 300;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const restartGame = () => {
    setScore(0);
    setCombo(0);
    setHearts(3);
    setGameActive(true);
    setWasteItems([]);
    setSelectedBin(null);
    setFeedback(null);
    setScannedWaste(null);
  };

  const scanWaste = (type: string) => {
    const wasteInfo = WASTE_ITEMS.find((w) => w.type === type);
    if (wasteInfo) {
      setScannedWaste(wasteInfo.correctBin);
      setTimeout(() => setScannedWaste(null), 3000);
    }
  };

  if (!gameActive && hearts <= 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Spiel vorbei!
            </h2>
            <p className="text-5xl font-bold text-green-600 mb-4">{score}</p>
            <p className="text-xl text-gray-600 mb-8">
              {score > 50
                ? 'Großartig! Du bist ein Müll-Sortier-Experte!'
                : score > 30
                  ? 'Gut gemacht! Immer besser!'
                  : 'Guter Anfang! Übe noch mehr!'}
            </p>
            <button
              onClick={() => {
                restartGame();
                onGameComplete(score);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Zurück zum Menü
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-green-50 to-blue-50 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Förderband Sortier-Spiel
              </h2>
              <p className="text-gray-600">
                Sortiere den Müll in die richtige Tonne!
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                Punkte: {score}
              </div>
              <div className="text-2xl font-bold text-red-600">
                Herzen: {'❤️'.repeat(hearts)}
              </div>
              {combo > 0 && (
                <div className="text-xl font-bold text-green-600">
                  Combo: {combo}x
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              {soundEnabled ? 'Sound an' : 'Sound aus'}
            </button>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Neustarten
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden relative">
          <div className="relative h-96 bg-gradient-to-b from-gray-100 to-gray-50 rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              {wasteItems.map((waste) => (
                <button
                  key={waste.id}
                  onClick={() => handleWasteClick(waste.id, waste.type)}
                  className={`absolute text-5xl cursor-pointer hover:scale-125 transition-transform duration-200 ${
                    selectedBin ? 'opacity-100' : 'opacity-75'
                  }`}
                  style={{
                    left: `${waste.position}%`,
                    top: '20%',
                  }}
                  title={
                    WASTE_ITEMS.find((w) => w.type === waste.type)?.name
                  }
                >
                  {waste.icon}
                </button>
              ))}

              {feedback && (
                <div
                  className={`absolute text-center font-bold text-lg pointer-events-none animate-bounce ${
                    feedback.type === 'correct'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                  style={{
                    left: `${feedback.x}%`,
                    top: `${feedback.y}%`,
                  }}
                >
                  {feedback.message}
                </div>
              )}

              {scannedWaste && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/70 text-white px-6 py-4 rounded-lg text-center animate-pulse">
                    <p className="font-bold text-lg mb-2">Müll in diese Tonne!</p>
                    <p className="text-5xl">{BINS[scannedWaste].icon}</p>
                    <p className="font-bold text-lg mt-2">{BINS[scannedWaste].name}</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-gray-400 to-gray-600 pointer-events-none">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)',
                  animation: 'slide 2s linear infinite'
                }} />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(40px); }
          }
        `}</style>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(BINS).map(([binKey, bin]) => (
            <div key={binKey} className="flex flex-col gap-2">
              <button
                onClick={() =>
                  setSelectedBin(selectedBin === binKey ? null : binKey)
                }
                className={`p-4 rounded-2xl transition-all duration-300 flex-1 ${
                  selectedBin === binKey
                    ? `bg-gradient-to-br ${bin.color} text-white scale-110 shadow-2xl`
                    : `bg-white border-2 border-gray-200 hover:border-gray-400 shadow-md`
                }`}
              >
                <div className="text-5xl mb-2">{bin.icon}</div>
                <div
                  className={`font-bold text-sm ${
                    selectedBin === binKey ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {bin.name}
                </div>
                {selectedBin === binKey && (
                  <div
                    className={`text-xs mt-2 ${
                      selectedBin === binKey
                        ? 'text-white/90'
                        : 'text-gray-600'
                    }`}
                  >
                    Wählt: Klick auf Müll!
                  </div>
                )}
              </button>
              <button
                onClick={() => scanWaste(Object.keys(WASTE_ITEMS.reduce((acc: any, item) => {
                  if (item.correctBin === binKey) acc[item.type] = true;
                  return acc;
                }, {}))[0] || '')}
                className={`py-2 px-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedBin === binKey
                    ? `bg-gradient-to-br ${bin.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!gameActive}
              >
                📱 Scan
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Spielregeln
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              ✓ Wähle eine Mülltonne durch Klick (wird größer und farbig)
            </li>
            <li>
              ✓ Klicke dann auf den Müll, um ihn in die Tonne zu werfen
            </li>
            <li>✓ Oder nutze 📱 Scan um Hilfe zu bekommen!</li>
            <li>✓ Richtig sortiert = +1 Punkt</li>
            <li>✗ Falsch sortiert = -1 Herz</li>
            <li>❤️ Du hast 3 Herzen - 3 Fehler = Spielende!</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
