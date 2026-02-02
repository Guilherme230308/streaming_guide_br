import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Film, Tv, Bookmark, Bell, Calendar, Grid3x3, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search suggestions query with debouncing
  const { data: suggestions } = trpc.content.search.useQuery(
    { query: searchQuery, page: 1 },
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

  const { data: trendingMovies } = trpc.content.getTrending.useQuery({
    mediaType: "movie",
    timeWindow: "week",
  });

  const { data: trendingTV } = trpc.content.getTrending.useQuery({
    mediaType: "tv",
    timeWindow: "week",
  });

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

            <nav className="flex items-center gap-2 md:gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/watchlist">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">Minha Lista</span>
                    </Button>
                  </Link>
                  <Link href="/subscriptions">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="hidden sm:inline">Assinaturas</span>
                    </Button>
                  </Link>
                  <Link href="/upcoming">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">Em Breve</span>
                    </Button>
                  </Link>
                  <Link href="/genres">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Grid3x3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Gêneros</span>
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Histórico</span>
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground hidden md:inline">Olá, {user?.name}</span>
                </>
              ) : (
                <Button asChild variant="default">
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold text-foreground">
              Descubra onde assistir seus filmes e séries favoritos
            </h1>
            <p className="text-xl text-muted-foreground">
              Encontre em qual streaming está disponível no Brasil
            </p>

            <div ref={searchRef} className="relative max-w-2xl mx-auto">
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

              {/* Autocomplete Suggestions */}
              {showSuggestions && searchQuery.length >= 2 && suggestions?.results && suggestions.results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.results.slice(0, 8).map((item: any) => (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setLocation(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                    >
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title || item.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.title || item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.media_type === 'movie' ? 'Filme' : 'Série'}
                          {item.release_date || item.first_air_date ? ` • ${(item.release_date || item.first_air_date).split('-')[0]}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Movies */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Film className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Filmes em Alta</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingMovies?.results.slice(0, 12).map((movie: any) => (
              <Link key={movie.id} href={`/movie/${movie.id}`}>
                <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {movie.release_date?.split("-")[0]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending TV Shows */}
      <section className="py-12 bg-card/30">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <Tv className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Séries em Alta</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingTV?.results.slice(0, 12).map((show: any) => (
              <Link key={show.id} href={`/tv/${show.id}`}>
                <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={getImageUrl(show.poster_path)}
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {show.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {show.first_air_date?.split("-")[0]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              © 2026 Onde Assistir. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
