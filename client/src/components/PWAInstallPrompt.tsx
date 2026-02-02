import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Safari (not Chrome on iOS)
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);

    // For other browsers, listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
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
        console.log("PWA installed successfully");
      }
      
      setDeferredPrompt(null);
    } else {
      // For browsers that don't support beforeinstallprompt yet
      // Show generic instructions
      alert("Para instalar este app:\n\n1. Abra o menu do navegador (⋮)\n2. Selecione 'Instalar app' ou 'Adicionar à tela inicial'\n3. Confirme a instalação");
    }
  };

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false);
  };

  // Don't show button if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Install Button - Always visible unless already installed */}
      <div className="relative flex-shrink-0">
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20 px-2 sm:px-3"
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Instalar App</span>
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
