import { useState } from "react";
import { Link } from "wouter";
import { MoreVertical, Bookmark, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddToListDialog } from "@/components/AddToListDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SwipeableCard } from "@/components/SwipeableCard";
import { deduplicateProviders } from "@/lib/providerUtils";
import { handleProviderClick as handleDeepLink } from "@/lib/deepLinks";

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
  providers = [],
}: ContentCardProps) {
  const [showListDialog, setShowListDialog] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const utils = trpc.useUtils();

  const { data: isWatched } = trpc.viewingHistory.isWatched.useQuery({
    tmdbId: id,
    mediaType,
  });

  const markAsWatchedMutation = trpc.viewingHistory.add.useMutation({
    onSuccess: () => {
      toast.success("Marcado como assistido!");
      utils.viewingHistory.isWatched.invalidate();
    },
    onError: () => {
      toast.error("Erro ao marcar como assistido");
    },
  });

  const trackClick = trpc.affiliate.trackClick.useMutation();

  const handleMarkAsWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    setShowListDialog(true);
  };

  const handleProviderClick = async (
    e: React.MouseEvent,
    provider: { provider_id: number; provider_name: string }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track affiliate click
    trackClick.mutate({
      tmdbId: id,
      mediaType,
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      clickType: 'stream',
    });
    
    // Handle deep linking
    await handleDeepLink(provider.provider_id, provider.provider_name, mediaType, id);
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
    addToWatchlistMutation.mutate({
      tmdbId: id,
      mediaType,
      title,
      posterPath: posterPath || null,
    });
  };

  const handleSwipeLeft = () => {
    toast.info("Marcado como não interessado");
    // Could implement a "not interested" feature here
  };

  const handleCardClick = () => {
    setShowActionSheet(true);
  };

  return (
    <>
      <SwipeableCard onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft}>
        <div 
          onClick={handleCardClick}
          className="group block relative rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all cursor-pointer"
        >
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
                  <DropdownMenuItem onClick={handleMarkAsWatched} disabled={isWatched}>
                    <Check className="h-4 w-4 mr-2" />
                    {isWatched ? "Assistido" : "Marcar como assistido"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Rating badge */}
            {voteAverage && voteAverage > 0 && (
              <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-semibold text-foreground">
                    {voteAverage.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Info */}
          <div className="p-3">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="flex items-center justify-between gap-2">
              {year && (
                <p className="text-sm text-muted-foreground">{year}</p>
              )}
              
              {/* Streaming Provider Icons - Now Clickable */}
              {providers && providers.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {deduplicateProviders(providers).slice(0, 4).map((provider) => (
                    <button
                      key={provider.provider_id}
                      onClick={(e) => handleProviderClick(e, provider)}
                      className="hover:scale-110 transition-transform hover:ring-2 hover:ring-primary rounded-md"
                      title={`Assistir em ${provider.provider_name}`}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="h-6 w-6 rounded-md object-cover border border-border/50"
                        loading="lazy"
                      />
                    </button>
                  ))}
                  {deduplicateProviders(providers).length > 4 && (
                    <span className="text-xs text-muted-foreground font-medium">+{deduplicateProviders(providers).length - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SwipeableCard>

      {/* Quick Action Sheet */}
      <Dialog open={showActionSheet} onOpenChange={setShowActionSheet}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowActionSheet(false);
                window.location.href = detailPath;
              }}
            >
              <span className="mr-2">📖</span>
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={(e) => {
                handleAddToList(e);
                setShowActionSheet(false);
              }}
            >
              <span className="mr-2">📋</span>
              Adicionar à Lista
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={(e) => {
                handleMarkAsWatched(e);
                setShowActionSheet(false);
              }}
              disabled={isWatched}
            >
              <span className="mr-2">{isWatched ? '✅' : '✓'}</span>
              {isWatched ? 'Já Assistido' : 'Marcar como Assistido'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to List Dialog */}
      <AddToListDialog
        open={showListDialog}
        onOpenChange={setShowListDialog}
        tmdbId={id}
        mediaType={mediaType}
        title={title}
        posterPath={posterPath || null}
      />
    </>
  );
}
