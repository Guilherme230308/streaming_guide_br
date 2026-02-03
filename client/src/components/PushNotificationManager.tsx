import { useState, useEffect } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Get VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

// Convert base64 URL to Uint8Array for subscription
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const subscribeMutation = trpc.push.subscribe.useMutation();
  const unsubscribeMutation = trpc.push.unsubscribe.useMutation();
  const checkSubscriptionQuery = trpc.push.checkSubscription.useQuery(undefined, {
    enabled: isSupported,
  });
  
  useEffect(() => {
    // Check if push notifications are supported
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);
  
  useEffect(() => {
    if (checkSubscriptionQuery.data !== undefined) {
      setIsSubscribed(checkSubscriptionQuery.data.isSubscribed);
    }
  }, [checkSubscriptionQuery.data]);
  
  async function checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }
  
  async function registerPushServiceWorker() {
    try {
      // Register the push service worker
      const registration = await navigator.serviceWorker.register("/sw-push.js", {
        scope: "/"
      });
      console.log("Push SW registered:", registration);
      return registration;
    } catch (error) {
      console.error("Push SW registration failed:", error);
      throw error;
    }
  }
  
  async function subscribeToPush() {
    setIsLoading(true);
    
    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== "granted") {
        toast.error("Permissão negada", {
          description: "Você precisa permitir notificações para receber alertas.",
        });
        setIsLoading(false);
        return;
      }
      
      // Register push service worker
      const registration = await registerPushServiceWorker();
      await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      
      // Get subscription keys
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || "";
      const auth = subscriptionJson.keys?.auth || "";
      
      // Save subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      });
      
      setIsSubscribed(true);
      toast.success("Notificações ativadas!", {
        description: "Você receberá alertas quando filmes da sua lista ficarem disponíveis.",
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error("Erro ao ativar notificações", {
        description: "Não foi possível ativar as notificações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function unsubscribeFromPush() {
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();
        
        // Remove subscription from server
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }
      
      setIsSubscribed(false);
      toast.success("Notificações desativadas", {
        description: "Você não receberá mais alertas de disponibilidade.",
      });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast.error("Erro ao desativar notificações", {
        description: "Não foi possível desativar as notificações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleToggle(enabled: boolean) {
    if (enabled) {
      await subscribeToPush();
    } else {
      await unsubscribeFromPush();
    }
  }
  
  if (!isSupported) {
    return null;
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={isSubscribed ? "Notificações ativadas" : "Ativar notificações"}
        >
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {isSubscribed && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Notificações Push
          </DialogTitle>
          <DialogDescription>
            Receba alertas quando filmes e séries da sua lista ficarem disponíveis nos seus streamings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Main toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-toggle" className="text-base">
                Ativar notificações
              </Label>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? "Você está recebendo alertas de disponibilidade" 
                  : "Ative para receber alertas quando conteúdo ficar disponível"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Switch
                id="push-toggle"
                checked={isSubscribed}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Permission status */}
          {permission === "denied" && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              <p className="font-medium">Notificações bloqueadas</p>
              <p className="mt-1">
                Você bloqueou as notificações no navegador. Para ativar, acesse as configurações do site no seu navegador e permita notificações.
              </p>
            </div>
          )}
          
          {/* Info about notifications */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">Você será notificado quando:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Um filme ou série da sua lista ficar disponível em um streaming que você assina
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Um alerta que você criou for acionado (conteúdo ficou disponível)
              </li>
            </ul>
          </div>
          
          {/* Test notification button (only when subscribed) */}
          {isSubscribed && (
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  const registration = await navigator.serviceWorker.ready;
                  await registration.showNotification("Teste de Notificação", {
                    body: "As notificações estão funcionando corretamente!",
                    icon: "/icon-192.png",
                    badge: "/icon-192.png",
                  });
                  toast.success("Notificação enviada!", {
                    description: "Verifique se você recebeu a notificação de teste.",
                  });
                } catch (error) {
                  toast.error("Erro", {
                    description: "Não foi possível enviar a notificação de teste.",
                  });
                }
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Enviar notificação de teste
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
