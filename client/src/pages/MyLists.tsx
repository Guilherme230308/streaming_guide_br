import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Film, Tv, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default function MyLists() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const utils = trpc.useUtils();

  const { data: lists = [], isLoading } = trpc.customLists.getUserLists.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createList = trpc.customLists.create.useMutation({
    onSuccess: () => {
      utils.customLists.getUserLists.invalidate();
      setNewListName("");
      setNewListDescription("");
      setIsPublic(false);
      setShowCreateDialog(false);
      toast.success("Lista criada com sucesso!");
    },
  });

  const updateList = trpc.customLists.update.useMutation({
    onSuccess: () => {
      utils.customLists.getUserLists.invalidate();
      setShowEditDialog(false);
      setSelectedList(null);
      toast.success("Lista atualizada!");
    },
  });

  const deleteList = trpc.customLists.delete.useMutation({
    onSuccess: () => {
      utils.customLists.getUserLists.invalidate();
      toast.success("Lista excluída!");
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error("Digite um nome para a lista");
      return;
    }

    createList.mutate({
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
      isPublic,
    });
  };

  const handleUpdateList = () => {
    if (!selectedList) return;

    updateList.mutate({
      listId: selectedList.id,
      name: selectedList.name,
      description: selectedList.description,
      isPublic: selectedList.isPublic,
    });
  };

  const handleDeleteList = (listId: number) => {
    if (confirm("Tem certeza que deseja excluir esta lista? Todos os itens serão removidos.")) {
      deleteList.mutate({ listId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
            <p className="text-muted-foreground mb-6">
              Faça login para gerenciar suas listas personalizadas
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando suas listas...</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minhas Listas</h1>
            <p className="text-muted-foreground mt-2">
              Organize seus filmes e séries em listas personalizadas
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Lista
          </Button>
        </div>

        {lists.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma lista ainda</h3>
              <p className="text-muted-foreground mb-6">
                Crie sua primeira lista para começar a organizar seus conteúdos favoritos
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Lista
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Card key={list.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/list/${list.id}`}>
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center cursor-pointer hover:from-primary/30 hover:to-primary/10 transition-colors relative overflow-hidden">
                      {list.thumbnail ? (
                        <img
                          src={getImageUrl(list.thumbnail)}
                          alt={list.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="h-16 w-16 text-primary/40" />
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/list/${list.id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer line-clamp-1">
                          {list.name}
                        </h3>
                      </Link>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedList(list);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {list.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {list.itemCount} {list.itemCount === 1 ? "item" : "itens"}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {list.isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">Pública</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            <span className="text-xs">Privada</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Lista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-list-name">Nome da Lista</Label>
              <Input
                id="new-list-name"
                placeholder="Ex: Filmes de Terror"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-list-description">Descrição (opcional)</Label>
              <Textarea
                id="new-list-description"
                placeholder="Descreva sua lista..."
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-is-public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <Label htmlFor="new-is-public" className="cursor-pointer">
                Tornar lista pública
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewListName("");
                  setNewListDescription("");
                  setIsPublic(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateList}
                disabled={createList.isPending}
              >
                Criar Lista
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      {selectedList && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-list-name">Nome da Lista</Label>
                <Input
                  id="edit-list-name"
                  value={selectedList.name}
                  onChange={(e) =>
                    setSelectedList({ ...selectedList, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-list-description">Descrição (opcional)</Label>
                <Textarea
                  id="edit-list-description"
                  value={selectedList.description || ""}
                  onChange={(e) =>
                    setSelectedList({ ...selectedList, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-public"
                  checked={selectedList.isPublic}
                  onCheckedChange={(checked) =>
                    setSelectedList({ ...selectedList, isPublic: checked as boolean })
                  }
                />
                <Label htmlFor="edit-is-public" className="cursor-pointer">
                  Tornar lista pública
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedList(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateList}
                  disabled={updateList.isPending}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
