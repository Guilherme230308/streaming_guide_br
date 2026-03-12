import { useState, useMemo } from "react";
import { Link } from "wouter";
import { MoreVertical, Bookmark, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AddToListDialog } from "@/components/AddToListDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SwipeableCard } from "@/components/SwipeableCard";
import { deduplicateProviders } from "@/lib/providerUtils";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface ContentCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  releaseDate?: string;
  voteAverage?: number;
  providers?: Array<{
    provider_id: number;
    provider_name: string;
    logo_path: string;
  }>;
}

export function ContentCard({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
  voteAverage,
  providers: propProviders,
}: ContentCardProps) {
  const [showListDialog, setShowListDialog] = useState(false);
  const utils = trpc.useUtils();
  const { isAuthenticated } = useAuth();

  // Lazy-load providers when not passed as prop
  const { data: fetchedProviders } = trpc.content.getItemProviders.useQuery(
    { tmdbId: id, mediaType },
    { 
      enabled: !propProviders || propProviders.length === 0,
      staleTime: 1000 * 60 * 30, // Cache for 30 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Use prop providers if available, otherwise use fetched providers
  const providers = useMemo(() => {
    if (propProviders && propProviders.length > 0) return propProviders;
    return fetchedProviders || [];
  }, [propProviders, fetchedProviders]);

  // Only query protected endpoints when user is authenticated
  const { data: isWatched } = trpc.viewingHistory.isWatched.useQuery(
    { tmdbId: id, mediaType },
    { enabled: isAuthenticated }
  );

  const markAsWatchedMutation = trpc.viewingHistory.add.useMutation({
    onSuccess: () => {
      toast.success("Marcado como assistido!");
      utils.viewingHistory.isWatched.invalidate();
    },
    onError: () => {
      toast.error("Erro ao marcar como assistido");
    },
  });

  const handleMarkAsWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info("Crie uma conta gratuita para marcar como assistido.", {
        action: {
          label: "Criar conta",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }
    
    markAsWatchedMutation.mutate({
      tmdbId: id,
      mediaType,
      title,
      posterPath: posterPath || null,
    });
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info("Crie uma conta gratuita para adicionar à lista.", {
        action: {
          label: "Criar conta",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }
    
    setShowListDialog(true);
  };

  const detailPath = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: () => {
      toast.success("Adicionado à lista!");
      utils.watchlist.get.invalidate();
    },
    onError: () => {
      toast.error("Erro ao adicionar à lista");
    },
  });

  const handleSwipeRight = () => {
    if (!isAuthenticated) {
      toast.info("Crie uma conta gratuita para adicionar à lista.", {
        action: {
          label: "Criar conta",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }
    
    addToWatchlistMutation.mutate({
      tmdbId: id,
      mediaType,
      title,
      posterPath: posterPath || null,
    });
  };

  const handleSwipeLeft = () => {
    toast.info("Marcado como não interessado");
  };

  const dedupedProviders = useMemo(() => deduplicateProviders(providers), [providers]);

  return (
    <>
      <SwipeableCard onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft}>
        <Link href={detailPath}>
          <div className="group block relative rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all cursor-pointer">
            {/* Poster Image */}
            <div className="aspect-[2/3] relative">
              {posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}

              {/* Streaming Provider Icons - Overlay at bottom of poster */}
              {dedupedProviders.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-2 py-2 pt-6">
                  <div className="flex items-center gap-1">
                    {dedupedProviders.slice(0, 5).map((provider) => (
                      <img
                        key={provider.provider_id}
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="h-6 w-6 rounded-md object-cover border border-white/20 shadow-sm"
                        loading="lazy"
                      />
                    ))}
                    {dedupedProviders.length > 5 && (
                      <span className="text-[10px] text-white/80 font-medium ml-0.5">+{dedupedProviders.length - 5}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Three-dot menu - Always visible on mobile, visible on hover on desktop */}
              <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddToList}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Adicionar à lista
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMarkAsWatched} disabled={!!isWatched}>
                      <Check className="h-4 w-4 mr-2" />
                      {isWatched ? "Assistido" : "Marcar como assistido"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content Info */}
            <div className="p-3">
              <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                {title}
              </h3>
              {year && (
                <p className="text-sm text-muted-foreground">{year}</p>
              )}
            </div>
          </div>
        </Link>
      </SwipeableCard>

      {/* Add to List Dialog */}
      {isAuthenticated && (
        <AddToListDialog
          open={showListDialog}
          onOpenChange={setShowListDialog}
          tmdbId={id}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath || null}
        />
      )}
    </>
  );
}
