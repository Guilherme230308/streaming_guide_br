import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchFiltersType {
  genres: string[];
  yearMin?: number;
  yearMax?: number;
  ratingMin?: number;
  providers: string[];
  streamingOnly?: boolean;
}

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

const GENRES = [
  { id: "28", name: "Ação" },
  { id: "12", name: "Aventura" },
  { id: "16", name: "Animação" },
  { id: "35", name: "Comédia" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentário" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Família" },
  { id: "14", name: "Fantasia" },
  { id: "36", name: "História" },
  { id: "27", name: "Terror" },
  { id: "10402", name: "Música" },
  { id: "9648", name: "Mistério" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Ficção Científica" },
  { id: "10770", name: "Cinema TV" },
  { id: "53", name: "Thriller" },
  { id: "10752", name: "Guerra" },
  { id: "37", name: "Faroeste" },
];

const STREAMING_PROVIDERS = [
  { id: "8", name: "Netflix" },
  { id: "119", name: "Prime Video" },
  { id: "337", name: "Disney+" },
  { id: "384", name: "HBO Max" },
  { id: "350", name: "Apple TV+" },
  { id: "531", name: "Paramount+" },
  { id: "1899", name: "Max" },
  { id: "619", name: "Star+" },
];

const currentYear = new Date().getFullYear();

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genreId: string) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const toggleProvider = (providerId: string) => {
    const newProviders = filters.providers.includes(providerId)
      ? filters.providers.filter((id) => id !== providerId)
      : [...filters.providers, providerId];
    onFiltersChange({ ...filters, providers: newProviders });
  };

  const clearFilters = () => {
    onFiltersChange({
      genres: [],
      yearMin: undefined,
      yearMax: undefined,
      ratingMin: undefined,
      providers: [],
    });
  };

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.providers.length > 0 ||
    filters.yearMin !== undefined ||
    filters.yearMax !== undefined ||
    filters.ratingMin !== undefined;

  const activeFiltersCount =
    filters.genres.length +
    filters.providers.length +
    (filters.yearMin !== undefined ? 1 : 0) +
    (filters.yearMax !== undefined ? 1 : 0) +
    (filters.ratingMin !== undefined ? 1 : 0) +
    (filters.streamingOnly ? 1 : 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative"
          size="sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[600px] overflow-y-auto" align="start">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Filtros Avançados</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Limpar Tudo
              </Button>
            )}
          </div>

          {/* Genre Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gêneros</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={filters.genres.includes(genre.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                  {filters.genres.includes(genre.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Year Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ano de Lançamento</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-2">De</Label>
                <Select
                  value={filters.yearMin?.toString() || "none"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      yearMin: value !== "none" ? parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mínimo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Qualquer</SelectItem>
                    {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2">Até</Label>
                <Select
                  value={filters.yearMax?.toString() || "none"}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      yearMax: value !== "none" ? parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Máximo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Qualquer</SelectItem>
                    {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Nota Mínima: {filters.ratingMin !== undefined ? filters.ratingMin.toFixed(1) : "Qualquer"}
            </Label>
            <Slider
              value={[filters.ratingMin || 0]}
              onValueChange={([value]) =>
                onFiltersChange({
                  ...filters,
                  ratingMin: value > 0 ? value : undefined,
                })
              }
              max={10}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Streaming Platform Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Plataformas de Streaming</Label>
            <div className="flex flex-wrap gap-2">
              {STREAMING_PROVIDERS.map((provider) => (
                <Badge
                  key={provider.id}
                  variant={filters.providers.includes(provider.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleProvider(provider.id)}
                >
                  {provider.name}
                  {filters.providers.includes(provider.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Streaming Availability Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Disponível em Streaming</Label>
              <Button
                variant={filters.streamingOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    streamingOnly: !filters.streamingOnly,
                  });
                }}
                className="h-8"
              >
                {filters.streamingOnly ? "Ativado" : "Desativado"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mostrar apenas conteúdo disponível em pelo menos um streaming
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
