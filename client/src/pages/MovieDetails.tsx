import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
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
import { AddToListDialog } from "@/components/AddToListDialog";
import { handleProviderClick as handleDeepLink, getProviderDeepLink, isPWAStandalone } from "@/lib/deepLinks";
import { deduplicateProviders } from "@/lib/providerUtils";
import { RatingStars } from "@/components/RatingStars";
import { ReviewDialog } from "@/components/ReviewDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReportAvailabilityDialog } from "@/components/ReportAvailabilityDialog";
import { InArticleAd } from "@/components/AdBanner";

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

  const { data: similarMovies } = trpc.content.getSimilar.useQuery(
    { mediaType: "movie", id: movieId, page: 1 },
    { enabled: movieId > 0 }
  );

  const { data: userRating } = trpc.ratings.getUserRating.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: isAuthenticated && movieId > 0 }
  );

  const { data: averageRating } = trpc.ratings.getAverage.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: movieId > 0 }
  );

  const { data: userReview } = trpc.reviews.getUserReview.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: isAuthenticated && movieId > 0 }
  );

  const { data: reviews } = trpc.reviews.getContentReviews.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: movieId > 0 }
  );

  const { data: isWatched } = trpc.viewingHistory.isWatched.useQuery(
    { tmdbId: movieId, mediaType: "movie" },
    { enabled: isAuthenticated && movieId > 0 }
  );

  const [showListDialog, setShowListDialog] = useState(false);
  const [showMarkAsWatchedDialog, setShowMarkAsWatchedDialog] = useState(false);

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

  const ratingMutation = trpc.ratings.upsert.useMutation({
    onSuccess: () => {
      utils.ratings.getUserRating.invalidate({ tmdbId: movieId, mediaType: "movie" });
      utils.ratings.getAverage.invalidate({ tmdbId: movieId, mediaType: "movie" });
      toast.success("Avaliação salva!");
    },
  });

  const deleteReviewMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      utils.reviews.getContentReviews.invalidate({ tmdbId: movieId, mediaType: "movie" });
      utils.reviews.getUserReview.invalidate({ tmdbId: movieId, mediaType: "movie" });
      toast.success("Review excluído!");
    },
  });

  const markAsWatchedMutation = trpc.viewingHistory.add.useMutation({
    onSuccess: () => {
      utils.viewingHistory.get.invalidate();
      utils.viewingHistory.isWatched.invalidate({ tmdbId: movieId, mediaType: "movie" });
      toast.success("Marcado como assistido!");
    },
  });

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

  const handleMarkAsWatched = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!movie) return;

    markAsWatchedMutation.mutate({
      tmdbId: movieId,
      mediaType: "movie",
      title: movie.title,
      posterPath: movie.poster_path,
    });
  };

  const handleProviderClick = (provider: any, clickType: 'stream' | 'rent' | 'buy', event: React.MouseEvent) => {
    event.preventDefault();
    
    // Track affiliate click via tRPC mutation
    trackClick.mutate({
      tmdbId: movieId,
      mediaType: "movie",
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      clickType,
    });
    
    // Handle deep linking with both localized and original title
    // Uses PWA-aware method that works in standalone mode
    handleDeepLink(provider.provider_id, provider.provider_name, "movie", movieId, movie?.title, movie?.original_title);
  };

  const getImageUrl = (path: string | null, size: string = "w500") => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getProviderUrl = (provider: any) => {
    // Provide real URL in href for PWA compatibility and accessibility
    // In PWA standalone mode, the native <a> tag behavior is more reliable
    return getProviderDeepLink(provider.provider_id, "movie", movieId, movie?.title, movie?.original_title);
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
                    <Clock className="h-5 w-5" />
                    {isWatched ? "Assistido" : "Marcar como assistido"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="gap-2"
                  >
                    <Clock className="h-5 w-5" />
                    Marcar como assistido
                  </Button>
                )}
              </div>

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

            {/* Rent */}
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

            {/* Buy */}
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
                Não encontramos informações de disponibilidade para este filme no Brasil.
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
          {movie && (
            <ReportAvailabilityDialog
              tmdbId={movie.id}
              mediaType="movie"
              title={movie.title}
              providers={[
                ...(providers?.flatrate || []),
                ...(providers?.rent || []),
                ...(providers?.buy || []),
              ]}
            />
          )}
        </div>
      </div>

      {/* Ad placement between streaming and reviews */}
      <div className="container">
        <InArticleAd />
      </div>

      {/* Ratings and Reviews */}
      <div className="container py-12 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Avaliações e Reviews</h2>
          
          {/* User Rating */}
          {isAuthenticated ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sua Avaliação</h3>
                    <RatingStars
                      rating={userRating?.rating || 0}
                      onRatingChange={(rating) => {
                        ratingMutation.mutate({ tmdbId: movieId, mediaType: "movie", rating });
                        
                        // Ask if user wants to mark as watched
                        if (!isWatched && movie) {
                          setTimeout(() => {
                            setShowMarkAsWatchedDialog(true);
                          }, 500);
                        }
                      }}
                      size="lg"
                    />
                  </div>
                  <ReviewDialog
                    tmdbId={movieId}
                    mediaType="movie"
                    existingReview={userReview}
                    onSuccess={() => {
                      utils.reviews.getUserReview.invalidate({ tmdbId: movieId, mediaType: "movie" });
                      utils.reviews.getContentReviews.invalidate({ tmdbId: movieId, mediaType: "movie" });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Faça login para avaliar e escrever um review</p>
                <Button onClick={() => window.location.href = getLoginUrl()}>
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Average Rating */}
          {averageRating && averageRating.count > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <RatingStars rating={Math.round(averageRating.average)} readonly size="md" />
                <span className="text-lg font-semibold">
                  {averageRating.average.toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground">
                {averageRating.count} {averageRating.count === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{review.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Por {review.userName} • {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {isAuthenticated && user?.id === review.userId && (
                        <div className="flex gap-2">
                          <ReviewDialog
                            tmdbId={movieId}
                            mediaType="movie"
                            existingReview={{
                              id: review.id,
                              title: review.title,
                              content: review.content,
                            }}
                            onSuccess={() => {
                              utils.reviews.getContentReviews.invalidate({ tmdbId: movieId, mediaType: "movie" });
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este review?")) {
                                deleteReviewMutation.mutate({ reviewId: review.id });
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{review.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum review ainda. Seja o primeiro a escrever!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {similarMovies && similarMovies.results && similarMovies.results.length > 0 && (
        <div className="container py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Filmes Similares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarMovies.results.slice(0, 12).map((similarMovie: any) => (
              <Link key={similarMovie.id} href={`/movie/${similarMovie.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-2 aspect-[2/3]">
                    <img
                      src={getImageUrl(similarMovie.poster_path, "w342")}
                      alt={similarMovie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                  </div>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {similarMovie.title}
                  </h3>
                  {similarMovie.release_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(similarMovie.release_date).getFullYear()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
      {movie && (
        <AddToListDialog
          open={showListDialog}
          onOpenChange={setShowListDialog}
          tmdbId={movieId}
          mediaType="movie"
          title={movie.title}
          posterPath={movie.poster_path}
          releaseDate={movie.release_date}
        />
      )}

      {/* Mark as Watched Confirmation Dialog */}
      {movie && (
        <ConfirmDialog
          open={showMarkAsWatchedDialog}
          onOpenChange={setShowMarkAsWatchedDialog}
          title="Marcar como Assistido"
          description="Deseja marcar este filme como assistido?"
          confirmText="Sim, marcar"
          cancelText="Não"
          onConfirm={() => {
            markAsWatchedMutation.mutate({
              tmdbId: movieId,
              mediaType: "movie",
              title: movie.title,
              posterPath: movie.poster_path,
            });
            setShowMarkAsWatchedDialog(false);
          }}
        />
      )}
    </div>
  );
}
