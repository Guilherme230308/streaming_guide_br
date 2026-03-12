import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate?: string;
}

export function AddToListDialog({
  open,
  onOpenChange,
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseDate,
}: AddToListDialogProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const utils = trpc.useUtils();

  const { data: lists = [] } = trpc.customLists.getUserLists.useQuery(undefined, {
    enabled: open,
  });
  const { data: itemLists = [] } = trpc.customLists.getItemLists.useQuery(
    { tmdbId, mediaType },
    { enabled: open }
  );

  const createList = trpc.customLists.create.useMutation({
    onSuccess: () => {
      utils.customLists.getUserLists.invalidate();
      setNewListName("");
      setNewListDescription("");
      setIsPublic(false);
      setShowCreateForm(false);
      toast.success("Lista criada com sucesso!");
    },
  });

  const addToList = trpc.customLists.addItem.useMutation({
    onSuccess: () => {
      utils.customLists.getItemLists.invalidate({ tmdbId, mediaType });
      utils.customLists.getUserLists.invalidate();
      toast.success("Adicionado à lista!");
    },
  });

  const removeFromList = trpc.customLists.removeItem.useMutation({
    onSuccess: () => {
      utils.customLists.getItemLists.invalidate({ tmdbId, mediaType });
      utils.customLists.getUserLists.invalidate();
      toast.success("Removido da lista!");
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

  const handleToggleList = (listId: number, isInList: boolean) => {
    if (isInList) {
      removeFromList.mutate({ listId, tmdbId, mediaType });
    } else {
      addToList.mutate({
        listId,
        tmdbId,
        mediaType,
        title,
        posterPath,
        releaseDate,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar à lista</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showCreateForm ? (
            <>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4" />
                Criar Nova Lista
              </Button>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {lists.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Você ainda não tem listas. Crie uma nova lista acima!
                  </p>
                ) : (
                  lists.map((list) => {
                    const isInList = itemLists.some((l) => l.id === list.id);
                    return (
                      <div
                        key={list.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        onClick={() => handleToggleList(list.id, isInList)}
                      >
                        <Checkbox checked={isInList} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{list.name}</p>
                          {list.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {list.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {list.itemCount} {list.itemCount === 1 ? "item" : "itens"}
                          </p>
                        </div>
                        {isInList && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name">Nome da Lista</Label>
                <Input
                  id="list-name"
                  placeholder="Ex: Filmes de Terror"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="list-description">Descrição (opcional)</Label>
                <Textarea
                  id="list-description"
                  placeholder="Descreva sua lista..."
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="is-public" className="cursor-pointer">
                  Tornar lista pública
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateForm(false);
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
