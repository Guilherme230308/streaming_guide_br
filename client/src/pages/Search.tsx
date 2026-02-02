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

export default function Search() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const initialQuery = new URLSearchParams(searchParams).get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filterBySubscriptions, setFilterBySubscriptions] = useState(false);
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

  const displayResults = filterBySubscriptions && isAuthenticated ? filteredSearchResults : searchResults;
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

          {/* Subscription Filter */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 mt-4">
              <Switch
                id="subscription-filter"
                checked={filterBySubscriptions}
                onCheckedChange={setFilterBySubscriptions}
              />
              <Label htmlFor="subscription-filter" className="text-sm text-muted-foreground cursor-pointer">
                Mostrar apenas conteúdo disponível nas minhas assinaturas
              </Label>
            </div>
          )}
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
