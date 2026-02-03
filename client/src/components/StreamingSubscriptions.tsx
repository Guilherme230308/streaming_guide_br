import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Popular streaming services in Brazil with their TMDB provider IDs
const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", logo: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg" },
  { id: 119, name: "Amazon Prime Video", logo: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg" },
  { id: 1899, name: "Max", logo: "/6Q3ZYUNA9Hsgj6iWnVsw2gR5V6z.jpg" },
  { id: 337, name: "Disney+", logo: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
  { id: 531, name: "Paramount+", logo: "/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg" },
  { id: 307, name: "Globoplay", logo: "/kICQccvOh8AIBMHGkBXJ047xeHN.jpg" },
  { id: 350, name: "Apple TV+", logo: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { id: 283, name: "Crunchyroll", logo: "/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg" },
  { id: 384, name: "Claro video", logo: "/fWqVPYArdFwBc6vYqoyQB6pMRdI.jpg" },
  { id: 1853, name: "Claro tv+", logo: "/xEWgUq2tJyggisxbJ3fNOV9Inj9.jpg" },
];

export function StreamingSubscriptions() {
  const [isAdding, setIsAdding] = useState<number | null>(null);
  
  const { data: userSubscriptions, isLoading } = trpc.subscriptions.get.useQuery();
  const utils = trpc.useUtils();

  const addSubscription = trpc.subscriptions.add.useMutation({
    onSuccess: () => {
      utils.subscriptions.get.invalidate();
      toast.success("Streaming adicionado!");
      setIsAdding(null);
    },
    onError: () => {
      toast.error("Erro ao adicionar streaming");
      setIsAdding(null);
    },
  });

  const removeSubscription = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      utils.subscriptions.get.invalidate();
      toast.success("Streaming removido");
    },
    onError: () => {
      toast.error("Erro ao remover streaming");
    },
  });

  const toggleSubscription = trpc.subscriptions.toggle.useMutation({
    onMutate: async ({ providerId, isActive }) => {
      await utils.subscriptions.get.cancel();
      const previousData = utils.subscriptions.get.getData();
      
      utils.subscriptions.get.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((sub) =>
          sub.providerId === providerId ? { ...sub, isActive } : sub
        );
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.subscriptions.get.setData(undefined, context.previousData);
      }
      toast.error("Erro ao atualizar streaming");
    },
    onSettled: () => {
      utils.subscriptions.get.invalidate();
    },
  });

  const isSubscribed = (providerId: number) => {
    return userSubscriptions?.some((sub) => sub.providerId === providerId);
  };

  const getSubscription = (providerId: number) => {
    return userSubscriptions?.find((sub) => sub.providerId === providerId);
  };

  const handleAddSubscription = (provider: typeof STREAMING_PROVIDERS[0]) => {
    setIsAdding(provider.id);
    addSubscription.mutate({
      providerId: provider.id,
      providerName: provider.name,
    });
  };

  const handleRemoveSubscription = (providerId: number) => {
    removeSubscription.mutate({ providerId });
  };

  const handleToggleSubscription = (providerId: number, isActive: boolean) => {
    toggleSubscription.mutate({ providerId, isActive });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Streamings</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Streamings</CardTitle>
        <CardDescription>
          Selecione os serviços de streaming que você assina para receber alertas quando filmes da sua lista ficarem disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {STREAMING_PROVIDERS.map((provider) => {
            const subscription = getSubscription(provider.id);
            const subscribed = isSubscribed(provider.id);

            return (
              <div
                key={provider.id}
                className={`relative flex flex-col items-center p-4 rounded-lg border transition-all ${
                  subscribed
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo}`}
                  alt={provider.name}
                  className="w-16 h-16 rounded-lg object-cover mb-2"
                />
                <span className="text-sm font-medium text-center mb-2">
                  {provider.name}
                </span>

                {subscribed ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`switch-${provider.id}`}
                        checked={subscription?.isActive ?? true}
                        onCheckedChange={(checked) =>
                          handleToggleSubscription(provider.id, checked)
                        }
                      />
                      <Label
                        htmlFor={`switch-${provider.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        {subscription?.isActive ? "Ativo" : "Pausado"}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => handleRemoveSubscription(provider.id)}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddSubscription(provider)}
                    disabled={isAdding === provider.id}
                  >
                    {isAdding === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </>
                    )}
                  </Button>
                )}

                {subscribed && subscription?.isActive && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {userSubscriptions && userSubscriptions.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{userSubscriptions.filter((s) => s.isActive).length}</strong> streaming(s) ativo(s).
              Você receberá alertas quando filmes da sua lista ficarem disponíveis nesses serviços.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
