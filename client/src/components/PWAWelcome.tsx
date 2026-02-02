import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const WELCOME_SHOWN_KEY = "pwa-welcome-shown";

export function PWAWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isInstalled = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check if welcome was already shown
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);

    // Show welcome only once after installation
    if (isInstalled && !welcomeShown) {
      // Small delay for better UX
      setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem(WELCOME_SHOWN_KEY, "true");
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
  };

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Bem-vindo ao Onde Assistir!
          </DialogTitle>
          <DialogDescription className="text-center">
            O app foi instalado com sucesso na sua tela inicial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Acesso Instantâneo</p>
              <p className="text-xs text-muted-foreground">
                Abra direto da tela inicial, sem precisar do navegador
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Funciona Offline</p>
              <p className="text-xs text-muted-foreground">
                Consulte suas listas e histórico mesmo sem internet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Notificações Inteligentes</p>
              <p className="text-xs text-muted-foreground">
                Receba alertas quando seus filmes e séries chegarem nos streamings
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 mb-2">
          <p className="text-xs text-center text-muted-foreground">
            💡 <strong>Dica:</strong> Adicione filmes e séries à sua lista de alertas para ser notificado quando chegarem nos streamings brasileiros
          </p>
        </div>

        <Button onClick={handleClose} className="w-full" size="lg">
          Começar a Usar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
