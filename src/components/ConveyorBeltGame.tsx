import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Heart, Trophy } from 'lucide-react';

// --- Types & Constants ---
interface WasteType {
  type: string;
  icon: string;
  name: string;
}

interface BinConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  accepts: string[];
}

const WASTE_TYPES: WasteType[] = [
  // Papier
  { type: 'paper', icon: '📰', name: 'Alte Zeitung' },
  { type: 'paper', icon: '📦', name: 'Karton' },
  { type: 'paper', icon: '📝', name: 'Papierblatt' },
  { type: 'paper', icon: '✉️', name: 'Briefumschlag' },
  { type: 'paper', icon: '🛍️', name: 'Papiertüte' },
  { type: 'paper', icon: '🧻', name: 'Klorolle (Pappe)' },

  // Plastik / Gelber Sack
  { type: 'plastic', icon: '🥤', name: 'Plastikbecher' },
  { type: 'plastic', icon: '🧴', name: 'Shampooflasche' },
  { type: 'plastic', icon: '🥡', name: 'Plastikbox' },
  { type: 'plastic', icon: '🧃', name: 'Saftkarton' },
  { type: 'plastic', icon: '🦷', name: 'Zahnbürste' },
  // { type: 'plastic', icon: '🍓', name: 'Obstschale' }, // REMOVED - Visual confusion

  // Glas
  { type: 'glass', icon: '🍷', name: 'Weinflasche' },
  { type: 'glass', icon: '🫙', name: 'Gurkenglas' },
  { type: 'glass', icon: '🥛', name: 'Milchflasche' },
  { type: 'glass', icon: '🍾', name: 'Sektflasche' },
  { type: 'glass', icon: '🏺', name: 'Parfumflakon' },

  // Metall
  { type: 'metal', icon: '🥫', name: 'Konservendose' },
  { type: 'metal', icon: '🥄', name: 'Alter Löffel' },
  { type: 'metal', icon: '🗝️', name: 'Schlüssel' },
  { type: 'metal', icon: '📎', name: 'Büroklammer' },
  { type: 'metal', icon: '🥤', name: 'Getränkedose' }, 

  // Bio / Organisch
  { type: 'organic', icon: '🍎', name: 'Apfelrest' },
  { type: 'organic', icon: '🍌', name: 'Banane' },
  { type: 'organic', icon: '🍂', name: 'Laub' },
  { type: 'organic', icon: '🥚', name: 'Eierschale' },
  { type: 'organic', icon: '🥀', name: 'Blumenreste' },
  { type: 'organic', icon: '🦴', name: 'Knochen' },
  { type: 'organic', icon: '🍓', name: 'Erdbeere' }, // Reclassified as Organic
];

const BINS: BinConfig[] = [
  { id: 'paper', name: 'Papier', icon: '🟦', color: 'border-blue-500', bgGradient: 'from-blue-100 to-blue-200', accepts: ['paper'] },
  { id: 'plastic', name: 'Plastik', icon: '🟨', color: 'border-yellow-500', bgGradient: 'from-yellow-100 to-yellow-200', accepts: ['plastic'] },
  { id: 'glass', name: 'Glas', icon: '🟩', color: 'border-green-500', bgGradient: 'from-green-100 to-green-200', accepts: ['glass'] },
  { id: 'metal', name: 'Metall', icon: '⚙️', color: 'border-gray-500', bgGradient: 'from-gray-200 to-gray-300', accepts: ['metal'] },
  { id: 'organic', name: 'Bio', icon: '🟫', color: 'border-amber-600', bgGradient: 'from-amber-100 to-amber-200', accepts: ['organic'] },
];

interface GameItem {
  id: number;
  data: WasteType;
  lane: number;
}

interface ConveyorBeltGameProps {
  onGameComplete: (finalScore: number) => void;
  onAddPoints: (points: number) => void;
}

export default function ConveyorBeltGame({ onGameComplete, onAddPoints }: ConveyorBeltGameProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [items, setItems] = useState<GameItem[]>([]);
  const [speed, setSpeed] = useState(6);
  const [spawnRate, setSpawnRate] = useState(2500);
  const [feedback, setFeedback] = useState<{ id: number; text: string; type: 'good' | 'bad'; x: number; y: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredBin, setHoveredBin] = useState<string | null>(null);

  const binRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemIdCounter = useRef(0);
  const beltRef = useRef<HTMLDivElement>(null);
  const spawnTimer = useRef<ReturnType<typeof setInterval>>();

  // Game Loop and Spawning
  useEffect(() => {
    if (!isPlaying) {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      setItems([]); // Clear items on stop
      return;
    }

    const spawnItem = () => {
      const randomWaste = WASTE_TYPES[Math.floor(Math.random() * WASTE_TYPES.length)];
      itemIdCounter.current += 1;
      
      const newItem: GameItem = {
        id: itemIdCounter.current,
        data: randomWaste,
        lane: Math.random() * 40 - 20,
      };

      setItems(prev => [...prev, newItem]);
    };

    spawnTimer.current = setInterval(spawnItem, spawnRate);

    return () => {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [isPlaying, spawnRate]);

  // Difficulty Scaling
  useEffect(() => {
    if (score > 10) { setSpeed(5); setSpawnRate(2000); }
    if (score > 25) { setSpeed(4); setSpawnRate(1500); }
    if (score > 50) { setSpeed(3); setSpawnRate(1200); }
  }, [score]);

  const playSound = (type: 'success' | 'fail') => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  };

  const checkCollision = (point: { x: number; y: number }) => {
    let foundBinId: string | null = null;
    binRefs.current.forEach((ref, binId) => {
      const rect = ref.getBoundingClientRect();
      if (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      ) {
        foundBinId = binId;
      }
    });
    return foundBinId;
  };

  const handleDrag = (_: any, info: PanInfo) => {
     const binId = checkCollision(info.point);
     setHoveredBin(binId);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, item: GameItem) => {
    setHoveredBin(null);
    const droppedInBin = checkCollision(info.point);

    if (droppedInBin) {
      verifySort(item, droppedInBin);
    }
  };

  const verifySort = (item: GameItem, binId: string) => {
    const bin = BINS.find(b => b.id === binId);
    if (!bin) return;

    const isCorrect = bin.accepts.includes(item.data.type);

    setItems(prev => prev.filter(i => i.id !== item.id));

    if (isCorrect) {
      const bonus = score > 0 && score % 10 === 0 ? 5 : 1;
      setScore(s => s + bonus);
      onAddPoints(bonus);
      playSound('success');
      showFeedback(item.id, 'Super!', 'good', binId);
    } else {
      setHearts(h => {
        const next = h - 1;
        if (next <= 0) setIsPlaying(false);
        return next;
      });
      onAddPoints(-1);
      playSound('fail');
      showFeedback(item.id, 'Falsch!', 'bad', binId);
    }
  };

  const showFeedback = (id: number, text: string, type: 'good' | 'bad', binId: string) => {
    const binRect = binRefs.current.get(binId)?.getBoundingClientRect();
    if (binRect) {
      const containerRect = beltRef.current?.getBoundingClientRect();
      const x = binRect.left + binRect.width / 2 - (containerRect?.left || 0);
      const y = binRect.top - (containerRect?.top || 0) + 50; 

      setFeedback({
        id,
        text,
        type,
        x, 
        y
      });
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleMissedItem = (itemId: number) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === itemId);
      if (!exists) return prev;
      
      setHearts(h => {
        const next = h - 1;
        if (next <= 0) setIsPlaying(false);
        return next;
      });
      playSound('fail');
      return prev.filter(i => i.id !== itemId);
    });
  };

  const restartGame = () => {
    setScore(0);
    setHearts(3);
    setItems([]);
    setSpeed(6);
    setSpawnRate(2500);
    setIsPlaying(true);
  };

  if (!isPlaying && hearts <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto mt-10">
        <Trophy className="w-20 h-20 text-yellow-500 mb-6" />
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Spiel Vorbei!</h2>
        <p className="text-xl text-gray-500 mb-6">Du hast {score} Punkte erreicht.</p>
        <button
          onClick={() => {
            restartGame();
            onGameComplete(score);
          }}
          className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105"
        >
          Zurück zum Menü
        </button>
        <button
          onClick={restartGame}
          className="mt-4 text-green-600 font-bold hover:underline"
        >
          Nochmal spielen 🔄
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto p-4 select-none">
      
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Score</p>
            <p className="text-3xl font-black text-green-600">{score}</p>
          </div>
          <div className="h-10 w-[1px] bg-gray-200"></div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
               <Heart key={i} className={`w-8 h-8 ${i < hearts ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
             {soundEnabled ? <Volume2 /> : <VolumeX />}
           </button>
           <button onClick={restartGame} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Neustart">
             <RotateCcw />
           </button>
        </div>
      </div>

      <div className="relative bg-gray-100 rounded-3xl border-4 border-gray-300 overflow-hidden h-[500px] shadow-inner mb-6" ref={beltRef}>
        
        {/* Conveyor Belt Visuals */}
        <div className="absolute top-[20%] left-0 right-0 h-40 bg-[#333] border-y-8 border-[#222] z-0">
           <div className="absolute inset-0 opacity-20" style={{
             backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, #000 40px, #000 44px)',
             animation: isPlaying ? 'moveBelt 1s linear infinite' : 'none'
           }}></div>
        </div>
        <style>{`@keyframes moveBelt { from { background-position: 0 0; } to { background-position: -44px 0; } }`}</style>
        
        {/* Items */}
        <AnimatePresence>
          {items.map(item => (
            <WasteItem 
              key={item.id} 
              item={item} 
              duration={speed} 
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
              onMissed={handleMissedItem}
            />
          ))}
        </AnimatePresence>

        {/* Bins */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-around items-end gap-2 z-10">
           {BINS.map(bin => (
             <div 
               key={bin.id}
               ref={(el) => { if(el) binRefs.current.set(bin.id, el); }}
               className={`
                 relative flex flex-col items-center justify-end p-4 rounded-xl border-b-8 w-1/4 h-48 transition-all duration-200
                 ${bin.bgGradient} ${bin.color}
                 ${hoveredBin === bin.id ? 'scale-110 ring-4 ring-white shadow-2xl z-20' : 'opacity-90'}
               `}
             >
                <div className="text-5xl mb-2 filter drop-shadow-lg transform transition-transform">
                  {bin.icon}
                </div>
                <div className="bg-white/90 px-3 py-1 rounded-full font-bold text-gray-700 text-sm shadow-sm whitespace-nowrap">
                  {bin.name}
                </div>
             </div>
           ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className={`absolute z-50 px-6 py-2 rounded-full font-bold text-white shadow-xl ${feedback.type === 'good' ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ 
                left: feedback.x,
                top: feedback.y,
              }}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      <div className="text-center text-gray-500 text-sm">
        💡 Tipp: Ziehe den Müll mit der Maus oder dem Finger in die richtige Tonne!
      </div>
    </div>
  );
}

// --- Subcomponent: Draggable Waste Item ---
interface WasteItemProps {
  item: GameItem;
  duration: number;
  onDragEnd: (e: any, info: any, item: GameItem) => void;
  onDrag: (e: any, info: any) => void;
  onMissed: (id: number) => void;
}

function WasteItem({ item, duration, onDragEnd, onDrag, onMissed }: WasteItemProps) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      controls.start({
        left: '-20%',
        transition: {
          duration: duration,
          ease: 'linear',
        }
      });
    } else {
      controls.stop();
    }
  }, [duration, controls, isDragging]);
  
  return (
    <motion.div
      initial={{ left: '100%' }} 
      animate={controls}
      onAnimationComplete={(definition: any) => {
        if (definition?.left === '-20%' && !isDragging) {
           onMissed(item.id);
        }
      }}
      drag
      dragSnapToOrigin 
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDrag={(e, info) => onDrag(e, info)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        onDragEnd(e, info, item);
      }}
      whileDrag={{ scale: 1.2, rotate: 15, cursor: 'grabbing', zIndex: 50 }}
      whileHover={{ scale: 1.1, cursor: 'grab', zIndex: 40 }}
      className="absolute top-0 text-6xl select-none touch-none filter drop-shadow-xl z-20"
      style={{ 
        y: 140 + item.lane 
      }}
    >
      {item.data.icon}
    </motion.div>
  );
}
