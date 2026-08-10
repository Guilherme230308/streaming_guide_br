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
import { useBatchProviders } from "@/contexts/ProviderBatchContext";

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

  // Use batch provider loading instead of individual requests
  const batchProviders = useBatchProviders(id, mediaType, propProviders);

  // Use prop providers if available, then batch, then empty
  const providers = useMemo(() => {
    if (propProviders && propProviders.length > 0) return propProviders;
    return batchProviders || [];
  }, [propProviders, batchProviders]);

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
          <div className="group block relative rounded-xl overflow-hidden bg-card cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/60">
            {/* Poster Image */}
            <div className="aspect-[2/3] relative">
              {posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}

              {/* Rating badge */}
              {voteAverage && voteAverage > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm ${
                    voteAverage >= 7 ? "bg-emerald-500/90 text-white" :
                    voteAverage >= 5 ? "bg-amber-500/90 text-white" :
                    "bg-red-500/90 text-white"
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {voteAverage.toFixed(1)}
                  </div>
                </div>
              )}

              {/* Hover gradient overlay with title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div>
                  <p className="text-white font-semibold text-sm line-clamp-2">{title}</p>
                  {year && <p className="text-white/70 text-xs mt-0.5">{year}</p>}
                </div>
              </div>

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
              {/* Year and streaming provider icons on the same row */}
              <div className="flex items-center justify-between">
                {year ? (
                  <span className="text-sm text-muted-foreground">{year}</span>
                ) : (
                  <span />
                )}
                {dedupedProviders.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {dedupedProviders.slice(0, 4).map((provider) => (
                      <img
                        key={provider.provider_id}
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="h-5 w-5 rounded-[3px] object-cover"
                        loading="lazy"
                      />
                    ))}
                    {dedupedProviders.length > 4 && (
                      <span className="text-[9px] text-muted-foreground font-medium ml-0.5">+{dedupedProviders.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
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
