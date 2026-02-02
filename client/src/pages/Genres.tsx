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

// Genre background images mapping (using representative movie posters)
const GENRE_IMAGES: Record<string, string> = {
  // Movies
  "28": "https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg", // Action - Mad Max
  "12": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", // Adventure - Indiana Jones
  "16": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", // Animation - Toy Story
  "35": "https://image.tmdb.org/t/p/w500/iiXliCeykkzmJ0Eg9RYJ7F2CWSz.jpg", // Comedy - The Hangover
  "80": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // Crime - The Godfather
  "99": "https://image.tmdb.org/t/p/w500/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", // Documentary
  "18": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", // Drama - Forrest Gump
  "10751": "https://image.tmdb.org/t/p/w500/qmcwOIMfE5ljkPnKRVX4mYHHDRm.jpg", // Family - The Lion King
  "14": "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg", // Fantasy - Harry Potter
  "36": "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", // History
  "27": "https://image.tmdb.org/t/p/w500/db32LaOibwEliAmSL2jjDF6oDdj.jpg", // Horror - It
  "10402": "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", // Music - La La Land
  "9648": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", // Mystery - Knives Out
  "10749": "https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg", // Romance - The Notebook
  "878": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // Sci-Fi - Interstellar
  "10770": "https://image.tmdb.org/t/p/w500/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg", // TV Movie - High School Musical
  "53": "https://image.tmdb.org/t/p/w500/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg", // Thriller - Inception
  "10752": "https://image.tmdb.org/t/p/w500/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg", // War - Saving Private Ryan
  "37": "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", // Western
  // TV Series (different genre IDs from movies)
  "10759": "https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg", // Action & Adventure - Breaking Bad
  "10762": "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", // Kids - Bluey
  "10763": "https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg", // News - Last Week Tonight
  "10764": "https://image.tmdb.org/t/p/w500/gKG5QGz5Ngf8fgWpBsWtlg5L2SF.jpg", // Reality - The Great British Bake Off
  "10765": "https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg", // Sci-Fi & Fantasy - The Witcher
  "10766": "https://image.tmdb.org/t/p/w500/zLudbPueg8CxGhMS2tyDh3p0TdK.jpg", // Soap - Grey's Anatomy
  "10767": "https://image.tmdb.org/t/p/w500/zzSJsKP8V6Yl6qPxWLSqTu3pv9F.jpg", // Talk - The Tonight Show
  "10768": "https://image.tmdb.org/t/p/w500/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg", // War & Politics - House of Cards
};

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
                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden group"
                    onClick={() => setSelectedGenre(genre.id)}
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={GENRE_IMAGES[genre.id.toString()] || "/placeholder-poster.png"}
                        alt={genre.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 right-4 font-bold text-xl text-white">
                        {genre.name}
                      </h3>
                    </div>
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
                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden group"
                    onClick={() => setSelectedGenre(genre.id)}
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={GENRE_IMAGES[genre.id.toString()] || "/placeholder-poster.png"}
                        alt={genre.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 right-4 font-bold text-xl text-white">
                        {genre.name}
                      </h3>
                    </div>
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
