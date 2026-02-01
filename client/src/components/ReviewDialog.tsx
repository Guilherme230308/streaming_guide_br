import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReviewDialogProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  existingReview?: {
    id: number;
    title: string;
    content: string;
  } | null;
  onSuccess?: () => void;
}

export function ReviewDialog({ tmdbId, mediaType, existingReview, onSuccess }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");

  const utils = trpc.useUtils();

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review publicado com sucesso!");
      utils.reviews.getContentReviews.invalidate({ tmdbId, mediaType });
      utils.reviews.getUserReview.invalidate({ tmdbId, mediaType });
      setOpen(false);
      setTitle("");
      setContent("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao publicar review: " + error.message);
    },
  });

  const updateMutation = trpc.reviews.update.useMutation({
    onSuccess: () => {
      toast.success("Review atualizado com sucesso!");
      utils.reviews.getContentReviews.invalidate({ tmdbId, mediaType });
      utils.reviews.getUserReview.invalidate({ tmdbId, mediaType });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar review: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim().length === 0) {
      toast.error("Por favor, adicione um título");
      return;
    }
    
    if (content.trim().length < 10) {
      toast.error("O review deve ter pelo menos 10 caracteres");
      return;
    }

    if (existingReview) {
      updateMutation.mutate({
        reviewId: existingReview.id,
        title: title.trim(),
        content: content.trim(),
      });
    } else {
      createMutation.mutate({
        tmdbId,
        mediaType,
        title: title.trim(),
        content: content.trim(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          {existingReview ? "Editar Review" : "Escrever Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Editar Review" : "Escrever Review"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Filme incrível!"
              maxLength={255}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Seu Review</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conte o que você achou... (mínimo 10 caracteres)"
              rows={6}
              required
              minLength={10}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {content.length} caracteres
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : existingReview
                ? "Atualizar"
                : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
