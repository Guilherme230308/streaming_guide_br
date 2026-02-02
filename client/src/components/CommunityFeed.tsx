import { trpc } from "@/lib/trpc";
import { MessageSquare, Star, Calendar } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CommunityFeed() {
  const { data: reviews, isLoading } = trpc.reviews.getAllRecentReviews.useQuery(
    { limit: 10 },
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <section className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-6 h-6 text-cyan-500" />
          <h2 className="text-2xl font-bold">Avaliações da Comunidade</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg p-4">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted-foreground/20 rounded w-full mb-2" />
              <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-6 h-6 text-cyan-500" />
          <h2 className="text-2xl font-bold">Avaliações da Comunidade</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-cyan-500" />
        <h2 className="text-2xl font-bold">Avaliações da Comunidade</h2>
        <span className="text-sm text-muted-foreground ml-auto">
          {reviews.length} avaliações recentes
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => {
          const linkPath =
            review.mediaType === "movie"
              ? `/movie/${review.tmdbId}`
              : `/tv/${review.tmdbId}`;

          return (
            <Link key={review.id} href={linkPath}>
              <div className="group bg-card border border-border rounded-lg p-4 hover:border-cyan-500/50 transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-cyan-500 transition-colors line-clamp-1">
                      {review.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{review.userName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {review.content}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-md">
                    {review.mediaType === "movie" ? "Filme" : "Série"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link href="/community">
          <button className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors font-medium">
            Ver todas as avaliações →
          </button>
        </Link>
      </div>
    </section>
  );
}
