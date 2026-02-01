import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Film, 
  Bookmark, 
  BookmarkCheck, 
  Bell, 
  Star, 
  Calendar, 
  Clock,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function MovieDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const movieId = parseInt(id || "0");

  const { data: movie, isLoading } = trpc.content.getMovieDetails.useQuery(
    { movieId },
    { enabled: movieId > 0 }
  );

  const { data: isInWatchlist } = trpc.watchlist.isInWatchlist.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: isAuthenticated && movieId > 0 }
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

    if (!movie) return;

    if (isInWatchlist) {
      removeFromWatchlist.mutate({
        tmdbId: movieId,
        mediaType: "movie",
      });
    } else {
      addToWatchlist.mutate({
        tmdbId: movieId,
        mediaType: "movie",
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
      });
    }
  };

  const handleProviderClick = (provider: any, clickType: 'stream' | 'rent' | 'buy') => {
    trackClick.mutate({
      tmdbId: movieId,
      mediaType: "movie",
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      clickType,
    });
  };

  const getImageUrl = (path: string | null, size: string = "w500") => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getProviderUrl = (provider: any) => {
    // Deep link for mobile or web URL
    return `https://www.justwatch.com/br/filme/${movie?.title?.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl mb-4">Filme não encontrado</p>
          <Button onClick={() => setLocation("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  const providers = movie.watchProviders;

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

      {/* Hero Section with Backdrop */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getImageUrl(movie.backdrop_path, "w1280")}
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
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="rounded-lg shadow-2xl w-full max-w-[300px]"
              />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-lg text-muted-foreground italic">{movie.tagline}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}

                {movie.release_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre: any) => (
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
                <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
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
                        onClick={() => handleProviderClick(provider, 'stream')}
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

            {/* Rent */}
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
                        onClick={() => handleProviderClick(provider, 'rent')}
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

            {/* Buy */}
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
                        onClick={() => handleProviderClick(provider, 'buy')}
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
                Não encontramos informações de disponibilidade para este filme no Brasil.
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
