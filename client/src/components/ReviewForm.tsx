import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReviewFormProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  contentTitle: string;
  existingReview?: {
    id: number;
    title: string;
    content: string;
  };
  onSuccess?: () => void;
}

export function ReviewForm({
  tmdbId,
  mediaType,
  contentTitle,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação publicada!", {
        description: "Sua avaliação foi compartilhada com a comunidade.",
      });
      setTitle("");
      setContent("");
      setRating(0);
      utils.reviews.getContentReviews.invalidate({ tmdbId, mediaType });
      utils.reviews.getAllRecentReviews.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao publicar avaliação", {
        description: error.message,
      });
    },
  });

  const updateMutation = trpc.reviews.update.useMutation({
    onSuccess: () => {
      toast.success("Avaliação atualizada!", {
        description: "Suas alterações foram salvas.",
      });
      utils.reviews.getContentReviews.invalidate({ tmdbId, mediaType });
      utils.reviews.getUserReview.invalidate({ tmdbId, mediaType });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar avaliação", {
        description: error.message,
      });
    },
  });

  const ratingMutation = trpc.ratings.upsert.useMutation({
    onSuccess: () => {
      utils.ratings.getUserRating.invalidate({ tmdbId, mediaType });
      utils.ratings.getAverage.invalidate({ tmdbId, mediaType });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha o título e o conteúdo da avaliação.",
      });
      return;
    }

    if (content.trim().length < 10) {
      toast.error("Avaliação muito curta", {
        description: "Escreva pelo menos 10 caracteres.",
      });
      return;
    }

    // Submit rating if provided
    if (rating > 0) {
      await ratingMutation.mutateAsync({
        tmdbId,
        mediaType,
        rating,
      });
    }

    // Submit or update review
    if (existingReview) {
      await updateMutation.mutateAsync({
        reviewId: existingReview.id,
        title: title.trim(),
        content: content.trim(),
      });
    } else {
      await createMutation.mutateAsync({
        tmdbId,
        mediaType,
        title: title.trim(),
        content: content.trim(),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Avalie com estrelas
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-2">
          Título da avaliação
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Melhor filme do ano!"
          maxLength={255}
          required
        />
      </div>

      <div>
        <label htmlFor="review-content" className="block text-sm font-medium mb-2">
          Sua avaliação
        </label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`O que você achou de ${contentTitle}? Compartilhe sua opinião com a comunidade...`}
          rows={5}
          required
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Mínimo 10 caracteres ({content.length}/10)
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || content.length < 10}
        className="w-full"
      >
        {isSubmitting ? (
          "Publicando..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {existingReview ? "Atualizar Avaliação" : "Publicar Avaliação"}
          </>
        )}
      </Button>
    </form>
  );
}
