import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Search, Film, Tv, Bookmark, Bell, Calendar, Grid3x3, Clock, Check, List, DollarSign } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import LandingPage from "./LandingPage";
import { useOnboardingTour } from "@/components/OnboardingTour";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PWAWelcome } from "@/components/PWAWelcome";
import { SearchFilters, type SearchFiltersType } from "@/components/SearchFilters";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { CommunityFeed } from "@/components/CommunityFeed";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    genres: [],
    yearMin: undefined,
    yearMax: undefined,
    ratingMin: undefined,
    providers: [],
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize onboarding tour for new users
  useOnboardingTour();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Get user subscriptions
  const { data: subscriptions } = trpc.subscriptions.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Check if any filters are active
  const hasActiveFilters = searchFilters.genres.length > 0 ||
    searchFilters.providers.length > 0 ||
    searchFilters.yearMin !== undefined ||
    searchFilters.yearMax !== undefined ||
    searchFilters.ratingMin !== undefined;

  // Search suggestions query (with filters if active)
  const { data: suggestions } = trpc.content.searchWithFilters.useQuery(
    {
      query: searchQuery,
      page: 1,
      genres: searchFilters.genres.length > 0 ? searchFilters.genres : undefined,
      yearMin: searchFilters.yearMin,
      yearMax: searchFilters.yearMax,
      ratingMin: searchFilters.ratingMin,
      providers: searchFilters.providers.length > 0 ? searchFilters.providers : undefined,
    },
    { enabled: searchQuery.length >= 2 }
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const { data: trendingMovies } = trpc.content.getTrending.useQuery({
    mediaType: "movie",
    timeWindow: "week",
  });

  const { data: trendingTV } = trpc.content.getTrending.useQuery({
    mediaType: "tv",
    timeWindow: "week",
  });

  // Show landing page for non-authenticated users (after all hooks)
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const handleSearch = (e?: React.FormEvent, query?: string) => {
    e?.preventDefault();
    const searchTerm = query || searchQuery.trim();
    if (searchTerm) {
      saveRecentSearch(searchTerm);
      setShowSuggestions(false);
      
      // Build URL with filters
      const params = new URLSearchParams({ q: searchTerm });
      if (searchFilters.genres.length > 0) {
        params.set('genres', searchFilters.genres.join(','));
      }
      if (searchFilters.yearMin) {
        params.set('yearMin', searchFilters.yearMin.toString());
      }
      if (searchFilters.yearMax) {
        params.set('yearMax', searchFilters.yearMax.toString());
      }
      if (searchFilters.ratingMin !== undefined && searchFilters.ratingMin > 0) {
        params.set('ratingMin', searchFilters.ratingMin.toString());
      }
      if (searchFilters.providers.length > 0) {
        params.set('providers', searchFilters.providers.join(','));
      }
      
      setLocation(`/search?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const items = searchQuery.length >= 2 && suggestions?.results 
      ? suggestions.results.slice(0, 8)
      : [];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const item = items[selectedIndex] as any;
        setShowSuggestions(false);
        setLocation(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.id}`);
      } else {
        handleSearch(e);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  // Check if content is available on user's subscriptions
  const checkAvailability = async (tmdbId: number, mediaType: string) => {
    // This would need to be implemented with a tRPC endpoint that checks providers
    // For now, return empty array
    return [];
  };

  const showRecentSearches = showSuggestions && searchQuery.length === 0 && recentSearches.length > 0;
  const showAutocomplete = showSuggestions && searchQuery.length >= 2 && suggestions?.results && suggestions.results.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <Film className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <span className="text-lg sm:text-2xl font-bold text-foreground whitespace-nowrap">Onde Assistir</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink min-w-0">
              {isAuthenticated ? (
                <>
                  <Link href="/watchlist">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                      <Bookmark className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline text-sm">Minha Lista</span>
                    </Button>
                  </Link>
                  <Link href="/lists">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" data-tour="lists">
                      <List className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline text-sm">Listas</span>
                    </Button>
                  </Link>
                  <Link href="/subscriptions">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" data-tour="subscriptions">
                      <Bell className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline text-sm">Assinaturas</span>
                    </Button>
                  </Link>
                  <Link href="/upcoming">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline text-sm">Em Breve</span>
                    </Button>
                  </Link>
                  <Link href="/alerts">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" data-tour="alerts">
                      <Bell className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline text-sm">Alertas</span>
                    </Button>
                  </Link>
                  <Link href="/genres">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" data-tour="genres">
                      <Grid3x3 className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline text-sm">Gêneros</span>
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3" data-tour="history">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline text-sm">Histórico</span>
                    </Button>
                  </Link>
                  <Link href="/streaming-prices">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline text-sm">Preços</span>
                    </Button>
                  </Link>
                  <PWAInstallPrompt />
                  <span className="text-xs sm:text-sm text-muted-foreground hidden xl:inline truncate max-w-[150px]">
                    Olá, {user?.name}
                  </span>
                </>
              ) : (
                <>
                  <PWAInstallPrompt />
                  <Button asChild variant="default" size="sm">
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Descubra onde assistir seus filmes e séries favoritos
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Encontre em qual streaming está disponível no Brasil
            </p>

            <div ref={searchRef} className="relative max-w-2xl mx-auto" data-tour="search">
              <div className="flex gap-2 mb-3 justify-center">
                <SearchFilters
                  filters={searchFilters}
                  onFiltersChange={setSearchFilters}
                />
              </div>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar filmes ou séries..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 h-14 text-lg bg-card border-border"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  size="sm"
                >
                  Buscar
                </Button>
              </form>

              {/* Recent Searches */}
              {showRecentSearches && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-muted-foreground">Buscas Recentes</p>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(undefined, search);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {showAutocomplete && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.results.slice(0, 8).map((item: any, index: number) => (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setLocation(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.id}`);
                      }}
                      className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${
                        index === selectedIndex ? 'bg-accent' : 'hover:bg-accent'
                      }`}
                    >
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title || item.name}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.title || item.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-muted-foreground">
                            {item.media_type === 'movie' ? 'Filme' : 'Série'}
                            {item.release_date || item.first_air_date ? ` • ${(item.release_date || item.first_air_date).split('-')[0]}` : ''}
                          </p>
                          {/* Availability indicator - placeholder for now */}
                          {subscriptions && subscriptions.length > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Check className="h-3 w-3" />
                              Disponível
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations (only for logged-in users) */}
      {user && <PersonalizedRecommendations />}

      {/* Community Feed */}
      <CommunityFeed />

      {/* Trending Movies */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex items-center gap-2 mb-6">
            <Film className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Filmes em Alta</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingMovies?.results.slice(0, 12).map((movie: any) => (
              <ContentCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                mediaType="movie"
                releaseDate={movie.release_date}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending TV Shows */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex items-center gap-2 mb-6">
            <Tv className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Séries em Alta</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingTV?.results.slice(0, 12).map((show: any) => (
              <ContentCard
                key={show.id}
                id={show.id}
                title={show.name}
                posterPath={show.poster_path}
                mediaType="tv"
                releaseDate={show.first_air_date}
                voteAverage={show.vote_average}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>Dados de disponibilidade fornecidos por <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">JustWatch</a></p>
          <p className="mt-2">© 2026 Onde Assistir. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* PWA Installation Flow */}
      <PWAInstallBanner />
      <PWAWelcome />
    </div>
  );
}
