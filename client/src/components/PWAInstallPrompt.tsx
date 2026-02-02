import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // For iOS, show instructions if not installed
    if (iOS && !isInStandaloneMode) {
      // Check if user dismissed the instructions before
      const dismissed = localStorage.getItem("pwa-ios-instructions-dismissed");
      if (!dismissed) {
        setShowInstallButton(true);
      }
    }

    // For other browsers, listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS instructions dialog
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      // Show native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    if (isIOS) {
      localStorage.setItem("pwa-ios-instructions-dismissed", "true");
    }
  };

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false);
  };

  // Don't show anything if already installed
  if (isStandalone || !showInstallButton) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      <div className="relative">
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="sm"
          className="gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Instalar App</span>
        </Button>
      </div>

      {/* iOS Installation Instructions Dialog */}
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar Onde Assistir</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para adicionar o app à sua tela inicial
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                1
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Toque no botão Compartilhar</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share className="h-5 w-5" />
                  <span className="text-xs">Na barra inferior do Safari</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                2
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Role e selecione "Adicionar à Tela de Início"</p>
                <p className="text-xs text-muted-foreground">
                  Procure pelo ícone com um "+" dentro de um quadrado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                3
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Confirme tocando em "Adicionar"</p>
                <p className="text-xs text-muted-foreground">
                  O app aparecerá na sua tela inicial
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Dica:</strong> Se estiver usando Chrome ou outro navegador no iOS, 
              você precisa abrir este site no Safari para poder instalar.
            </p>
          </div>

          <Button onClick={handleCloseIOSInstructions} className="w-full">
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
