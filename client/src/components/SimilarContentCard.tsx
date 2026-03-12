import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { deduplicateProviders } from "@/lib/providerUtils";

interface SimilarContentCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  releaseDate?: string;
}

/**
 * Card for similar movies/series with lazy-loaded streaming provider icons.
 * Matches the design of ContentCard provider overlay.
 */
export function SimilarContentCard({
  id,
  title,
  posterPath,
  mediaType,
  releaseDate,
}: SimilarContentCardProps) {
  const detailPath = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const getImageUrl = (path: string | null, size: string = "w342") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  // Lazy-load providers for this item
  const { data: fetchedProviders } = trpc.content.getItemProviders.useQuery(
    { tmdbId: id, mediaType },
    {
      staleTime: 1000 * 60 * 30, // Cache for 30 minutes
      refetchOnWindowFocus: false,
    }
  );

  const providers = useMemo(
    () => deduplicateProviders(fetchedProviders || []),
    [fetchedProviders]
  );

  const posterUrl = getImageUrl(posterPath);

  return (
    <Link href={detailPath}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg mb-2 aspect-[2/3]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}

          {/* Streaming Provider Icons - Overlay at bottom of poster */}
          {providers.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-2 py-2 pt-6">
              <div className="flex items-center gap-1">
                {providers.slice(0, 4).map((provider) => (
                  <img
                    key={provider.provider_id}
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                    className="h-5 w-5 rounded-[4px] object-cover border border-white/20 shadow-sm"
                    loading="lazy"
                  />
                ))}
                {providers.length > 4 && (
                  <span className="text-[9px] text-white/80 font-medium ml-0.5">
                    +{providers.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}
