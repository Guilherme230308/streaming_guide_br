import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, Film, Tv, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { ContentCard } from "@/components/ContentCard";
import { useState, FormEvent } from "react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trending movies to suggest to lost users
  const { data: trending } = trpc.content.getTrending.useQuery(
    { mediaType: "movie", timeWindow: "week" },
    { staleTime: 1000 * 60 * 30 }
  );

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularMovies = trending?.results?.slice(0, 6) || [];

  return (
    <div className="min-h-screen w-full bg-background pt-16">
      <SEO
        title="Página não encontrada"
        description="A página que você está procurando não existe ou foi removida."
        noindex={true}
      />

      {/* Hero section with gradient background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative flex flex-col items-center justify-center px-4 py-20">
          {/* Large 404 with film reel icon */}
          <div className="flex items-center gap-4 mb-6">
            <Film className="h-12 w-12 text-primary/60" />
            <h1 className="text-7xl sm:text-8xl font-black text-foreground tracking-tight">404</h1>
            <Tv className="h-12 w-12 text-primary/60" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Cena não encontrada
          </h2>
          <p className="text-muted-foreground mb-10 text-center max-w-lg text-base leading-relaxed">
            Parece que esta página saiu de cartaz. Mas não se preocupe — use a busca abaixo para encontrar
            o filme ou série que você procura.
          </p>

          {/* Prominent Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-xl mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar filmes e séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-28 h-14 text-lg bg-card border-border rounded-xl shadow-lg shadow-primary/5"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleGoBack} variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button onClick={handleGoHome} variant="default" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </div>
        </div>
      </div>

      {/* Popular movies suggestions */}
      {popularMovies.length > 0 && (
        <div className="container pb-16 pt-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Filmes em Alta
            </h3>
            <p className="text-sm text-muted-foreground">
              Enquanto isso, veja o que está bombando esta semana
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {popularMovies.map((movie: any) => (
              <ContentCard
                key={movie.id}
                id={movie.id}
                title={movie.title || movie.name}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                releaseDate={movie.release_date || movie.first_air_date}
                mediaType="movie"
              />
            ))}
          </div>

          {/* Quick navigation links */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Navegue por categoria:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/genres")} className="text-muted-foreground hover:text-foreground">
                Gêneros
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/melhores")} className="text-muted-foreground hover:text-foreground">
                Plataformas
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/streaming-prices")} className="text-muted-foreground hover:text-foreground">
                Preços
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/novidades")} className="text-muted-foreground hover:text-foreground">
                Novidades
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/upcoming")} className="text-muted-foreground hover:text-foreground">
                Em Breve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
