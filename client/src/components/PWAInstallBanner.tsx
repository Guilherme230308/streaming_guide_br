import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone, Zap, Wifi } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEYS = {
  DISMISSED_AT: "pwa-banner-dismissed-at",
  PAGE_VIEWS: "pwa-banner-page-views",
  ENGAGEMENT_TIME: "pwa-banner-engagement-time",
  INSTALL_PROMPTED: "pwa-install-prompted",
};

const TIMING_CONFIG = {
  MIN_ENGAGEMENT_SECONDS: 30,
  MIN_PAGE_VIEWS: 2,
  DISMISS_COOLDOWN_DAYS: 7,
};

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsInstalled(isInStandaloneMode);
    if (isInStandaloneMode) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEYS.DISMISSED_AT);
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < TIMING_CONFIG.DISMISS_COOLDOWN_DAYS) {
        return;
      }
    }

    // Track page views
    const pageViews = parseInt(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || "0") + 1;
    localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, pageViews.toString());

    // Track engagement time
    const startTime = Date.now();
    const engagementTimer = setInterval(() => {
      const currentEngagement = parseInt(localStorage.getItem(STORAGE_KEYS.ENGAGEMENT_TIME) || "0");
      const newEngagement = currentEngagement + 5;
      localStorage.setItem(STORAGE_KEYS.ENGAGEMENT_TIME, newEngagement.toString());

      // Check if conditions are met
      if (
        newEngagement >= TIMING_CONFIG.MIN_ENGAGEMENT_SECONDS &&
        pageViews >= TIMING_CONFIG.MIN_PAGE_VIEWS &&
        deferredPrompt &&
        !localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPTED)
      ) {
        setShowBanner(true);
        clearInterval(engagementTimer);
      }
    }, 5000);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check conditions immediately
      const currentEngagement = parseInt(localStorage.getItem(STORAGE_KEYS.ENGAGEMENT_TIME) || "0");
      if (
        currentEngagement >= TIMING_CONFIG.MIN_ENGAGEMENT_SECONDS &&
        pageViews >= TIMING_CONFIG.MIN_PAGE_VIEWS &&
        !localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPTED)
      ) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setIsInstalled(true);
      localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPTED, "true");
      
      // Track successful install
      console.log("[PWA] App installed successfully");
    });

    return () => {
      clearInterval(engagementTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Track install attempt
    console.log("[PWA] Install button clicked");
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPTED, "true");

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log("[PWA] Install outcome:", outcome);
      
      if (outcome === "accepted") {
        setShowBanner(false);
      } else {
        // User dismissed the native prompt
        handleDismiss();
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, Date.now().toString());
    console.log("[PWA] Banner dismissed by user");
  };

  if (isInstalled || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in slide-in-from-bottom-5 duration-500">
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="p-5 pr-10">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Instale o App Stream Radar
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acesso rápido direto da sua tela inicial
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-center text-muted-foreground">Mais rápido</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs text-center text-muted-foreground">Funciona offline</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-xs text-center text-muted-foreground">Tela cheia</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Instalar Agora
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
            >
              Depois
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
