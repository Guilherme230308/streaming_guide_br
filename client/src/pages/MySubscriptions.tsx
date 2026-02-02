import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Check } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// Popular streaming providers in Brazil
const BRAZILIAN_PROVIDERS = [
  { id: 8, name: "Netflix", logo: "/emthp0a1h0v6itkgswcgpd0cqT.jpg" },
  { id: 119, name: "Amazon Prime Video", logo: "/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 1899, name: "HBO Max", logo: "/jbe4gVSfRlbPTdESXhEKpornsfu.jpg" },
  { id: 337, name: "Disney Plus", logo: "/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg" },
  { id: 619, name: "Star Plus", logo: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { id: 531, name: "Paramount Plus", logo: "/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg" },
  { id: 2, name: "Apple TV", logo: "/SPnB1qiCkYfirS2it3hZORwGVn.jpg" },
  { id: 307, name: "Globoplay", logo: "/5vfrJQgNe9UnSIWOsAF3x797zPu.jpg" },
  { id: 1853, name: "Claro video", logo: "/aNdVOxHXVPXhSxvZiGrCGWOXqUW.jpg" },
  { id: 167, name: "Claro video", logo: "/hR9vWn5FKRLRplrxewe6ggOvKd0.jpg" },
];

export default function MySubscriptions() {
  const { user, isAuthenticated } = useAuth();

  const { data: subscriptions, isLoading } = trpc.subscriptions.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();
  
  const addSubscription = trpc.subscriptions.add.useMutation({
    onSuccess: () => {
      utils.subscriptions.get.invalidate();
      toast.success("Assinatura adicionada");
    },
  });

  const removeSubscription = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      utils.subscriptions.get.invalidate();
      toast.success("Assinatura removida");
    },
  });

  const getImageUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/w92${path}`;
  };

  const isSubscribed = (providerId: number) => {
    if (!subscriptions) return false;
    return subscriptions.some((sub: any) => sub.providerId === providerId && sub.isActive);
  };

  const handleToggleSubscription = (providerId: number, providerName: string) => {
    if (isSubscribed(providerId)) {
      removeSubscription.mutate({ providerId });
    } else {
      addSubscription.mutate({ providerId, providerName });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
          <div className="container py-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Film className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="container py-20 text-center">
          <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Faça login para gerenciar suas assinaturas</h1>
          <p className="text-muted-foreground mb-6">
            Selecione os serviços de streaming que você assina
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Film className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
              </div>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink min-w-0">
              <Link href="/watchlist">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <span className="text-sm">Minha Lista</span>
                </Button>
              </Link>
              <Link href="/subscriptions">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <span className="text-sm">Assinaturas</span>
                </Button>
              </Link>
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[150px]">
                Olá, {user?.name || "Usuário"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Assinaturas</h1>
          <p className="text-muted-foreground">
            Selecione os serviços de streaming que você assina para filtrar conteúdo disponível
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BRAZILIAN_PROVIDERS.map((provider) => {
              const subscribed = isSubscribed(provider.id);
              
              return (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    subscribed ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleToggleSubscription(provider.id, provider.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <img
                          src={getImageUrl(provider.logo)}
                          alt={provider.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        {subscribed && (
                          <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground">{provider.name}</h3>
                        {subscribed ? (
                          <Badge variant="default" className="mt-2">
                            Assinado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">
                            Não assinado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {subscriptions && subscriptions.length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Use o filtro "Minhas Assinaturas" na busca para ver apenas
              conteúdo disponível nos seus serviços
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Onde Assistir. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
