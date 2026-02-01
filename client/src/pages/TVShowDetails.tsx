import { useAuth } from "@/_core/hooks/useAuth";
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
import { handleProviderClick as handleDeepLink } from "@/lib/deepLinks";

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

  const trackClick = trpc.affiliate.track.useMutation();

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

  const handleProviderClick = async (provider: any, clickType: 'stream' | 'rent' | 'buy', event: React.MouseEvent) => {
    event.preventDefault();
    
    // Track affiliate click
    trackClick.mutate({
      tmdbId: tvId,
      mediaType: "tv",
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      clickType,
    });
    
    // Handle deep linking
    await handleDeepLink(provider.provider_id, provider.provider_name, "tv", tvId);
  };

  const getImageUrl = (path: string | null, size: string = "w500") => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getProviderUrl = (provider: any) => {
    // Return # to prevent default navigation, actual navigation handled by onClick
    return "#";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Tv className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl mb-4">Série não encontrada</p>
          <Button onClick={() => setLocation("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  const providers = show.watchProviders;

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

            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

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

              <Button
                size="lg"
                variant={isInWatchlist ? "outline" : "default"}
                onClick={handleWatchlistToggle}
                className="gap-2"
              >
                {isInWatchlist ? (
                  <>
                    <BookmarkCheck className="h-5 w-5" />
                    Na minha lista
                  </>
                ) : (
                  <>
                    <Bookmark className="h-5 w-5" />
                    Adicionar à lista
                  </>
                )}
              </Button>

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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {providers.flatrate.map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'stream', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {providers.rent.map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'rent', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {providers.buy.map((provider: any) => (
                      <a
                        key={provider.provider_id}
                        href={getProviderUrl(provider)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleProviderClick(provider, 'buy', e)}
                        className="group"
                      >
                        <div className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all">
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

        <p className="text-xs text-muted-foreground mt-6 text-center">
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
