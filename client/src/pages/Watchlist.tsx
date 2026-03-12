import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Bookmark, Trash2, ExternalLink } from "lucide-react";
import { LoginPromptPage } from "@/components/LoginPrompt";
import { WatchlistPreview } from "@/components/BlurredPreviews";
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
      <LoginPromptPage
        title="Minha Lista"
        description="Crie uma conta gratuita para salvar seus filmes e séries favoritos e assistir depois."
        icon={<Bookmark className="h-16 w-16 text-primary/50" />}
        preview={<WatchlistPreview />}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
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
            {watchlist.map((item: any) => (
              <ContentCard
                key={`${item.mediaType}-${item.tmdbId}`}
                id={item.tmdbId}
                title={item.title}
                posterPath={item.posterPath}
                mediaType={item.mediaType}
                releaseDate={item.releaseDate}
                voteAverage={item.voteAverage}
              />
            ))}
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
