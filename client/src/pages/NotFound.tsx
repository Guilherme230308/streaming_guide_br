import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Home, Search } from "lucide-react";
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

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          A página que você está procurando não existe ou foi removida.
          Tente buscar o que procura abaixo.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Buscar filmes e séries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button onClick={handleGoHome} variant="outline">
          <Home className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>

      {/* Popular movies suggestions */}
      {popularMovies.length > 0 && (
        <div className="container pb-16">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Enquanto isso, veja o que está em alta:
          </h3>
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
        </div>
      )}
    </div>
  );
}
