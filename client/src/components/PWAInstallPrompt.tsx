import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share, MoreVertical, Plus, Smartphone, Monitor, X, Check, ArrowDown } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function StepNumber({ n }: { n: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
      {n}
    </div>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-5">
      {/* Step 1 */}
      <div className="flex items-start gap-4">
        <StepNumber n={1} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Toque no botão Compartilhar</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/15 text-blue-400">
              <Share className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Na barra inferior do <strong className="text-foreground">Safari</strong>, toque no ícone de compartilhar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-4">
        <StepNumber n={2} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Selecione "Adicionar à Tela de Início"</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/15 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Role para baixo no menu e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-start gap-4">
        <StepNumber n={3} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Confirme a instalação</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/15 text-green-400">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Toque em <strong className="text-foreground">"Adicionar"</strong> no canto superior direito
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <p className="text-sm text-amber-200/90">
          <strong>Importante:</strong> No iOS, você precisa usar o <strong>Safari</strong> para instalar o app. 
          Se estiver usando Chrome ou outro navegador, abra este site no Safari primeiro.
        </p>
      </div>
    </div>
  );
}

function AndroidInstructions() {
  return (
    <div className="space-y-5">
      {/* Step 1 */}
      <div className="flex items-start gap-4">
        <StepNumber n={1} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Abra o menu do navegador</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/15 text-blue-400">
              <MoreVertical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Toque nos <strong className="text-foreground">3 pontos</strong> (⋮) no canto superior direito do Chrome
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-4">
        <StepNumber n={2} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/15 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Procure a opção <strong className="text-foreground">"Instalar app"</strong> ou <strong className="text-foreground">"Adicionar à tela inicial"</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-start gap-4">
        <StepNumber n={3} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Confirme a instalação</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/15 text-green-400">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Toque em <strong className="text-foreground">"Instalar"</strong> na janela de confirmação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <p className="text-sm text-primary/90">
          <strong>Dica:</strong> Se a opção "Instalar app" aparecer automaticamente na barra de endereço, 
          você pode tocar diretamente nela para uma instalação mais rápida.
        </p>
      </div>
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="space-y-5">
      {/* Step 1 */}
      <div className="flex items-start gap-4">
        <StepNumber n={1} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Procure o ícone de instalação</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/15 text-blue-400">
              <ArrowDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                No <strong className="text-foreground">Chrome</strong> ou <strong className="text-foreground">Edge</strong>, 
                procure o ícone <strong className="text-foreground">de instalação</strong> na barra de endereço (lado direito)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-4">
        <StepNumber n={2} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Clique em "Instalar"</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/15 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Clique no ícone e depois em <strong className="text-foreground">"Instalar"</strong> na janela que aparecer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-start gap-4">
        <StepNumber n={3} />
        <div className="space-y-2 flex-1">
          <p className="font-semibold text-foreground">Pronto!</p>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/15 text-green-400">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                O app será aberto em uma janela própria e ficará disponível no seu <strong className="text-foreground">menu iniciar</strong> ou <strong className="text-foreground">dock</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <p className="text-sm text-primary/90">
          <strong>Dica:</strong> Use Chrome ou Edge para a melhor experiência de instalação no desktop. 
          Firefox e Safari não suportam instalação de PWA no computador.
        </p>
      </div>
    </div>
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [defaultTab, setDefaultTab] = useState("android");

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Detect platform for default tab
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const android = /android/i.test(navigator.userAgent);
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    
    if (iOS) {
      setDefaultTab("ios");
    } else if (android || mobile) {
      setDefaultTab("android");
    } else {
      setDefaultTab("desktop");
    }

    // For other browsers, listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowDialog(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Always show the dialog with instructions
    setShowDialog(true);
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowDialog(false);
      }
    }
  };

  // Don't show button if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
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

      {/* Installation Instructions Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-border/50">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Instalar Stream Radar</h2>
                <p className="text-sm text-muted-foreground">Acesse mais rápido direto da sua tela inicial</p>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Check className="h-3 w-3" /> Acesso rápido
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Check className="h-3 w-3" /> Tela cheia
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Check className="h-3 w-3" /> 100% grátis
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-6">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="w-full mb-4 bg-muted/50">
                <TabsTrigger value="ios" className="flex-1 gap-1.5 data-[state=active]:bg-background">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  iPhone
                </TabsTrigger>
                <TabsTrigger value="android" className="flex-1 gap-1.5 data-[state=active]:bg-background">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.44-.65-3.05-1.01-4.76-1.01-1.71 0-3.32.36-4.76 1.01L5.08 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L5.79 9.48C2.83 11.11.86 14.05.86 17.48h22.28c0-3.43-1.97-6.37-4.94-8zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                  </svg>
                  Android
                </TabsTrigger>
                <TabsTrigger value="desktop" className="flex-1 gap-1.5 data-[state=active]:bg-background">
                  <Monitor className="h-4 w-4" />
                  PC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="mt-0">
                <IOSInstructions />
              </TabsContent>

              <TabsContent value="android" className="mt-0">
                <AndroidInstructions />
                {deferredPrompt && (
                  <Button onClick={handleNativeInstall} className="w-full mt-4 gap-2" size="lg">
                    <Download className="h-4 w-4" />
                    Instalar Agora
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="desktop" className="mt-0">
                <DesktopInstructions />
                {deferredPrompt && (
                  <Button onClick={handleNativeInstall} className="w-full mt-4 gap-2" size="lg">
                    <Download className="h-4 w-4" />
                    Instalar Agora
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
