import { useState, useRef, ReactNode } from "react";
import { Heart, X } from "lucide-react";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
}: SwipeableCardProps) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const swipeThreshold = 100; // Minimum distance to trigger action
  const maxSwipeDistance = 150;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isSwiping) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const distanceX = touchX - touchStartX.current;
    const distanceY = Math.abs(touchY - touchStartY.current);

    // Only allow horizontal swipe if movement is mostly horizontal
    if (distanceY < 30) {
      // Clamp swipe distance to max
      const clampedDistance = Math.max(
        -maxSwipeDistance,
        Math.min(maxSwipeDistance, distanceX)
      );
      setSwipeDistance(clampedDistance);
    }
  };

  const handleTouchEnd = () => {
    if (disabled || !isSwiping) return;

    setIsSwiping(false);

    // Trigger action if swiped far enough
    if (swipeDistance >= swipeThreshold && onSwipeRight) {
      onSwipeRight();
      
      // Vibrate on action
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } else if (swipeDistance <= -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
      
      // Vibrate on action
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }

    // Reset position
    setSwipeDistance(0);
  };

  const opacity = Math.min(Math.abs(swipeDistance) / swipeThreshold, 1);
  const showRightIndicator = swipeDistance > 20;
  const showLeftIndicator = swipeDistance < -20;

  return (
    <div
      ref={cardRef}
      className="relative touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      {showRightIndicator && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none z-10 rounded-lg bg-green-500/20"
          style={{ opacity }}
        >
          <div className="bg-green-500 rounded-full p-3">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      )}

      {showLeftIndicator && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none z-10 rounded-lg bg-red-500/20"
          style={{ opacity }}
        >
          <div className="bg-red-500 rounded-full p-3">
            <X className="h-6 w-6 text-white" />
          </div>
        </div>
      )}

      {/* Card content */}
      <div
        className="transition-transform duration-100"
        style={{
          transform: `translateX(${swipeDistance}px) rotate(${swipeDistance * 0.05}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
