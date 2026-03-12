import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Bell, BellOff, Trash2, CheckCircle, Clock, Sparkles, AlertCircle, Play } from "lucide-react";
import { LoginPromptPage } from "@/components/LoginPrompt";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Alerts() {
  const { user, isAuthenticated } = useAuth();

  const { data: alerts, isLoading: alertsLoading } = trpc.alerts.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: watchlistAvailability, isLoading: availabilityLoading } = 
    trpc.alerts.checkWatchlistAvailability.useQuery(
      undefined,
      { enabled: isAuthenticated }
    );

  const { data: subscriptions } = trpc.subscriptions.get.useQuery(
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

  const createAlertFromWatchlist = trpc.alerts.createFromWatchlist.useMutation({
    onSuccess: (data) => {
      utils.alerts.get.invalidate();
      toast.success(data.message || "Alerta criado!");
    },
    onError: () => {
      toast.error("Erro ao criar alerta");
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

  const hasActiveSubscriptions = subscriptions && subscriptions.filter((s: any) => s.isActive).length > 0;

  if (!isAuthenticated) {
    return (
      <LoginPromptPage
        title="Alertas e Notificações"
        description="Crie uma conta gratuita para receber notificações quando filmes e séries chegarem nos seus serviços de streaming."
        icon={<Bell className="h-16 w-16 text-primary/50" />}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Content */}
      <div className="container py-8 max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Alertas e Disponibilidade</h1>
            <p className="text-muted-foreground">
              Veja o que está disponível nos seus streamings e configure alertas
            </p>
          </div>
          <PushNotificationManager />
        </div>

        {!hasActiveSubscriptions && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Configure seus streamings</p>
                  <p className="text-sm text-muted-foreground">
                    Para ver o que está disponível, primeiro{" "}
                    <Link href="/subscriptions" className="text-primary hover:underline">
                      selecione seus serviços de streaming
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Disponível Agora</span>
              <span className="sm:hidden">Disponível</span>
              {watchlistAvailability?.availableItems && watchlistAvailability.availableItems.length > 0 && (
                <Badge variant="default" className="ml-1">
                  {watchlistAvailability.availableItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unavailable" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Não Disponível</span>
              <span className="sm:hidden">Aguardando</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Alertas</span>
              {alerts && alerts.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Available Now Tab */}
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Disponível nos seus Streamings
                </CardTitle>
                <CardDescription>
                  Filmes e séries da sua lista que você pode assistir agora
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Verificando disponibilidade...</p>
                  </div>
                ) : watchlistAvailability?.availableItems && watchlistAvailability.availableItems.length > 0 ? (
                  <div className="grid gap-4">
                    {watchlistAvailability.availableItems.map(({ item, providers }) => (
                      <div key={`${item.tmdbId}-${item.mediaType}`} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Link href={item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`}>
                          <img
                            src={getImageUrl(item.posterPath)}
                            alt={item.title}
                            className="w-20 h-30 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                              {item.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getMediaTypeLabel(item.mediaType)}
                            </Badge>
                            {item.releaseDate && (
                              <span className="text-xs text-muted-foreground">
                                {item.releaseDate.substring(0, 4)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-muted-foreground">Disponível em:</span>
                            <div className="flex gap-1">
                              {providers.map((provider) => (
                                <img
                                  key={provider.id}
                                  src={`https://image.tmdb.org/t/p/w45${provider.logo}`}
                                  alt={provider.name}
                                  title={provider.name}
                                  className="w-6 h-6 rounded"
                                />
                              ))}
                            </div>
                          </div>
                          <Link href={item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`}>
                            <Button size="sm" className="mt-3">
                              <Play className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {hasActiveSubscriptions 
                        ? "Nenhum item da sua lista está disponível nos seus streamings no momento"
                        : "Configure seus streamings para ver o que está disponível"}
                    </p>
                    {!hasActiveSubscriptions && (
                      <Link href="/subscriptions">
                        <Button variant="outline">Configurar Streamings</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unavailable Tab */}
          <TabsContent value="unavailable">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Não Disponível
                </CardTitle>
                <CardDescription>
                  Itens da sua lista que ainda não estão nos seus streamings. Crie alertas para ser notificado!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Verificando disponibilidade...</p>
                  </div>
                ) : watchlistAvailability?.unavailableItems && watchlistAvailability.unavailableItems.length > 0 ? (
                  <div className="grid gap-4">
                    {watchlistAvailability.unavailableItems.map((item: any) => {
                      const hasAlert = alerts?.some(
                        (a: any) => a.tmdbId === item.tmdbId && a.mediaType === item.mediaType
                      );
                      
                      return (
                        <div key={`${item.tmdbId}-${item.mediaType}`} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <Link href={item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`}>
                            <img
                              src={getImageUrl(item.posterPath)}
                              alt={item.title}
                              className="w-20 h-30 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer opacity-75"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link href={item.mediaType === "movie" ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`}>
                              <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                                {item.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getMediaTypeLabel(item.mediaType)}
                              </Badge>
                              {item.releaseDate && (
                                <span className="text-xs text-muted-foreground">
                                  {item.releaseDate.substring(0, 4)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Não disponível nos seus streamings
                            </p>
                            {hasAlert ? (
                              <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                                <Bell className="h-4 w-4" />
                                <span>Alerta ativo</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3"
                                onClick={() => createAlertFromWatchlist.mutate({
                                  tmdbId: item.tmdbId,
                                  mediaType: item.mediaType as 'movie' | 'tv',
                                  title: item.title,
                                })}
                                disabled={createAlertFromWatchlist.isPending}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Criar Alerta
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Todos os itens da sua lista estão disponíveis!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Meus Alertas
                </CardTitle>
                <CardDescription>
                  Gerencie suas notificações de disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <div className="grid gap-4">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                        <Link href={getContentLink(alert)}>
                          <img
                            src={getImageUrl(alert.posterPath)}
                            alt={alert.title}
                            className="w-16 h-24 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                          />
                        </Link>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={getContentLink(alert)}>
                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                                  {alert.title}
                                </h3>
                              </Link>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {getMediaTypeLabel(alert.mediaType)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
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
                                className="h-8 w-8"
                                onClick={() => deleteAlert.mutate({ alertId: alert.id })}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2">
                            {alert.notified ? (
                              <div className="flex items-center gap-2 text-sm text-green-500">
                                <CheckCircle className="h-4 w-4" />
                                <span>Notificado em {new Date(alert.notifiedAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            ) : alert.isActive ? (
                              <div className="flex items-center gap-2 text-sm text-primary">
                                <Clock className="h-4 w-4" />
                                <span>Monitorando</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BellOff className="h-4 w-4" />
                                <span>Pausado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum alerta configurado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Crie alertas na aba "Não Disponível" para ser notificado quando conteúdo chegar nos seus streamings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
