import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tv, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  Film
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { AddToListDialog } from "@/components/AddToListDialog";
import { handleProviderClick as handleDeepLink, getProviderDeepLink, isPWAStandalone } from "@/lib/deepLinks";
import { deduplicateProviders } from "@/lib/providerUtils";
import { ReportAvailabilityDialog } from "@/components/ReportAvailabilityDialog";
import { InArticleAd } from "@/components/AdBanner";

export default function TVShowDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const tvId = parseInt(id || "0");

  const { data: show, isLoading } = trpc.content.getTVShowDetails.useQuery(
    { tvId },
    { enabled: tvId > 0 }
  );

  const { data: isInWatchlist } = trpc.watchlist.isInWatchlist.useQuery(
    { tmdbId: tvId, mediaType: "tv" },
    { enabled: isAuthenticated && tvId > 0 }
  );

  const { data: similarShows } = trpc.content.getSimilar.useQuery(
    { mediaType: "tv", id: tvId, page: 1 },
    { enabled: tvId > 0 }
  );

  const { data: isWatched } = trpc.viewingHistory.isWatched.useQuery(
    { tmdbId: tvId, mediaType: "tv" },
    { enabled: isAuthenticated && tvId > 0 }
  );

  const [showListDialog, setShowListDialog] = useState(false);

  const utils = trpc.useUtils();
  
  const addToWatchlist = trpc.watchlist.add.useMutation({
    onSuccess: () => {
      utils.watchlist.isInWatchlist.invalidate();
      toast.success("Adicionado à sua lista!");
    },
  });

  const removeFromWatchlist = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      utils.watchlist.isInWatchlist.invalidate();
      toast.success("Removido da sua lista");
    },
  });

  const trackClick = trpc.affiliate.trackClick.useMutation();

  const markAsWatchedMutation = trpc.viewingHistory.add.useMutation({
    onSuccess: () => {
      utils.viewingHistory.get.invalidate();
      utils.viewingHistory.isWatched.invalidate({ tmdbId: tvId, mediaType: "tv" });
      toast.success("Marcado como assistido!");
    },
  });

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!show) return;

    if (isInWatchlist) {
      removeFromWatchlist.mutate({
        tmdbId: tvId,
        mediaType: "tv",
      });
    } else {
      addToWatchlist.mutate({
        tmdbId: tvId,
        mediaType: "tv",
        title: show.name,
        posterPath: show.poster_path,
        releaseDate: show.first_air_date,
      });
    }
  };

  const handleMarkAsWatched = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!show) return;

    markAsWatchedMutation.mutate({
      tmdbId: tvId,
      mediaType: "tv",
      title: show.name,
      posterPath: show.poster_path,
    });
  };

  const handleProviderClick = (provider: any, clickType: 'stream' | 'rent' | 'buy', event: React.MouseEvent) => {
    event.preventDefault();
    
    // Track affiliate click via tRPC mutation
    trackClick.mutate({
      tmdbId: tvId,
      mediaType: "tv",
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      clickType,
    });
    
    // Handle deep linking with both localized and original title
    // Uses PWA-aware method that works in standalone mode
    handleDeepLink(provider.provider_id, provider.provider_name, "tv", tvId, show?.name, show?.original_name);
  };

  const getImageUrl = (path: string | null, size: string = "w500") => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getProviderUrl = (provider: any) => {
    // Provide real URL in href for PWA compatibility and accessibility
    return getProviderDeepLink(provider.provider_id, "tv", tvId, show?.name, show?.original_name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <div className="text-center">
          <Tv className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-foreground text-xl mb-4">Série não encontrada</p>
          <Button onClick={() => setLocation("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  const providers = show.watchProviders;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getImageUrl(show.backdrop_path, "w1280")}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative py-12">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Poster */}
            <div className="mx-auto md:mx-0">
              <img
                src={getImageUrl(show.poster_path)}
                alt={show.name}
                className="rounded-lg shadow-2xl w-full max-w-[300px]"
              />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{show.name}</h1>
                {show.tagline && (
                  <p className="text-lg text-muted-foreground italic">{show.tagline}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {show.vote_average > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">
                      {show.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}

                {show.first_air_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(show.first_air_date).getFullYear()}</span>
                  </div>
                )}

                {show.number_of_seasons && (
                  <Badge variant="secondary">
                    {show.number_of_seasons} {show.number_of_seasons === 1 ? "temporada" : "temporadas"}
                  </Badge>
                )}

                {show.number_of_episodes && (
                  <Badge variant="secondary">
                    {show.number_of_episodes} episódios
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {show.genres?.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => setShowListDialog(true)}
                    className="gap-2"
                  >
                    <Bookmark className="h-5 w-5" />
                    Adicionar à lista
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="gap-2"
                  >
                    <Bookmark className="h-5 w-5" />
                    Adicionar à lista
                  </Button>
                )}

                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant={isWatched ? "outline" : "secondary"}
                    onClick={handleMarkAsWatched}
                    className="gap-2"
                    disabled={isWatched}
                  >
                    <Tv className="h-5 w-5" />
                    {isWatched ? "Assistido" : "Marcar como assistido"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="gap-2"
                  >
                    <Tv className="h-5 w-5" />
                    Marcar como assistido
                  </Button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Sinopse</h3>
                <p className="text-muted-foreground leading-relaxed">{show.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Availability */}
      <div className="container py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Onde Assistir no Brasil</h2>

        {providers ? (
          <div className="space-y-8">
            {/* Streaming */}
            {providers.flatrate && providers.flatrate.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Streaming</h3>
                  <div className="flex flex-wrap gap-4">
                    {deduplicateProviders(providers.flatrate).map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'stream', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all w-16 h-16">
                          <img
                            src={getImageUrl(provider.logo_path, "w92")}
                            alt={provider.provider_name}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          {provider.provider_name}
                        </p>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rent & Buy sections similar to movie */}
            {providers.rent && providers.rent.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Alugar</h3>
                  <div className="flex flex-wrap gap-4">
                    {deduplicateProviders(providers.rent).map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'rent', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all w-16 h-16">
                          <img
                            src={getImageUrl(provider.logo_path, "w92")}
                            alt={provider.provider_name}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          {provider.provider_name}
                        </p>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {providers.buy && providers.buy.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Comprar</h3>
                  <div className="flex flex-wrap gap-4">
                    {deduplicateProviders(providers.buy).map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'buy', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all w-16 h-16">
                          <img
                            src={getImageUrl(provider.logo_path, "w92")}
                            alt={provider.provider_name}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          {provider.provider_name}
                        </p>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Não encontramos informações de disponibilidade para esta série no Brasil.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Dados de disponibilidade fornecidos por{" "}
            <a
              href="https://www.justwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              JustWatch
            </a>
          </p>
          {show && (
            <ReportAvailabilityDialog
              tmdbId={show.id}
              mediaType="tv"
              title={show.name}
              providers={[
                ...(providers?.flatrate || []),
                ...(providers?.rent || []),
                ...(providers?.buy || []),
              ]}
            />
          )}
        </div>
      </div>

      {/* Similar TV Shows */}
      {similarShows && similarShows.results && similarShows.results.length > 0 && (
        <div className="container py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Séries Similares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarShows.results.slice(0, 12).map((similarShow: any) => (
              <Link key={similarShow.id} href={`/tv/${similarShow.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-2 aspect-[2/3]">
                    <img
                      src={getImageUrl(similarShow.poster_path, "w342")}
                      alt={similarShow.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                  </div>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {similarShow.name}
                  </h3>
                  {similarShow.first_air_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(similarShow.first_air_date).getFullYear()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ad placement before footer */}
      <div className="container">
        <InArticleAd />
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

      {/* Add to List Dialog */}
      {show && (
        <AddToListDialog
          open={showListDialog}
          onOpenChange={setShowListDialog}
          tmdbId={tvId}
          mediaType="tv"
          title={show.name}
          posterPath={show.poster_path}
          releaseDate={show.first_air_date}
        />
      )}
    </div>
  );
}
