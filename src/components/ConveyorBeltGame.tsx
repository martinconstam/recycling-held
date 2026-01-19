import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Heart, Trophy } from 'lucide-react';

// ... (types remain same)

export default function ConveyorBeltGame({ onGameComplete, onAddPoints }: ConveyorBeltGameProps) {
  // ... (state remains same)
  
  // Refs
  const binRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemIdCounter = useRef(0);
  const beltRef = useRef<HTMLDivElement>(null);
  const spawnTimer = useRef<ReturnType<typeof setInterval>>(); // Fix type

  useEffect(() => {
    // Game Loop
    if (!isPlaying) {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      return;
    }

    // Spawn items
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

    return () => clearInterval(spawnTimer.current);
  }, [isPlaying, spawnRate]);

  // ... (difficulty hook same)

  // ... (playSound same)

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, item: GameItem) => {
     // ... (logic same)
     const dropPoint = { x: info.point.x, y: info.point.y };
     // ...
  };

  // ... (verifySort same)
  // ... (showFeedback same)
  // ... (handleMissedItem same)
  // ... (restartGame same)
  // ... (render same)

// ...

// Subcomponent fix
function WasteItem({ item, duration, onDragEnd, onMissed }: Omit<WasteItemProps, 'isPlaying'> & { isPlaying?: boolean }) {
  // Removed unused isPlaying
  return (
    // ...
    // ...
      onDragEnd={(e, info) => onDragEnd(e, info, item)}
    // ...
  );
}
