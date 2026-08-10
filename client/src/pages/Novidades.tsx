import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ContentCard } from "@/components/ContentCard";
import { SEO } from "@/components/SEO";
import { Sparkles, Film, Tv, Calendar } from "lucide-react";
import { Link } from "wouter";

const PROVIDERS = [
  { id: 8, name: "Netflix", slug: "netflix", color: "#E50914" },
  { id: 119, name: "Prime Video", slug: "amazon-prime-video", color: "#00A8E1" },
  { id: 337, name: "Disney+", slug: "disney-plus", color: "#113CCF" },
  { id: 1899, name: "Max (HBO)", slug: "hbo-max", color: "#B535F6" },
  { id: 531, name: "Paramount+", slug: "paramount-plus", color: "#0064FF" },
  { id: 307, name: "Globoplay", slug: "globoplay", color: "#F72B2B" },
  { id: 283, name: "Crunchyroll", slug: "crunchyroll", color: "#F47521" },
  { id: 350, name: "Apple TV+", slug: "apple-tv-plus", color: "#000000" },
];

export default function Novidades() {
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  // Fetch recent movies (sorted by release date desc, filtered by provider if selected)
  const { data: recentMovies, isLoading: loadingMovies } = trpc.content.discoverByProvider.useQuery(
    { mediaType: "movie", providerId: selectedProvider || 8, page: 1 },
    { enabled: mediaType === "movie" }
  );

  const { data: recentTV, isLoading: loadingTV } = trpc.content.discoverByProvider.useQuery(
    { mediaType: "tv", providerId: selectedProvider || 8, page: 1 },
    { enabled: mediaType === "tv" }
  );

  const content = mediaType === "movie" ? recentMovies : recentTV;
  const isLoading = mediaType === "movie" ? loadingMovies : loadingTV;

  // Filter to show only recent releases (last 30 days)
  const recentContent = useMemo(() => {
    if (!content?.results) return [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return content.results.filter((item: any) => {
      const date = item.release_date || item.first_air_date;
      if (!date) return true; // include items without dates
      return new Date(date) >= thirtyDaysAgo;
    });
  }, [content]);

  // If filtered list is too small, show all results
  const displayContent = recentContent.length >= 5 ? recentContent : (content?.results || []);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthName = now.toLocaleDateString("pt-BR", { month: "long" });
  const year = now.getFullYear();

  const currentProviderName = selectedProvider
    ? PROVIDERS.find(p => p.id === selectedProvider)?.name || "Streaming"
    : "Netflix";

  return (
    <div className="container py-6">
      <SEO
        title={`Novidades no Streaming - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year} | Stream Radar`}
        description={`Descubra os filmes e séries que acabaram de chegar nos streamings do Brasil em ${monthName} ${year}. Veja as novidades da Netflix, Prime Video, Disney+, HBO Max e mais.`}
        url="/novidades"
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Novidades no Streaming</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Filmes e séries que acabaram de chegar nas plataformas de streaming do Brasil.
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Atualizado em {now.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Provider filter */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Filtrar por plataforma:</h2>
        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                (selectedProvider || 8) === provider.id
                  ? "text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              style={(selectedProvider || 8) === provider.id ? { backgroundColor: provider.color } : {}}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* Media type tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMediaType("movie")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mediaType === "movie" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-4 h-4" /> Filmes
        </button>
        <button
          onClick={() => setMediaType("tv")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mediaType === "tv" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tv className="w-4 h-4" /> Séries
        </button>
      </div>

      {/* Content grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : displayContent.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayContent.map((item: any) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title || item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              releaseDate={item.release_date || item.first_air_date}
              mediaType={mediaType}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Nenhuma novidade encontrada para esta plataforma.</p>
      )}

      {/* SEO text block for AI/Google */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-4">Novidades no Streaming em {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Confira os últimos lançamentos disponíveis nas plataformas de streaming no Brasil. 
          A {currentProviderName} adicionou novos títulos ao seu catálogo recentemente, incluindo filmes e séries 
          que acabaram de estrear. Use o Stream Radar para descobrir onde assistir cada título e comparar 
          a disponibilidade entre Netflix, Amazon Prime Video, Disney+, HBO Max, Paramount+, Globoplay e outras plataformas.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Esta página é atualizada automaticamente com os conteúdos mais recentes de cada plataforma. 
          Volte sempre para conferir as novidades da semana no streaming brasileiro.
        </p>
      </div>

      {/* Cross-links */}
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-4">Explore Mais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/streaming-prices" className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-center transition-colors">
            <span className="text-sm font-medium">Comparar Preços</span>
          </Link>
          <Link href="/genres" className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-center transition-colors">
            <span className="text-sm font-medium">Explorar Gêneros</span>
          </Link>
          <Link href="/melhores" className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-center transition-colors">
            <span className="text-sm font-medium">Top por Plataforma</span>
          </Link>
          <Link href="/upcoming" className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-center transition-colors">
            <span className="text-sm font-medium">Em Breve</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
