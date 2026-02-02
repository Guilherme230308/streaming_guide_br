import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Bookmark, Trash2, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Watchlist() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: watchlist, isLoading } = trpc.watchlist.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();
  
  const removeFromWatchlist = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      utils.watchlist.get.invalidate();
      toast.success("Removido da sua lista");
    },
  });

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-poster.jpg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleRemove = (tmdbId: number, mediaType: 'movie' | 'tv') => {
    removeFromWatchlist.mutate({ tmdbId, mediaType });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
          <div className="container py-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Film className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="container py-20 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Faça login para ver sua lista</h1>
          <p className="text-muted-foreground mb-6">
            Salve seus filmes e séries favoritos para assistir depois
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

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

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink min-w-0">
              <Link href="/watchlist">
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                  <Bookmark className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Minha Lista</span>
                </Button>
              </Link>
              <Link href="/subscriptions">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <span className="text-sm">Assinaturas</span>
                </Button>
              </Link>
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[150px]">
                Olá, {user?.name || "Usuário"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minha Lista</h1>
          <p className="text-muted-foreground">
            Seus filmes e séries salvos para assistir depois
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Film className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando sua lista...</p>
          </div>
        ) : watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item: any) => {
              const isMovie = item.mediaType === "movie";
              const linkPath = isMovie ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`;

              return (
                <Card key={`${item.mediaType}-${item.tmdbId}`} className="overflow-hidden group h-full">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={linkPath}>
                        <div className="aspect-[2/3] relative overflow-hidden cursor-pointer">
                          <img
                            src={getImageUrl(item.posterPath)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 gap-1"
                          >
                            {isMovie ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                            {isMovie ? "Filme" : "Série"}
                          </Badge>
                        </div>
                      </Link>
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(item.tmdbId, item.mediaType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {item.title}
                      </h3>
                      {item.releaseDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.releaseDate.split("-")[0]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sua lista está vazia
            </h2>
            <p className="text-muted-foreground mb-6">
              Comece a adicionar filmes e séries que você quer assistir
            </p>
            <Button onClick={() => setLocation("/")}>
              Explorar Conteúdo
            </Button>
          </div>
        )}
      </div>

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
    </div>
  );
}
