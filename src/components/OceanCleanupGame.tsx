interface TrashItem {
  id: number;
  x: number;
  y: number;
  type: 'plastic' | 'metal' | 'glass';
  icon: string;
  rotation: number;
}

interface SeaCreature {
  id: number;
  x: number;
  y: number;
  icon: string;
  speed: number;
  direction: number; // 1 for right, -1 for left
  status: 'alive' | 'dying';
}

interface Splash {
  id: number;
  x: number;
  y: number;
}

interface OceanCleanupGameProps {
  onGameComplete: (score: number) => void;
  onAddPoints: (points: number) => void;
  onBack: () => void;
}

const TRASH_TYPES = [
  { type: 'plastic', icon: '🥤' },
  { type: 'plastic', icon: '🥡' },
  { type: 'plastic', icon: '🧴' },
  { type: 'plastic', icon: '🛍️' },
  { type: 'metal', icon: '🥫' },
  { type: 'metal', icon: '🥤' },
  { type: 'glass', icon: '🍾' },
];

const CREATURES = ['🐠', '🐡', '🦈', '🐋', '🐙', '🐢', '🦀'];

export default function OceanCleanupGame({ onGameComplete, onAddPoints, onBack }: OceanCleanupGameProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [netPosition, setNetPosition] = useState({ x: 0, y: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNetClosing, setIsNetClosing] = useState(false);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastSpawnTime = useRef(0);
  const lastCreatureSpawnTime = useRef(0);
  const scoreRef = useRef(0); 
  const netPositionRef = useRef({ x: 0, y: 0 }); // Refs for loop access
  const splashIdCounter = useRef(0);

  // Mouse movement handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameContainerRef.current) return;
    const rect = gameContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNetPosition({ x, y });
    netPositionRef.current = { x, y };
  };

  const handleMouseDown = () => {
    if (!isPlaying) return;
    setIsNetClosing(true);
    setTimeout(() => setIsNetClosing(false), 200); // Visual feedback duration

    const netRadius = 50; // Capture radius
    
    setTrashItems(prev => {
        const caughtItems: TrashItem[] = [];
        const remainingItems: TrashItem[] = [];

        prev.forEach(item => {
            const dx = item.x - netPositionRef.current.x;
            const dy = item.y - netPositionRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < netRadius) {
                caughtItems.push(item);
            } else {
                remainingItems.push(item);
            }
        });

        if (caughtItems.length > 0) {
            const points = caughtItems.length;
            setScore(s => {
                const newScore = s + points;
                scoreRef.current = newScore;
                return newScore;
            });
            onAddPoints(points);
            playSound('success');
        } else {
             // Optional: Miss sound
             playSound('swish');
        }

        return remainingItems;
    });
  };

  const triggerMissedTrashEffects = (x: number) => {
      // 1. Create Splash
      splashIdCounter.current += 1;
      const newSplash = { id: splashIdCounter.current, x, y: 550 }; // Approx water level
      setSplashes(prev => [...prev, newSplash]);
      setTimeout(() => {
          setSplashes(prev => prev.filter(s => s.id !== newSplash.id));
      }, 500);

      // 2. Kill Random Creature
      let creatureDied = false;
      setCreatures(prev => {
          const aliveOnes = prev.filter(c => c.status === 'alive');
          if (aliveOnes.length === 0) return prev;
          
          const victimIndex = Math.floor(Math.random() * aliveOnes.length);
          const victimId = aliveOnes[victimIndex].id;
          creatureDied = true;
          
          return prev.map(c => {
             if (c.id === victimId) {
                 return { ...c, status: 'dying', icon: '💀' };
             }
             return c;
          });
      });

      if (creatureDied) playSound('die');
      playSound('splash');
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (!lastSpawnTime.current) lastSpawnTime.current = timestamp;
      if (!lastCreatureSpawnTime.current) lastCreatureSpawnTime.current = timestamp;

      const containerHeight = 600;
      const spawnInterval = Math.max(500, 2000 - scoreRef.current * 20);

      // Spawn Trash
      if (timestamp - lastSpawnTime.current > spawnInterval) {
        const randomType = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
        const newTrash: TrashItem = {
          id: timestamp,
          x: Math.random() * (gameContainerRef.current?.clientWidth || 800),
          y: -50,
          type: randomType.type as any,
          icon: randomType.icon,
          rotation: Math.random() * 360,
        };
        setTrashItems(prev => [...prev, newTrash]);
        lastSpawnTime.current = timestamp;
      }

      // Spawn Creatures
       if (timestamp - lastCreatureSpawnTime.current > 3000) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const width = ubGameContainerWidth();
        const startX = direction === 1 ? -50 : width + 50; 
        
        const newCreature: SeaCreature = {
          id: timestamp + 1,
          x: startX,
          y: 400 + Math.random() * 150, 
          icon: CREATURES[Math.floor(Math.random() * CREATURES.length)],
          speed: 1 + Math.random() * 2,
          direction,
          status: 'alive'
        };
        setCreatures(prev => [...prev, newCreature]);
        lastCreatureSpawnTime.current = timestamp;
      }


      // Update Trash Positions
      setTrashItems(prev => {
        const nextItems: TrashItem[] = [];
        let hitBottom = false;
        let hitX = 0;

        prev.forEach(item => {
          const newY = item.y + (3 + scoreRef.current * 0.05); 
          
          if (newY > containerHeight) {
             if (!hitBottom) {
                 hitBottom = true; 
                 hitX = item.x;
             }
          } else {
            nextItems.push({ ...item, y: newY, rotation: item.rotation + 1 });
          }
        });

        if (hitBottom) {
             triggerMissedTrashEffects(hitX);
             setHearts(h => {
                const newH = h - 1;
                if (newH <= 0) setIsPlaying(false);
                return newH;
             });
        }

        return nextItems;
      });

      // Update Creature Positions
      setCreatures(prev => prev.map(c => {
          if (c.status === 'dying') {
              return { 
                  ...c, 
                  y: c.y - 2, // Float up
                  x: c.x + Math.sin(timestamp * 0.01) * 2, // Wiggle
                  // Fade out logic would typically be in render, but removing here is safer
              };
          }
          return {
              ...c,
              x: c.x + c.speed * c.direction
          };
      }).filter(c => {
          const width = ubGameContainerWidth();
          const inBounds = c.x > -100 && c.x < width + 100;
          const isDeadAndGone = c.status === 'dying' && c.y < -50;
          return inBounds && !isDeadAndGone;
      }));

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);


  // Helper
  const ubGameContainerWidth = () => gameContainerRef.current?.clientWidth || 800;

  const playSound = (type: 'success' | 'fail' | 'splash' | 'die' | 'swish') => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'splash') {
       // Noise-like sound for splash
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(100, ctx.currentTime);
       osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
       gain.gain.setValueAtTime(0.1, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
       osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'die') {
       osc.type = 'sawtooth';
       osc.frequency.setValueAtTime(150, ctx.currentTime);
       osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
       gain.gain.setValueAtTime(0.08, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
       osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'swish') {
       // Quick swoosh
       osc.frequency.setValueAtTime(400, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
       gain.gain.setValueAtTime(0.03, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
       osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  };

  const restartGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setHearts(3);
    setTrashItems([]);
    setCreatures([]);
    setIsPlaying(true);
  };


  if (!isPlaying && hearts <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto mt-10 border border-blue-200">
        <Trophy className="w-24 h-24 text-blue-500 mb-6" />
        <h2 className="text-4xl font-black text-gray-800 mb-2">Ozean Gereinigt!</h2>
        <p className="text-xl text-gray-500 mb-8">Du hast {score} Teile Müll aus dem Meer gefischt.</p>
        <div className="flex gap-4">
             <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Beenden
            </button>
            <button
              onClick={() => {
                restartGame();
                onGameComplete(score);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 px-10 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              Nochmal Retten 🌊
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto p-4 select-none lg:h-[800px] flex flex-col">
       {/* Header */}
       <div className="flex justify-between items-center mb-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-blue-100 z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-blue-600">
                ← Zurück
            </button>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Gerettet</p>
            <p className="text-3xl font-black text-blue-600">{score}</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
               <Heart key={i} className={`w-8 h-8 ${i < hearts ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-blue-50 text-blue-500">
             {soundEnabled ? <Volume2 /> : <VolumeX />}
           </button>
           <button onClick={restartGame} className="p-2 rounded-full hover:bg-blue-50 text-blue-500" title="Neustart">
             <RotateCcw />
           </button>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameContainerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        className="relative flex-grow w-full bg-gradient-to-b from-sky-200 via-blue-400 to-indigo-900 rounded-3xl overflow-hidden shadow-inner cursor-none border-4 border-white/50"
      >
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
               {[...Array(20)].map((_, i) => (
                   <div 
                    key={i} 
                    className="absolute bg-white rounded-full animate-pulse"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: Math.random() * 10 + 2 + 'px',
                        height: Math.random() * 10 + 2 + 'px',
                        opacity: Math.random() * 0.5
                    }} 
                   />
               ))}
          </div>

          {/* Sea Creatures */}
            <AnimatePresence>
                {creatures.map(creature => (
                    <motion.div
                        key={creature.id}
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: creature.status === 'dying' ? 0 : 1,
                            scale: creature.status === 'dying' ? 1.5 : 1,
                            rotate: creature.status === 'dying' ? 180 : 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: creature.status === 'dying' ? 1 : 0.5 }}
                        className="absolute text-5xl pointer-events-none transition-transform duration-200"
                        style={{
                            left: creature.x,
                            top: creature.y,
                            transform: `scaleX(${creature.direction * -1})`, // Flip based on direction
                            filter: creature.status === 'dying' ? 'grayscale(100%)' : 'none'
                        }}
                    >
                        {creature.icon}
                    </motion.div>
                ))}
            </AnimatePresence>

          {/* Trash Items */}
          {trashItems.map(item => (
              <div 
                key={item.id}
                className="absolute text-4xl filter drop-shadow-lg"
                style={{
                    left: item.x,
                    top: item.y,
                    transform: `rotate(${item.rotation}deg)`
                }}
              >
                  {item.icon}
              </div>
          ))}

          {/* Splashes */}
          {splashes.map(splash => (
               <div
                key={splash.id}
                className="absolute w-20 h-20 bg-blue-200 rounded-full opacity-0 pointer-events-none animate-ping"
                style={{ left: splash.x - 40, top: splash.y - 40 }}
               ></div>
          ))}


          {/* The Net (Cursor) */}
          <div 
            className={`absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ${isNetClosing ? 'scale-90' : 'scale-100'}`}
            style={{
                left: netPosition.x,
                top: netPosition.y,
            }}
          >
             {/* Net Ring */}
             <div className={`w-24 h-24 border-4 rounded-full bg-white/10 backdrop-blur-sm shadow-xl relative transition-colors duration-200 ${isNetClosing ? 'border-green-400 bg-green-500/20' : 'border-white'}`}>
                  {/* Net Mesh Pattern */}
                  <div className="w-full h-full rounded-full opacity-30" style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                  }}></div>
             </div>
             {/* Handle */}
             <div className="absolute top-full left-1/2 w-2 h-20 bg-amber-700 -translate-x-1/2 rounded-full shadow-lg origin-top transform -rotate-12"></div>
          </div>

          {/* Water Surface Line */}
          <div className="absolute top-10 left-0 right-0 h-1 bg-white/30 blur-sm"></div>

          {/* Tutorial Text */}
          {score === 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 font-bold text-2xl text-center pointer-events-none">
                 Bewege die Maus um das Netz zu steuern!<br/>
                 Klicke um Müll zu fangen!
             </div>
          )}

      </div>
    </div>
  );
}
