import { trpc } from "@/lib/trpc";
import { Sparkles, TrendingUp } from "lucide-react";
import { type SearchFiltersType } from "@/components/SearchFilters";
import { ContentCard } from "@/components/ContentCard";

const GENRE_NAMES: Record<number, string> = {
  28: "Ação",
  12: "Aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  99: "Documentário",
  18: "Drama",
  10751: "Família",
  14: "Fantasia",
  36: "História",
  27: "Terror",
  10402: "Música",
  9648: "Mistério",
  10749: "Romance",
  878: "Ficção Científica",
  10770: "Cinema TV",
  53: "Thriller",
  10752: "Guerra",
  37: "Faroeste",
  10759: "Ação & Aventura",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

interface PersonalizedRecommendationsProps {
  filters?: SearchFiltersType;
}

export function PersonalizedRecommendations({ filters }: PersonalizedRecommendationsProps) {
  const { data, isLoading } = trpc.content.getPersonalizedRecommendations.useQuery(
    { limit: 12 },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <section className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-cyan-500" />
          <h2 className="text-2xl font-bold">Recomendado para Você</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-[2/3] rounded-lg" />
              <div className="h-4 bg-muted rounded mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.results.length === 0) {
    return null;
  }

  const genreText =
    data.topGenres && data.topGenres.length > 0
      ? data.topGenres.map((id) => GENRE_NAMES[id] || "").filter(Boolean).join(", ")
      : "";

  // Apply filters to results
  const filteredResults = data.results.filter((item: any) => {
    // Apply filters if provided
    if (!filters) return true;

    // Apply genre filter
    if (filters.genres.length > 0) {
      const hasMatchingGenre = item.genre_ids?.some((genreId: number) =>
        filters.genres.includes(String(genreId))
      );
      if (!hasMatchingGenre) return false;
    }

    // Apply year filter
    if (filters.yearMin || filters.yearMax) {
      const dateField = item.media_type === 'movie' ? item.release_date : item.first_air_date;
      const year = dateField ? new Date(dateField).getFullYear() : 0;
      if (filters.yearMin && year < filters.yearMin) return false;
      if (filters.yearMax && year > filters.yearMax) return false;
    }

    // Apply rating filter
    if (filters.ratingMin !== undefined && filters.ratingMin > 0) {
      if (item.vote_average < filters.ratingMin) return false;
    }

    // Apply provider filter
    if (filters.providers.length > 0) {
      const hasMatchingProvider = item.providers?.some((provider: any) =>
        filters.providers.includes(String(provider.provider_id))
      );
      if (!hasMatchingProvider) return false;
    }

    // Apply streaming filter if enabled
    if (filters.streamingOnly) {
      return item.providers && item.providers.length > 0;
    }

    return true;
  });

  // Don't render if all items are filtered out
  if (filteredResults.length === 0) {
    return null;
  }

  return (
    <section className="container py-8">
      <div className="flex items-center gap-2 mb-2">
        {data.reason === "trending" ? (
          <TrendingUp className="w-6 h-6 text-cyan-500" />
        ) : (
          <Sparkles className="w-6 h-6 text-cyan-500" />
        )}
        <h2 className="text-2xl font-bold">
          {data.reason === "trending" ? "Em Alta" : "Recomendado para Você"}
        </h2>
      </div>
      {data.reason === "personalized" && genreText && (
        <p className="text-sm text-muted-foreground mb-6">
          Baseado no seu interesse em {genreText}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredResults.map((item: any) => {
          const isMovie = item.media_type === "movie";
          const title = isMovie ? item.title : item.name;
          const dateField = isMovie ? item.release_date : item.first_air_date;

          return (
            <ContentCard
              key={`${item.media_type}-${item.id}`}
              id={item.id}
              title={title}
              posterPath={item.poster_path}
              mediaType={isMovie ? "movie" : "tv"}
              releaseDate={dateField}
              voteAverage={item.vote_average}
              providers={item.providers}
            />
          );
        })}
      </div>
    </section>
  );
}
