import { useState } from "react";
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

interface ContentCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  releaseDate?: string;
  voteAverage?: number;
}

export function ContentCard({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
  voteAverage,
}: ContentCardProps) {
  const [showListDialog, setShowListDialog] = useState(false);
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

  return (
    <>
      <SwipeableCard onSwipeRight={handleSwipeRight} onSwipeLeft={handleSwipeLeft}>
        <Link href={detailPath}>
        <a className="group block relative rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all">
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
            {year && (
              <p className="text-sm text-muted-foreground">{year}</p>
            )}
          </div>
        </a>
      </Link>
      </SwipeableCard>

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
