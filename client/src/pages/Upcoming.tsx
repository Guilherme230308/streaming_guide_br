import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Film, Tv, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.png";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export default function Upcoming() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");

  const { data: upcomingMovies, isLoading: loadingMovies } = trpc.content.getUpcoming.useQuery({
    mediaType: "movie",
    page: 1,
  });

  const { data: upcomingTVShows, isLoading: loadingTV } = trpc.content.getUpcoming.useQuery({
    mediaType: "tv",
    page: 1,
  });

  const utils = trpc.useUtils();

  // Get user's alerts to check if alert already exists
  const { data: userAlerts } = trpc.alerts.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createAlert = trpc.alerts.create.useMutation({
    onSuccess: () => {
      toast.success("Alerta criado! Você será notificado quando estiver disponível.");
      utils.alerts.get.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao criar alerta: " + error.message);
    },
  });

  // Check if alert exists for a specific content
  const hasAlert = (tmdbId: number, mediaType: "movie" | "tv") => {
    if (!userAlerts) return false;
    return userAlerts.some(
      (alert) => alert.tmdbId === tmdbId && alert.mediaType === mediaType
    );
  };

  const handleCreateAlert = (tmdbId: number, title: string, mediaType: "movie" | "tv") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    createAlert.mutate({
      tmdbId,
      mediaType,
      title,
      providerId: undefined,
      providerName: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Em Breve
              </h1>
              <p className="text-sm text-muted-foreground">
                Lançamentos futuros nos streamings do Brasil
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "movie" | "tv")}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="movie" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Filmes
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              Séries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movie">
            {loadingMovies ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : upcomingMovies && upcomingMovies.results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {upcomingMovies.results.map((movie: any) => (
                  <Card key={movie.id} className="overflow-hidden group">
                    <Link href={`/movie/${movie.id}`}>
                      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                        <img
                          src={getImageUrl(movie.poster_path, "w342")}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {movie.release_date && (
                          <Badge className="absolute top-2 right-2 bg-primary/90">
                            {new Date(movie.release_date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-3">
                      <Link href={`/movie/${movie.id}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary">
                          {movie.title}
                        </h3>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCreateAlert(movie.id, movie.title, "movie")}
                        disabled={createAlert.isPending || hasAlert(movie.id, "movie")}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        {hasAlert(movie.id, "movie") ? "Alerta Criado" : "Criar Alerta"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum filme em breve encontrado</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tv">
            {loadingTV ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : upcomingTVShows && upcomingTVShows.results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {upcomingTVShows.results.map((show: any) => (
                  <Card key={show.id} className="overflow-hidden group">
                    <Link href={`/tv/${show.id}`}>
                      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                        <img
                          src={getImageUrl(show.poster_path, "w342")}
                          alt={show.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {show.first_air_date && (
                          <Badge className="absolute top-2 right-2 bg-primary/90">
                            {new Date(show.first_air_date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-3">
                      <Link href={`/tv/${show.id}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary">
                          {show.name}
                        </h3>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCreateAlert(show.id, show.name, "tv")}
                        disabled={createAlert.isPending || hasAlert(show.id, "tv")}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        {hasAlert(show.id, "tv") ? "Alerta Criado" : "Criar Alerta"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma série em breve encontrada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
