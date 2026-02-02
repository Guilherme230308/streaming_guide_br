import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.png";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export default function Genres() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: movieGenres } = trpc.content.getGenres.useQuery({
    mediaType: "movie",
  });

  const { data: tvGenres } = trpc.content.getGenres.useQuery({
    mediaType: "tv",
  });

  const { data: genreContent, isLoading } = trpc.content.discoverByGenre.useQuery(
    {
      mediaType: activeTab,
      genreId: selectedGenre!,
      page: 1,
    },
    {
      enabled: selectedGenre !== null,
    }
  );

  const currentGenres = activeTab === "movie" ? movieGenres?.genres : tvGenres?.genres;
  const currentGenreName = currentGenres?.find((g) => g.id === selectedGenre)?.name;

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
                <Film className="h-6 w-6 text-primary" />
                Navegar por Gênero
              </h1>
              <p className="text-sm text-muted-foreground">
                Descubra conteúdo por categoria
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as "movie" | "tv");
          setSelectedGenre(null);
        }}>
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
            {!selectedGenre ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movieGenres?.genres.map((genre) => (
                  <Card
                    key={genre.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedGenre(genre.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg">{genre.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGenre(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <h2 className="text-2xl font-bold">{currentGenreName}</h2>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : genreContent && genreContent.results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {genreContent.results.map((movie: any) => (
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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum filme encontrado</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tv">
            {!selectedGenre ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tvGenres?.genres.map((genre) => (
                  <Card
                    key={genre.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedGenre(genre.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg">{genre.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGenre(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <h2 className="text-2xl font-bold">{currentGenreName}</h2>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : genreContent && genreContent.results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {genreContent.results.map((show: any) => (
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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma série encontrada</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
