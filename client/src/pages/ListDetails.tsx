import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Tv, Star, ArrowLeft, Trash2, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

const getImageUrl = (path: string | null, size: string = "w342") => {
  if (!path) return "https://via.placeholder.com/342x513?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default function ListDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const listId = parseInt(id || "0");

  const utils = trpc.useUtils();

  const { data: list, isLoading: listLoading } = trpc.customLists.getListById.useQuery(
    { listId },
    { enabled: listId > 0 }
  );

  const { data: items = [], isLoading: itemsLoading } = trpc.customLists.getListItems.useQuery(
    { listId },
    { enabled: listId > 0 }
  );

  const removeItem = trpc.customLists.removeItem.useMutation({
    onSuccess: () => {
      utils.customLists.getListItems.invalidate({ listId });
      utils.customLists.getUserLists.invalidate();
      toast.success("Item removido da lista!");
    },
  });

  const handleRemoveItem = (tmdbId: number, mediaType: "movie" | "tv") => {
    if (confirm("Remover este item da lista?")) {
      removeItem.mutate({ listId, tmdbId, mediaType });
    }
  };

  if (listLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando lista...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Lista não encontrada</h2>
            <Button onClick={() => setLocation("/lists")}>
              Voltar para Minhas Listas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === list.userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Onde Assistir</span>
            </div>
          </Link>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation(isOwner ? "/lists" : "/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-muted-foreground">{list.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {list.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Pública</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Privada</span>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lista vazia</h3>
              <p className="text-muted-foreground">
                {isOwner
                  ? "Adicione filmes e séries a esta lista clicando em 'Adicionar à lista' nas páginas de detalhes"
                  : "Esta lista ainda não tem nenhum item"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={`${item.mediaType}-${item.tmdbId}`} className="group relative">
                <Link href={`/${item.mediaType}/${item.tmdbId}`}>
                  <div className="cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-2 aspect-[2/3]">
                      <img
                        src={getImageUrl(item.posterPath)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                        {item.mediaType === "movie" ? (
                          <Film className="h-3 w-3 text-white" />
                        ) : (
                          <Tv className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveItem(item.tmdbId, item.mediaType)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
