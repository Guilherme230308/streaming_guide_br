import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ContentCard } from "@/components/ContentCard";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Film, Tv } from "lucide-react";
import { useState } from "react";

const PROVIDER_DATA: Record<string, { id: number; name: string; color: string }> = {
  "netflix": { id: 8, name: "Netflix", color: "#E50914" },
  "amazon-prime-video": { id: 119, name: "Amazon Prime Video", color: "#00A8E1" },
  "disney-plus": { id: 337, name: "Disney+", color: "#113CCF" },
  "hbo-max": { id: 1899, name: "Max (HBO)", color: "#B535F6" },
  "paramount-plus": { id: 531, name: "Paramount+", color: "#0064FF" },
  "crunchyroll": { id: 283, name: "Crunchyroll", color: "#F47521" },
  "globoplay": { id: 307, name: "Globoplay", color: "#F72B2B" },
  "apple-tv-plus": { id: 350, name: "Apple TV+", color: "#000000" },
};

type PageType = "filmes" | "series";

export default function SEOProviderPage() {
  const { provider } = useParams();
  const providerInfo = provider ? PROVIDER_DATA[provider] : null;
  
  // Determine if this is a filmes or series page from the URL
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const pageType: PageType = pathname.includes("melhores-series") ? "series" : "filmes";
  const mediaType = pageType === "series" ? "tv" : "movie";

  const [page, setPage] = useState(1);

  const { data: content, isLoading } = trpc.content.discoverByProvider.useQuery(
    { mediaType, providerId: providerInfo?.id || 0, page },
    { enabled: !!providerInfo }
  );

  if (!providerInfo) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Plataforma não encontrada</h1>
        <Link href="/melhores" className="text-primary hover:underline">Ver todas as plataformas</Link>
      </div>
    );
  }

  const year = new Date().getFullYear();
  const typeLabel = pageType === "series" ? "Séries" : "Filmes";

  return (
    <div className="container py-6">
      <SEO
        title={`Melhores ${typeLabel} ${providerInfo.name} ${year} - Top ${typeLabel} para Assistir | Stream Radar`}
        description={`Os melhores ${typeLabel.toLowerCase()} da ${providerInfo.name} em ${year}. Lista atualizada com os títulos mais populares e bem avaliados disponíveis no Brasil.`}
        url={`/melhores-${pageType}/${provider}`}
      />

      <Link href="/melhores" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar às Plataformas
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-8 rounded" style={{ backgroundColor: providerInfo.color }} />
          <h1 className="text-3xl font-bold">
            Melhores {typeLabel} {providerInfo.name} {year}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Lista atualizada dos {typeLabel.toLowerCase()} mais populares e bem avaliados disponíveis na {providerInfo.name} no Brasil.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Atualizado em {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}. Clique em qualquer título para ver onde assistir e mais detalhes.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          href={`/melhores-filmes/${provider}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            pageType === "filmes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-4 h-4" /> Filmes
        </Link>
        <Link
          href={`/melhores-series/${provider}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            pageType === "series" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tv className="w-4 h-4" /> Séries
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : content && content.results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {content.results.map((item: any, index: number) => (
              <div key={item.id} className="relative">
                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                  #{(page - 1) * 20 + index + 1}
                </div>
                <ContentCard
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  mediaType={mediaType}
                />
              </div>
            ))}
          </div>
          {content.results.length >= 20 && (
            <div className="flex justify-center gap-4 mt-8">
              {page > 1 && (
                <button
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Próxima Página
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-8">Nenhum conteúdo encontrado.</p>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-4">Outras Plataformas</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PROVIDER_DATA)
            .filter(([slug]) => slug !== provider)
            .map(([slug, info]) => (
              <Link
                key={slug}
                href={`/melhores-${pageType}/${slug}`}
                className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {info.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
