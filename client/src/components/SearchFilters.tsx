import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "onde-assistir-search-filters";

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

/** Load saved filters from localStorage */
export function loadSavedFilters(): SearchFiltersType | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        genres: Array.isArray(parsed.genres) ? parsed.genres : [],
        yearMin: parsed.yearMin ?? undefined,
        yearMax: parsed.yearMax ?? undefined,
        ratingMin: parsed.ratingMin ?? undefined,
        providers: Array.isArray(parsed.providers) ? parsed.providers : [],
        streamingOnly: parsed.streamingOnly ?? false,
      };
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/** Save filters to localStorage */
function saveFilters(filters: SearchFiltersType) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // ignore storage errors
  }
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFilters(filters);
  }, [filters]);

  const toggleGenre = useCallback((genreId: string) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];
    onFiltersChange({ ...filters, genres: newGenres });
  }, [filters, onFiltersChange]);

  const toggleProvider = useCallback((providerId: string) => {
    const newProviders = filters.providers.includes(providerId)
      ? filters.providers.filter((id) => id !== providerId)
      : [...filters.providers, providerId];
    onFiltersChange({ ...filters, providers: newProviders });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    const cleared: SearchFiltersType = {
      genres: [],
      yearMin: undefined,
      yearMax: undefined,
      ratingMin: undefined,
      providers: [],
      streamingOnly: false,
    };
    onFiltersChange(cleared);
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.providers.length > 0 ||
    filters.yearMin !== undefined ||
    filters.yearMax !== undefined ||
    filters.ratingMin !== undefined ||
    filters.streamingOnly;

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
          className="relative h-14 w-14 flex-shrink-0"
          size="icon"
          data-tour="filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[420px] overflow-y-auto p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-[11px] px-2"
              >
                Limpar
              </Button>
            )}
          </div>

          {/* 1. Streaming Availability Filter - FIRST */}
          <div className="flex items-center justify-between py-1 border-b border-border/50 pb-2">
            <div className="flex-1">
              <Label className="text-xs font-medium">Disponível em Streaming</Label>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Apenas conteúdo em streaming
              </p>
            </div>
            <Button
              variant={filters.streamingOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  streamingOnly: !filters.streamingOnly,
                });
              }}
              className="h-7 text-[11px] px-3 ml-2"
            >
              {filters.streamingOnly ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {/* 2. Streaming Platform Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Plataformas</Label>
            <div className="flex flex-wrap gap-1.5">
              {STREAMING_PROVIDERS.map((provider) => (
                <Badge
                  key={provider.id}
                  variant={filters.providers.includes(provider.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 text-[11px] py-0 h-6"
                  onClick={() => toggleProvider(provider.id)}
                >
                  {provider.name}
                  {filters.providers.includes(provider.id) && (
                    <X className="ml-1 h-2.5 w-2.5" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* 3. Genre Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Gêneros</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={filters.genres.includes(genre.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 text-[11px] py-0 h-6"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                  {filters.genres.includes(genre.id) && (
                    <X className="ml-1 h-2.5 w-2.5" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* 4. Year Range Filter - Compact inline */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Ano</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.yearMin?.toString() || "none"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    yearMin: value !== "none" ? parseInt(value) : undefined,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="De" />
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
              <Select
                value={filters.yearMax?.toString() || "none"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    yearMax: value !== "none" ? parseInt(value) : undefined,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Até" />
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

          {/* 5. Rating Filter - Compact */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
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
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full h-8 text-xs"
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
