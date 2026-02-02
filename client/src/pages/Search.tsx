import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Film, Tv, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal } from "lucide-react";
import { ALL_GENRES } from "@/lib/genres";

export default function Search() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const initialQuery = new URLSearchParams(searchParams).get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filterBySubscriptions, setFilterBySubscriptions] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const { isAuthenticated } = useAuth();

  // Get user subscriptions
  const { data: subscriptions } = trpc.subscriptions.get.useQuery(
    undefined,
    { enabled: isAuthenticated && filterBySubscriptions }
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = trpc.content.search.useQuery(
    { query: debouncedQuery, page: 1 },
    { enabled: debouncedQuery.length > 0 && (!filterBySubscriptions || !isAuthenticated) }
  );

  const { data: filteredSearchResults, isLoading: isLoadingFiltered } = trpc.content.searchFiltered.useQuery(
    { query: debouncedQuery, page: 1 },
    { enabled: debouncedQuery.length > 0 && filterBySubscriptions && isAuthenticated }
  );

  // Apply client-side filters
  const applyFilters = (results: any) => {
    if (!results?.results) return results;

    const filtered = results.results.filter((item: any) => {
      // Year filter
      const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                   item.first_air_date ? new Date(item.first_air_date).getFullYear() : null;
      if (year && (year < yearRange[0] || year > yearRange[1])) return false;

      // Rating filter
      if (minRating > 0 && item.vote_average < minRating) return false;

      // Genre filter
      if (selectedGenres.length > 0) {
        const itemGenres = item.genre_ids || [];
        if (!selectedGenres.some(genreId => itemGenres.includes(genreId))) return false;
      }

      return true;
    });

    return { ...results, results: filtered };
  };

  const rawResults = filterBySubscriptions && isAuthenticated ? filteredSearchResults : searchResults;
  const displayResults = applyFilters(rawResults);
  const displayLoading = filterBySubscriptions && isAuthenticated ? isLoadingFiltered : isLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getMediaTypeLabel = (mediaType: string) => {
    return mediaType === "movie" ? "Filme" : "Série";
  };

  const getMediaTypeIcon = (mediaType: string) => {
    return mediaType === "movie" ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Film className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar filmes ou séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </form>

            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {/* Subscription Filter */}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Switch
                  id="subscription-filter"
                  checked={filterBySubscriptions}
                  onCheckedChange={setFilterBySubscriptions}
                />
                <Label htmlFor="subscription-filter" className="text-sm text-muted-foreground cursor-pointer">
                  Apenas minhas assinaturas
                </Label>
              </div>
            )}

            {/* Advanced Filters Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros Avançados
                  {(minRating > 0 || selectedGenres.length > 0 || yearRange[0] > 1900 || yearRange[1] < new Date().getFullYear()) && (
                    <Badge variant="secondary" className="ml-1">
                      {[minRating > 0 ? 1 : 0, selectedGenres.length > 0 ? 1 : 0, (yearRange[0] > 1900 || yearRange[1] < new Date().getFullYear()) ? 1 : 0].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Ano de Lançamento</h4>
                    <div className="space-y-2">
                      <Slider
                        min={1900}
                        max={new Date().getFullYear()}
                        step={1}
                        value={yearRange}
                        onValueChange={(value) => setYearRange(value as [number, number])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{yearRange[0]}</span>
                        <span>{yearRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Nota Mínima (TMDB)</h4>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={10}
                        step={0.5}
                        value={[minRating]}
                        onValueChange={(value) => setMinRating(value[0])}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {minRating === 0 ? "Todas" : `${minRating.toFixed(1)}+ ⭐`}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Gêneros</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {ALL_GENRES.map((genre) => (
                        <div key={genre.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genre-${genre.id}`}
                            checked={selectedGenres.includes(genre.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenres([...selectedGenres, genre.id]);
                              } else {
                                setSelectedGenres(selectedGenres.filter(id => id !== genre.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`genre-${genre.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setYearRange([1900, new Date().getFullYear()]);
                      setMinRating(0);
                      setSelectedGenres([]);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="container py-8">
        {debouncedQuery.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              Digite algo para buscar filmes e séries
            </p>
          </div>
        ) : displayLoading ? (
          <div className="text-center py-20">
            <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando...</p>
          </div>
        ) : displayResults && displayResults.results.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Resultados para "{debouncedQuery}"
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayResults.results
                .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
                .map((item: any) => {
                  const isMovie = item.media_type === "movie";
                  const title = isMovie ? item.title : item.name;
                  const releaseDate = isMovie ? item.release_date : item.first_air_date;

                  return (
                    <ContentCard
                      key={`${item.media_type}-${item.id}`}
                      id={item.id}
                      title={title}
                      posterPath={item.poster_path}
                      mediaType={item.media_type}
                      releaseDate={releaseDate}
                      voteAverage={item.vote_average}
                    />
                  );
                })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Nenhum resultado encontrado para "{debouncedQuery}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente buscar por outro título
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
