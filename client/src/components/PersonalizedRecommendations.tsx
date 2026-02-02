import { trpc } from "@/lib/trpc";
import { Sparkles, TrendingUp } from "lucide-react";
import { Link } from "wouter";

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

export function PersonalizedRecommendations() {
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
        {data.results.map((item: any) => {
          const isMovie = item.media_type === "movie";
          const title = isMovie ? item.title : item.name;
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "/placeholder-poster.png";
          const linkPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

          return (
            <Link key={`${item.media_type}-${item.id}`} href={linkPath}>
              <div className="group cursor-pointer">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                  <img
                    src={posterPath}
                    alt={title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.vote_average && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold">
                      ⭐ {item.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-cyan-500 transition-colors">
                  {title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
