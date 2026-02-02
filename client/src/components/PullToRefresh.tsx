import { useEffect, useState, useRef, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxPullDistance = 80;
  const triggerThreshold = 60;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh if scrolled to top
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        setCanPull(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      // Only pull down, not up
      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scroll behavior while pulling
        e.preventDefault();
        
        // Apply resistance effect (gets harder to pull as distance increases)
        const resistance = 2.5;
        const adjustedDistance = Math.min(distance / resistance, maxPullDistance);
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) return;

      setCanPull(false);

      // Trigger refresh if pulled far enough
      if (pullDistance >= triggerThreshold) {
        setIsRefreshing(true);
        setPullDistance(maxPullDistance); // Lock at max during refresh

        try {
          await onRefresh();
          
          // Vibrate on successful refresh
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back if not pulled far enough
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, pullDistance, isRefreshing, onRefresh]);

  const rotation = (pullDistance / maxPullDistance) * 360;
  const opacity = Math.min(pullDistance / triggerThreshold, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: opacity,
        }}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-border">
          <RefreshCw
            className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s',
            }}
          />
        </div>
      </div>

      {/* Content with padding to prevent overlap */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
