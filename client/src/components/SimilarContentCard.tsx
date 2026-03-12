import { useMemo } from "react";
import { Link } from "wouter";
import { deduplicateProviders } from "@/lib/providerUtils";
import { useBatchProviders } from "@/contexts/ProviderBatchContext";

interface SimilarContentCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  releaseDate?: string;
}

/**
 * Card for similar movies/series with batch-loaded streaming provider icons.
 * Icons are displayed below the card next to the year, matching the search result card design.
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

  // Use batch provider loading instead of individual requests
  const batchProviders = useBatchProviders(id, mediaType);

  const providers = useMemo(
    () => deduplicateProviders(batchProviders || []),
    [batchProviders]
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
        </div>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {/* Year and streaming provider icons on the same row */}
        <div className="flex items-center justify-between mt-1">
          {year ? (
            <span className="text-xs text-muted-foreground">{year}</span>
          ) : (
            <span />
          )}
          {providers.length > 0 && (
            <div className="flex items-center gap-0.5">
              {providers.slice(0, 4).map((provider) => (
                <img
                  key={provider.provider_id}
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  title={provider.provider_name}
                  className="h-5 w-5 rounded-[3px] object-cover"
                  loading="lazy"
                />
              ))}
              {providers.length > 4 && (
                <span className="text-[9px] text-muted-foreground font-medium ml-0.5">
                  +{providers.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
