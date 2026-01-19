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
  colorClass: string;
  lidClass: string;
  accepts: string[];
}

// ... WASTE_TYPES stays same ...

const BINS: BinConfig[] = [
  { 
    id: 'paper', 
    name: 'Papier', 
    icon: '📄', 
    colorClass: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40', 
    lidClass: 'bg-blue-700',
    accepts: ['paper'] 
  },
  { 
    id: 'plastic', 
    name: 'Plastik', 
    icon: '🥤', 
    colorClass: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-500/40', 
    lidClass: 'bg-yellow-600',
    accepts: ['plastic'] 
  },
  { 
    id: 'glass', 
    name: 'Glas', 
    icon: '🍾', 
    colorClass: 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/40', 
    lidClass: 'bg-green-700',
    accepts: ['glass'] 
  },
  { 
    id: 'metal', 
    name: 'Metall', 
    icon: '⚙️', 
    colorClass: 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-500/40', 
    lidClass: 'bg-gray-600',
    accepts: ['metal'] 
  },
  { 
    id: 'organic', 
    name: 'Bio', 
    icon: '🍂', 
    colorClass: 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-600/40', 
    lidClass: 'bg-amber-800',
    accepts: ['organic'] 
  },
];

// ... inside ConveyorBeltGame ...

        {/* Bins */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-around items-end gap-3 z-10">
           {BINS.map(bin => {
             const isHovered = hoveredBin === bin.id;
             return (
               <div 
                 key={bin.id}
                 ref={(el) => { if(el) binRefs.current.set(bin.id, el); }}
                 className={`
                   relative flex flex-col items-center justify-end w-1/5 h-40 transition-all duration-300 ease-out
                   ${isHovered ? 'scale-110 -translate-y-2 z-20' : 'opacity-95 hover:opacity-100'}
                 `}
               >
                  {/* Lid Effect */}
                  <div className={`
                    absolute top-0 w-[110%] h-4 rounded-full shadow-md z-10 transition-transform duration-300 origin-bottom
                    ${bin.lidClass}
                    ${isHovered ? '-rotate-12 -translate-y-4' : 'rotate-0'}
                  `}></div>

                  {/* Bin Body */}
                  <div className={`
                    relative w-full h-full rounded-b-2xl rounded-t-lg shadow-xl flex flex-col items-center justify-center border-t-4 border-white/20
                    ${bin.colorClass}
                  `}>
                    {/* Inner Shadow / Depth */}
                    <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
                    
                    {/* Icon */}
                    <div className="text-4xl mb-1 filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-110">
                      {bin.icon}
                    </div>
                    
                    {/* Label */}
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-gray-800 text-xs shadow-sm whitespace-nowrap border border-white/50">
                      {bin.name}
                    </div>

                    {/* Recycling Symbol Overlay */}
                    <div className="absolute bottom-2 opacity-10 text-white text-4xl select-none pointer-events-none">
                      ♻️
                    </div>
                  </div>
               </div>
             );
           })}
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
