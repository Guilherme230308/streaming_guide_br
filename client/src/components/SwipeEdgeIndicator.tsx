import { useEffect, useState } from "react";

export function SwipeEdgeIndicator() {
  const [showIndicator, setShowIndicator] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let touchStartX = 0;
    let fadeTimeout: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      const edgeThreshold = 50;

      // Show indicator if touch starts near left edge
      if (touchStartX <= edgeThreshold) {
        setShowIndicator(true);
        setOpacity(1);

        // Clear any existing timeout
        if (fadeTimeout) {
          clearTimeout(fadeTimeout);
        }
      }
    };

    const handleTouchEnd = () => {
      // Fade out indicator after touch ends
      fadeTimeout = setTimeout(() => {
        setOpacity(0);
        // Hide element after fade animation completes
        setTimeout(() => setShowIndicator(false), 300);
      }, 100);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
      }
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-primary/60 to-transparent pointer-events-none z-50 transition-opacity duration-300"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
