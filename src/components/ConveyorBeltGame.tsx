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
  { type: 'paper', icon: '📰', name: 'Alte Zeitung' },
  { type: 'paper', icon: '📦', name: 'Karton' },
  { type: 'paper', icon: '📝', name: 'Papierblatt' },
  { type: 'plastic', icon: '🥤', name: 'Plastikbecher' },
  { type: 'plastic', icon: '🧴', name: 'Shampooflasche' },
  { type: 'plastic', icon: '🥡', name: 'Plastikbox' },
  { type: 'glass', icon: '🍷', name: 'Weinflasche' },
  { type: 'glass', icon: '🫙', name: 'Gurkenglas' },
  { type: 'glass', icon: '🥛', name: 'Milchflasche' },
  { type: 'metal', icon: '🥫', name: 'Konserve' },
  { type: 'metal', icon: '🥤', name: 'Cola Dose' },
  { type: 'organic', icon: '🍎', name: 'Apfelrest' },
  { type: 'organic', icon: '🍌', name: 'Banane' },
  { type: 'organic', icon: '🍂', name: 'Laub' },
];

const BINS: BinConfig[] = [
  { id: 'paper', name: 'Papier', icon: '🟦', color: 'border-blue-500', bgGradient: 'from-blue-100 to-blue-200', accepts: ['paper'] },
  { id: 'plastic', name: 'Plastik', icon: '🟨', color: 'border-yellow-500', bgGradient: 'from-yellow-100 to-yellow-200', accepts: ['plastic'] },
  { id: 'glass', name: 'Glas', icon: '🟩', color: 'border-green-500', bgGradient: 'from-green-100 to-green-200', accepts: ['glass'] },
  { id: 'organic', name: 'Bio / Rest', icon: '🟫', color: 'border-amber-600', bgGradient: 'from-amber-100 to-amber-200', accepts: ['organic', 'metal'] },
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

// ... (imports)

// ... (previous code same)

export default function ConveyorBeltGame({ onGameComplete, onAddPoints }: ConveyorBeltGameProps) {
  // ... (ConveyorBeltGame implementation same until WasteItem usage)

  // ...
  
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

  // ... (rest of ConveyorBeltGame same, including bin rendering and feedback)
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
        <div className="absolute top-[30%] left-0 right-0 h-40 bg-[#333] border-y-8 border-[#222]">
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
        <div className="absolute bottom-4 left-4 right-4 flex justify-around items-end gap-2">
           {BINS.map(bin => (
             <div 
               key={bin.id}
               ref={(el) => { if(el) binRefs.current.set(bin.id, el); }}
               className={`
                 relative flex flex-col items-center justify-end p-4 rounded-xl border-b-8 w-1/4 h-48 transition-all duration-200
                 ${bin.bgGradient} ${bin.color}
                 ${hoveredBin === bin.id ? 'scale-110 ring-4 ring-white shadow-2xl z-10' : 'opacity-90'}
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
        // Trigger missed if we reached the left target
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
      className="absolute top-0 text-6xl select-none touch-none filter drop-shadow-xl"
      style={{ 
        y: 190 + item.lane 
      }}
    >
      {item.data.icon}
    </motion.div>
  );
}
