import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Bell, BellOff, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Alerts() {
  const { user, isAuthenticated } = useAuth();

  const { data: alerts, isLoading } = trpc.alerts.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();

  const deleteAlert = trpc.alerts.delete.useMutation({
    onSuccess: () => {
      utils.alerts.get.invalidate();
      toast.success("Alerta removido");
    },
  });

  const toggleAlert = trpc.alerts.toggle.useMutation({
    onSuccess: () => {
      utils.alerts.get.invalidate();
      toast.success("Alerta atualizado");
    },
  });

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  const getMediaTypeLabel = (mediaType: string) => {
    return mediaType === "movie" ? "Filme" : "Série";
  };

  const getContentLink = (alert: any) => {
    return alert.mediaType === "movie" ? `/movie/${alert.tmdbId}` : `/tv/${alert.tmdbId}`;
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
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Faça login para gerenciar alertas</h1>
          <p className="text-muted-foreground mb-6">
            Receba notificações quando conteúdo chegar nos seus serviços de streaming
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
              <Link href="/alerts">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <span className="text-sm">Alertas</span>
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
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Alertas</h1>
          <p className="text-muted-foreground">
            Gerencie notificações para quando conteúdo chegar nos seus serviços de streaming
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Bell className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="grid gap-4">
            {alerts.map((alert: any) => (
              <Card key={alert.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Link href={getContentLink(alert)}>
                      <img
                        src={getImageUrl(alert.posterPath)}
                        alt={alert.title}
                        className="w-24 h-36 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={getContentLink(alert)}>
                            <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                              {alert.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {getMediaTypeLabel(alert.mediaType)}
                            </Badge>
                            {alert.releaseDate && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.releaseDate).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleAlert.mutate({
                                alertId: alert.id,
                                isActive: !alert.isActive,
                              })
                            }
                          >
                            {alert.isActive ? (
                              <Bell className="h-4 w-4 text-primary" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlert.mutate({ alertId: alert.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Notificar quando disponível em:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {alert.targetProviders && alert.targetProviders.length > 0 ? (
                            alert.targetProviders.map((provider: string) => (
                              <Badge key={provider} variant="outline">
                                {provider}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Qualquer serviço
                            </span>
                          )}
                        </div>
                      </div>

                      {!alert.isActive && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          ⏸️ Alerta pausado
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum alerta configurado
              </h3>
              <p className="text-muted-foreground mb-6">
                Adicione alertas nas páginas de filmes e séries para ser notificado quando
                chegarem nos seus serviços de streaming
              </p>
              <Link href="/">
                <Button>
                  Explorar Conteúdo
                </Button>
              </Link>
            </CardContent>
          </Card>
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
