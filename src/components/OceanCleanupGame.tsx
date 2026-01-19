import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface TrashItem {
  id: number;
  startX: number;
  x: number;
  y: number;
  type: 'plastic' | 'metal' | 'glass';
  icon: string;
  rotation: number;
  enteredWater: boolean;
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
  const audioCtxRef = useRef<AudioContext | null>(null); // Persistent AudioContext

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
      // Difficulty: Spawns faster and drops faster
      const spawnInterval = Math.max(400, 2000 - scoreRef.current * 40); 

      // Spawn Trash
      if (timestamp - lastSpawnTime.current > spawnInterval) {
        const randomType = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
        const width = ubGameContainerWidth();
        const padding = 60; 
        const startX = padding + Math.random() * (width - 2 * padding);
        
        const newTrash: TrashItem = {
          id: timestamp,
          startX: startX, 
          x: startX,
          y: -50,
          type: randomType.type as any,
          icon: randomType.icon,
          rotation: Math.random() * 360,
          enteredWater: false
        };
        setTrashItems(prev => [...prev, newTrash]);
        lastSpawnTime.current = timestamp;
      }

      // ... (Creatures remain same)

      // Update Trash Positions
      setTrashItems(prev => {
        const nextItems: TrashItem[] = [];
        let hitBottom = false;
        let hitX = 0;
        const waterLevel = 50; 

        prev.forEach(item => {
          // Difficulty: Fall speed increases faster (0.1 multiplier)
          const newY = item.y + (3 + scoreRef.current * 0.1); 
          
          const waveAmplitude = 20; 
          const waveFrequency = 0.02;
          const newX = item.startX + Math.sin(newY * waveFrequency) * waveAmplitude;

          // Check if entering water
          let justEntered = false;
          if (!item.enteredWater && newY > waterLevel) {
              justEntered = true;
          }

          if (justEntered) {
             // Trigger Splash Effect on Entry
             splashIdCounter.current += 1;
             const newSplash = { id: splashIdCounter.current, x: newX, y: waterLevel };
             setSplashes(current => {
                 const updated = [...current, newSplash];
                 setTimeout(() => {
                    setSplashes(curr => curr.filter(s => s.id !== newSplash.id));
                 }, 500);
                 return updated;
             });
             playSound('splash');
          }

          if (newY > containerHeight) {
             if (!hitBottom) {
                 hitBottom = true; 
                 hitX = item.x;
             }
          } else {
            nextItems.push({ 
                ...item, 
                x: newX, 
                y: newY, 
                rotation: item.rotation + 1,
                enteredWater: item.enteredWater || justEntered
            });
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
               <div className="absolute bottom-0 left-0 w-full h-32 flex justify-around px-8 items-end pointer-events-none z-20">
                   {[...Array(6)].map((_, i) => (
                       <motion.div 
                         key={i}
                         animate={{ rotate: [0, 5, 0, -5, 0] }}
                         transition={{ 
                             duration: 3 + Math.random() * 2, // ~4 seconds cycle (faster)
                             repeat: Infinity, 
                             ease: 'easeInOut', 
                             delay: i * 0.5 
                         }}
                         className="origin-bottom filter brightness-90"
                         style={{ transform: `scale(${0.8 + Math.random() * 0.5})` }}
                       >
                           <span className="text-5xl drop-shadow-md">
                               {['🌿', '🪸', '🎍', '🌾'][i % 4]}
                           </span>
                       </motion.div>
                   ))}
               </div>
          </div>

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
        const waterLevel = 50; // Visual top of water

        prev.forEach(item => {
          const newY = item.y + (3 + scoreRef.current * 0.05); 
          
          // Calculate new X with sine wave for 'snake lines'
          const waveAmplitude = 20; 
          const waveFrequency = 0.02;
          const newX = item.startX + Math.sin(newY * waveFrequency) * waveAmplitude;

          // Check if entering water
          let justEntered = false;
          if (!item.enteredWater && newY > waterLevel) {
              justEntered = true;
          }

          if (justEntered) {
             // Trigger Splash Effect on Entry
             splashIdCounter.current += 1;
             const newSplash = { id: splashIdCounter.current, x: newX, y: waterLevel };
             setSplashes(current => {
                 const updated = [...current, newSplash];
                 setTimeout(() => {
                    setSplashes(curr => curr.filter(s => s.id !== newSplash.id));
                 }, 500);
                 return updated;
             });
             playSound('splash');
          }

          if (newY > containerHeight) {
             if (!hitBottom) {
                 hitBottom = true; 
                 hitX = item.x;
             }
          } else {
            nextItems.push({ 
                ...item, 
                x: newX, 
                y: newY, 
                rotation: item.rotation + 1,
                enteredWater: item.enteredWater || justEntered
            });
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

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    
    if (type === 'splash') {
       const t = ctx.currentTime;
       
       // 1. Impact "Thud" (Low Sine Drop)
       const osc = ctx.createOscillator();
       const oscGain = ctx.createGain();
       osc.connect(oscGain);
       oscGain.connect(gain);
       
       osc.frequency.setValueAtTime(150, t);
       osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
       oscGain.gain.setValueAtTime(0.5, t);
       oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
       osc.start(t);
       osc.stop(t + 0.1);

       // 2. Spray "Wishhh" (Filtered Noise)
       const bufferSize = ctx.sampleRate * 0.5;
       const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
       const data = buffer.getChannelData(0);
       for (let i = 0; i < bufferSize; i++) {
         data[i] = (Math.random() * 2 - 1); 
       }
       const noise = ctx.createBufferSource();
       noise.buffer = buffer;
       
       const noiseFilter = ctx.createBiquadFilter();
       noiseFilter.type = 'lowpass';
       noiseFilter.frequency.setValueAtTime(800, t);
       noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.4);
       
       const noiseGain = ctx.createGain();
       
       noise.connect(noiseFilter);
       noiseFilter.connect(noiseGain);
       noiseGain.connect(gain);
       
       noiseGain.gain.setValueAtTime(0.8, t);
       noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
       
       noise.start(t);
       noise.stop(t + 0.4);

    } else {
        const osc = ctx.createOscillator();
        osc.connect(gain);

        if (type === 'success') {
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(); osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'die') {
           osc.type = 'sawtooth';
           osc.frequency.setValueAtTime(150, ctx.currentTime);
           osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
           gain.gain.setValueAtTime(0.1, ctx.currentTime);
           gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
           osc.start(); osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'swish') {
           osc.frequency.setValueAtTime(400, ctx.currentTime);
           osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
           gain.gain.setValueAtTime(0.05, ctx.currentTime);
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
              onClick={restartGame}
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
        className="relative flex-grow w-full bg-gradient-to-b from-sky-300 via-blue-500 to-indigo-900 rounded-3xl overflow-hidden shadow-inner cursor-none border-4 border-white/50 z-0"
      >
          {/* --- Waves at Surface --- */}
          <div className="absolute top-[40px] left-0 right-0 h-16 z-0 opacity-50">
             <motion.div 
               animate={{ x: ["-20%", "0%"] }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="flex w-[150%] h-full"
             >
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjMiIGQ9Ik0wLDE2MEw0OCwxNTAuN0M5NiwxNDEsMTkyLDEyMywyODgsMTIyLjdDMzg0LDEyMyw0ODAsMTM5LDU3NiwxNDkuM0M2NzIsMTYwLDc2OCwxNjUsODY0LDE1NC43Qzk2MCwxNDQsMTA1NiwxMTcsMTE1MiwxMDYuN0MxMjQ4LDk2LDEzNDQsMTAxLDEzOTIsMTA0TD…hZ2Ugc291cmNlIGlzIHRvbyBsb25nLCB1c2luZyBzaW1wbGUgQ1NTIHdhdmUgb3IgcGF0aCBpbnN0ZWFk" className="hidden" />
                {/* Fallback to CSS/SVG inline for cleaner code */}
                <div className="w-full h-full" style={{ 
                    backgroundImage: 'radial-gradient(circle at 20px 0, rgba(255,255,255,0.4) 20px, transparent 21px)', 
                    backgroundSize: '40px 40px',
                    backgroundRepeat: 'repeat-x',
                    height: '20px'
                }}></div>
             </motion.div>
          </div>
          {/* Proper SVG Wave */}
          <div className="absolute top-[45px] left-0 w-full overflow-hidden h-12 z-0">
             <motion.div 
               className="flex w-[200%]"
               animate={{ x: ["-50%", "0%"] }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             >
               {[0, 1].map(i => (
                 <svg key={i} className="w-1/2 h-full text-white/20 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
                 </svg>
               ))}
             </motion.div>
          </div>
          <div className="absolute top-[50px] left-0 w-full h-[2px] bg-white/20 blur-[1px]"></div>


          {/* --- Background Bubbles --- */}
          <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
               {[...Array(20)].map((_, i) => (
                   <motion.div 
                    key={i} 
                    className="absolute bg-white/40 rounded-full"
                    animate={{ 
                        y: [0, -100], 
                        opacity: [0, 0.8, 0] 
                    }}
                    transition={{ 
                        duration: 5 + Math.random() * 10, 
                        repeat: Infinity, 
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: Math.random() * 8 + 4 + 'px',
                        height: Math.random() * 8 + 4 + 'px',
                    }} 
                   />
               ))}
          </div>

      {/* Spawn Trash Logic Update - effectively constrained in next check, but visual render needs to be updated or logic block needs to be updated. Since this is a big file, I will target the specific blocks. */}
      {/* ... */}
      
          {/* --- Sand Floor & Plants --- */}
          <div className="absolute bottom-0 w-full h-40 z-10 pointers-events-none">
             {/* Back Dune */}
             <svg className="absolute bottom-0 w-full h-32" preserveAspectRatio="none" viewBox="0 0 1440 320">
               <path fill="#C2B280" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </svg>
             
             {/* Front Dune */}
             <svg className="absolute bottom-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <defs>
                   <pattern id="sandPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#8B4513" opacity="0.1" />
                   </pattern>
                </defs>
               <path fill="#E6D5AC" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,122.7C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               <rect width="100%" height="100%" fill="url(#sandPattern)" style={{mixBlendMode: 'overlay'}} clipPath="url(#frontDuneClip)" />
             </svg>
             
             {/* Plants - Gentle Sway */}
               <div className="absolute bottom-0 left-0 w-full h-32 flex justify-around px-8 items-end pointer-events-none z-20">
                   {[...Array(6)].map((_, i) => (
                       <motion.div 
                         key={i}
                         animate={{ rotate: [0, 5, 0, -5, 0] }}
                         transition={{ 
                             duration: 8 + Math.random() * 4, // 8-12 seconds cycle (very slow)
                             repeat: Infinity, 
                             ease: 'easeInOut', 
                             delay: i * 1.5 
                         }}
                         className="origin-bottom filter brightness-90"
                         style={{ transform: `scale(${0.8 + Math.random() * 0.5})` }}
                       >
                           <span className="text-5xl drop-shadow-md">
                               {['🌿', '🪸', '🎍', '🌾'][i % 4]}
                           </span>
                       </motion.div>
                   ))}
               </div>
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
                        className="absolute text-5xl pointer-events-none transition-transform duration-200 z-10"
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
                className="absolute text-4xl filter drop-shadow-lg z-20"
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
                className="absolute w-20 h-20 bg-blue-200 rounded-full opacity-0 pointer-events-none animate-ping z-30"
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

          {/* Tutorial Text */}
          {score === 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 font-bold text-2xl text-center pointer-events-none z-50 drop-shadow-md">
                 Bewege die Maus um das Netz zu steuern!<br/>
                 Klicke um Müll zu fangen!
             </div>
          )}

      </div>
    </div>
  );
}
