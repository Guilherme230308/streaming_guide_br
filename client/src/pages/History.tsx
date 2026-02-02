import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.png";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export default function History() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"history" | "recommendations">("history");

  const { data: history, isLoading: historyLoading } = trpc.viewingHistory.get.useQuery();
  
  const { data: movieRecommendations } = trpc.viewingHistory.getRecommendations.useQuery({
    mediaType: "movie",
    page: 1,
  }, {
    enabled: activeTab === "recommendations",
  });

  const { data: tvRecommendations } = trpc.viewingHistory.getRecommendations.useQuery({
    mediaType: "tv",
    page: 1,
  }, {
    enabled: activeTab === "recommendations",
  });

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
                <Clock className="h-6 w-6 text-primary" />
                Histórico & Recomendações
              </h1>
              <p className="text-sm text-muted-foreground">
                Veja o que você assistiu e descubra novo conteúdo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "history" | "recommendations")}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Para Você
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {historyLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : history && history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden group">
                    <Link href={`/${item.mediaType}/${item.tmdbId}`}>
                      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                        <img
                          src={getImageUrl(item.posterPath, "w342")}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 right-2 bg-primary/90">
                          {item.mediaType === "movie" ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                        </Badge>
                      </div>
                    </Link>
                    <CardContent className="p-3">
                      <Link href={`/${item.mediaType}/${item.tmdbId}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assistido em {new Date(item.watchedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Seu histórico está vazio</p>
                <p className="text-sm text-muted-foreground">
                  Marque filmes e séries como assistidos para ver recomendações personalizadas
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-8">
              {/* Movie Recommendations */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  Filmes Recomendados
                </h2>
                {movieRecommendations && movieRecommendations.results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {movieRecommendations.results.slice(0, 12).map((movie: any) => (
                      <Card key={movie.id} className="overflow-hidden group">
                        <Link href={`/movie/${movie.id}`}>
                          <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                            <img
                              src={getImageUrl(movie.poster_path, "w342")}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {movie.vote_average > 0 && (
                              <Badge className="absolute top-2 right-2 bg-primary/90">
                                ⭐ {movie.vote_average.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-3">
                          <Link href={`/movie/${movie.id}`}>
                            <h3 className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary">
                              {movie.title}
                            </h3>
                          </Link>
                          {movie.release_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(movie.release_date).getFullYear()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Assista alguns filmes para receber recomendações personalizadas
                  </p>
                )}
              </div>

              {/* TV Recommendations */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  Séries Recomendadas
                </h2>
                {tvRecommendations && tvRecommendations.results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tvRecommendations.results.slice(0, 12).map((show: any) => (
                      <Card key={show.id} className="overflow-hidden group">
                        <Link href={`/tv/${show.id}`}>
                          <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                            <img
                              src={getImageUrl(show.poster_path, "w342")}
                              alt={show.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {show.vote_average > 0 && (
                              <Badge className="absolute top-2 right-2 bg-primary/90">
                                ⭐ {show.vote_average.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-3">
                          <Link href={`/tv/${show.id}`}>
                            <h3 className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary">
                              {show.name}
                            </h3>
                          </Link>
                          {show.first_air_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(show.first_air_date).getFullYear()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Assista algumas séries para receber recomendações personalizadas
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
