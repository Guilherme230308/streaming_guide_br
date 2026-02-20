import { useEffect, useRef, useState, memo } from "react";

/**
 * Google AdSense Ad Banner Component
 * 
 * Supports multiple ad formats:
 * - "horizontal" (728x90) - Leaderboard, good for between sections
 * - "rectangle" (300x250) - Medium rectangle, good for sidebars/in-content
 * - "in-feed" (responsive) - Native in-feed ad, good for between search results
 * - "in-article" (responsive) - In-article ad, good for detail pages
 * 
 * Features:
 * - Configurable via VITE_ADSENSE_PUBLISHER_ID env var
 * - Graceful ad blocker handling (no broken layout)
 * - Dark theme compatible
 * - Responsive sizing
 * - Lazy loading (only loads when visible)
 */

type AdFormat = "horizontal" | "rectangle" | "in-feed" | "in-article";

interface AdBannerProps {
  format?: AdFormat;
  className?: string;
  /** Optional slot ID for specific ad units */
  slot?: string;
}

// Get publisher ID from environment
function getPublisherId(): string {
  return (import.meta as any).env?.VITE_ADSENSE_PUBLISHER_ID || "";
}

// Check if AdSense is configured
function isAdSenseConfigured(): boolean {
  return !!getPublisherId();
}

// Track if AdSense script has been loaded
let adSenseScriptLoaded = false;
let adSenseScriptLoading = false;

function loadAdSenseScript(): Promise<void> {
  if (adSenseScriptLoaded) return Promise.resolve();
  if (adSenseScriptLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (adSenseScriptLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  adSenseScriptLoading = true;
  return new Promise((resolve, reject) => {
    const publisherId = getPublisherId();
    if (!publisherId) {
      adSenseScriptLoading = false;
      reject(new Error("No AdSense publisher ID configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      adSenseScriptLoaded = true;
      adSenseScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      adSenseScriptLoading = false;
      reject(new Error("Failed to load AdSense script (possibly blocked by ad blocker)"));
    };
    document.head.appendChild(script);
  });
}

// Format-specific configurations
const AD_CONFIGS: Record<AdFormat, { style: React.CSSProperties; dataAdFormat?: string; dataFullWidthResponsive?: string }> = {
  horizontal: {
    style: { display: "block", width: "100%", height: "90px", maxWidth: "728px", margin: "0 auto" },
    dataAdFormat: "horizontal",
    dataFullWidthResponsive: "true",
  },
  rectangle: {
    style: { display: "inline-block", width: "300px", height: "250px" },
  },
  "in-feed": {
    style: { display: "block" },
    dataAdFormat: "fluid",
    dataFullWidthResponsive: "true",
  },
  "in-article": {
    style: { display: "block", textAlign: "center" as const },
    dataAdFormat: "fluid",
    dataFullWidthResponsive: "true",
  },
};

/**
 * Placeholder ad component shown when AdSense is not configured
 * This serves as a visual indicator of where ads will appear
 * and can be used during development/testing
 */
function AdPlaceholder({ format, className }: { format: AdFormat; className?: string }) {
  const heightMap: Record<AdFormat, string> = {
    horizontal: "h-[90px]",
    rectangle: "h-[250px] max-w-[300px]",
    "in-feed": "h-[120px]",
    "in-article": "h-[120px]",
  };

  return (
    <div
      className={`${heightMap[format]} w-full mx-auto flex items-center justify-center rounded-lg border border-dashed border-border/30 bg-card/30 ${className || ""}`}
      role="complementary"
      aria-label="Espaço publicitário"
    >
      <div className="text-center px-4">
        <p className="text-xs text-muted-foreground/50">Publicidade</p>
      </div>
    </div>
  );
}

/**
 * Main AdBanner component
 */
const AdBanner = memo(function AdBanner({ format = "horizontal", className = "", slot }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [adBlocked, setAdBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [adPushed, setAdPushed] = useState(false);

  // Lazy loading: only render ad when visible
  useEffect(() => {
    if (!adRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  // Load AdSense when visible
  useEffect(() => {
    if (!isVisible || !isAdSenseConfigured() || adPushed) return;

    loadAdSenseScript()
      .then(() => {
        // Push the ad
        try {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
          setAdPushed(true);
        } catch (e) {
          console.warn("AdSense push failed:", e);
          setAdBlocked(true);
        }
      })
      .catch(() => {
        setAdBlocked(true);
      });
  }, [isVisible, adPushed]);

  // If AdSense is not configured, show placeholder in development
  if (!isAdSenseConfigured()) {
    return <AdPlaceholder format={format} className={className} />;
  }

  // If ad is blocked, render nothing (graceful degradation)
  if (adBlocked) {
    return null;
  }

  const config = AD_CONFIGS[format];
  const publisherId = getPublisherId();

  return (
    <div
      ref={adRef}
      className={`ad-container overflow-hidden ${className}`}
      role="complementary"
      aria-label="Publicidade"
    >
      {isVisible && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={config.style}
          data-ad-client={publisherId}
          data-ad-slot={slot || ""}
          {...(config.dataAdFormat ? { "data-ad-format": config.dataAdFormat } : {})}
          {...(config.dataFullWidthResponsive ? { "data-full-width-responsive": config.dataFullWidthResponsive } : {})}
        />
      )}
    </div>
  );
});

/**
 * In-feed ad component specifically designed for search results
 * Renders as a grid item that blends with the content cards
 */
export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    <div className={`col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 my-2 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">Publicidade</span>
        <div className="flex-1 h-px bg-border/20" />
      </div>
      <AdBanner format="in-feed" />
    </div>
  );
}

/**
 * In-article ad for detail pages (between content sections)
 */
export function InArticleAd({ className = "" }: { className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-px bg-border/20" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">Publicidade</span>
        <div className="flex-1 h-px bg-border/20" />
      </div>
      <AdBanner format="in-article" />
    </div>
  );
}

/**
 * Horizontal banner ad for between sections on the home page
 */
export function SectionAd({ className = "" }: { className?: string }) {
  return (
    <div className={`py-4 ${className}`}>
      <div className="container px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-border/20" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">Publicidade</span>
          <div className="flex-1 h-px bg-border/20" />
        </div>
        <AdBanner format="horizontal" />
      </div>
    </div>
  );
}

export default AdBanner;
