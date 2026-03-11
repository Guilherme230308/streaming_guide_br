import { trpc } from "@/lib/trpc";
import { MessageSquare, Star, Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const REVIEWS_PER_PAGE = 10;

interface ReviewData {
  id: number;
  userId: number;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string;
  posterPath?: string;
  contentTitle?: string | null;
}

export function CommunityFeed() {
  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<ReviewData[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: reviews, isLoading, isFetching } = trpc.reviews.getAllRecentReviews.useQuery(
    { limit: REVIEWS_PER_PAGE, offset: (page - 1) * REVIEWS_PER_PAGE },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Handle pagination data accumulation
  useEffect(() => {
    if (reviews) {
      if (page === 1) {
        setAllReviews(reviews);
      } else {
        setAllReviews(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(r => r.id));
          const newReviews = reviews.filter(r => !existingIds.has(r.id));
          return [...prev, ...newReviews];
        });
      }
      setHasMore(reviews.length === REVIEWS_PER_PAGE);
    }
  }, [reviews, page]);

  const displayReviews = allReviews.length > 0 ? allReviews : reviews;

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

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
        {(displayReviews || []).map((review) => {
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
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded-md font-bold border border-cyan-500/20">
                    {review.contentTitle || (review.mediaType === "movie" ? "Filme" : "Série")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        {hasMore && (displayReviews?.length || 0) >= REVIEWS_PER_PAGE && (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isFetching}
            className="gap-2"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar mais avaliações"
            )}
          </Button>
        )}
        <Link href="/community">
          <button className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors font-medium">
            Ver todas as avaliações →
          </button>
        </Link>
      </div>
    </section>
  );
}
