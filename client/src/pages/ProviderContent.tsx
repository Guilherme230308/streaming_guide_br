import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO, buildBreadcrumbJsonLd } from "@/components/SEO";
import { ArrowLeft, Film, Tv, ChevronLeft, ChevronRight } from "lucide-react";

// Provider data with TMDB IDs, slugs, and display info
const PROVIDERS = [
  { id: 8, slug: "netflix", name: "Netflix", color: "#E50914" },
  { id: 119, slug: "amazon-prime-video", name: "Amazon Prime Video", color: "#00A8E1" },
  { id: 337, slug: "disney-plus", name: "Disney+", color: "#113CCF" },
  { id: 1899, slug: "hbo-max", name: "Max", color: "#B535F6" },
  { id: 531, slug: "paramount-plus", name: "Paramount+", color: "#0064FF" },
  { id: 283, slug: "crunchyroll", name: "Crunchyroll", color: "#F47521" },
  { id: 307, slug: "globoplay", name: "Globoplay", color: "#F72B2B" },
  { id: 350, slug: "apple-tv-plus", name: "Apple TV+", color: "#000000" },
  { id: 484, slug: "star-plus", name: "Star+", color: "#02C8C8" },
] as const;

type MediaTab = "movie" | "tv";

function getImageUrl(path: string | null, size: string = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function getProviderLogoUrl(providerId: number) {
  // Use TMDB provider logos (Star+ uses CDN since TMDB removed it)
  const tmdbLogoMap: Record<number, string> = {
    8: "/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
    119: "/t/p/w92/pvske1MyAoymrs5bguRfVqYiM9a.jpg",
    337: "/t/p/w92/97yvRBw1GzX7fXprcF80er19ot.jpg",
    1899: "/t/p/w92/jbe4gVSfRlbPTdESXhEKpornsfu.jpg",
    531: "/t/p/w92/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg",
    283: "/t/p/w92/fzN5Jok5Ig1eJ7gyNGoMhnLSCfh.jpg",
    307: "/t/p/w92/7Cg8esVVXOijXAm1f1vrS7jVjcN.jpg",
    350: "/t/p/w92/6uhKBfmtzFqOcLousHwZuzcrScK.jpg",
  };
  const cdnLogoMap: Record<number, string> = {
    484: "https://d2xsxph8kpxj0f.cloudfront.net/310519663332642038/6zRbVUcmsbK5sCwMQ2CbCm/star-plus-logo_13598112.png",
  };
  if (cdnLogoMap[providerId]) return cdnLogoMap[providerId];
  const path = tmdbLogoMap[providerId];
  return path ? `https://image.tmdb.org${path}` : null;
}

export default function ProviderContent() {
  const { slug } = useParams();
  const [mediaTab, setMediaTab] = useState<MediaTab>("movie");
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);

  const provider = PROVIDERS.find((p) => p.slug === slug);

  const currentPage = mediaTab === "movie" ? moviePage : tvPage;

  const { data: content, isLoading } = trpc.content.discoverByProvider.useQuery(
    { mediaType: mediaTab, providerId: provider?.id || 0, page: currentPage },
    { enabled: !!provider }
  );

  const currentMonth = useMemo(() => {
    const date = new Date();
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  if (!provider) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container">
          <h1 className="text-2xl font-bold text-foreground">Provedor não encontrado</h1>
          <Link href="/melhores">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ver todos os provedores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const seoTitle = mediaTab === "movie"
    ? `Melhores Filmes no ${provider.name} em ${currentMonth}`
    : `Melhores Séries no ${provider.name} em ${currentMonth}`;

  const seoDescription = mediaTab === "movie"
    ? `Descubra os filmes mais populares disponíveis no ${provider.name} no Brasil em ${currentMonth}. Veja o catálogo completo com avaliações e sinopses.`
    : `Descubra as séries mais populares disponíveis no ${provider.name} no Brasil em ${currentMonth}. Veja o catálogo completo com avaliações e sinopses.`;

  const seoKeywords = `${provider.name.toLowerCase()}, filmes ${provider.name.toLowerCase()}, séries ${provider.name.toLowerCase()}, catálogo ${provider.name.toLowerCase()}, melhores filmes, melhores séries, streaming brasil`;

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Início", url: "/" },
    { name: "Melhores por Streaming", url: "/melhores" },
    { name: provider.name, url: `/melhores/${provider.slug}` },
  ]);

  const itemListJsonLd = content?.results ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: seoTitle,
    description: seoDescription,
    numberOfItems: content.results.length,
    itemListElement: content.results.slice(0, 10).map((item: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://streamguide.click/${mediaTab === "movie" ? "movie" : "tv"}/${item.id}`,
      name: mediaTab === "movie" ? item.title : item.name,
    })),
  } : undefined;

  const logoUrl = getProviderLogoUrl(provider.id);

  return (
    <div className="min-h-screen bg-background pt-16">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/melhores/${provider.slug}`}
        jsonLd={itemListJsonLd ? [breadcrumbs, itemListJsonLd] : breadcrumbs}
      />

      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container py-8">
          <Link href="/melhores">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Todos os streamings
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={provider.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Melhores {mediaTab === "movie" ? "Filmes" : "Séries"} no {provider.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Os títulos mais populares disponíveis no Brasil em {currentMonth}
              </p>
            </div>
          </div>

          {/* Media Type Tabs */}
          <div className="flex gap-2">
            <Button
              variant={mediaTab === "movie" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMediaTab("movie"); }}
              className="gap-2"
            >
              <Film className="h-4 w-4" />
              Filmes
            </Button>
            <Button
              variant={mediaTab === "tv" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMediaTab("tv"); }}
              className="gap-2"
            >
              <Tv className="h-4 w-4" />
              Séries
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-lg" />
                <div className="mt-2 h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : content?.results && content.results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {content.results.map((item: any) => (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  title={mediaTab === "movie" ? item.title : item.name}
                  posterPath={item.poster_path}
                  mediaType={mediaTab}
                  releaseDate={mediaTab === "movie" ? item.release_date : item.first_air_date}
                  voteAverage={item.vote_average}
                />
              ))}
            </div>

            {/* Pagination */}
            {content.total_pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    if (mediaTab === "movie") setMoviePage((p) => Math.max(1, p - 1));
                    else setTvPage((p) => Math.max(1, p - 1));
                  }}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {Math.min(content.total_pages, 500)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= Math.min(content.total_pages, 500)}
                  onClick={() => {
                    if (mediaTab === "movie") setMoviePage((p) => p + 1);
                    else setTvPage((p) => p + 1);
                  }}
                  className="gap-1"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-6">
              Dados fornecidos por TMDB. Atualizado automaticamente.
            </p>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum conteúdo encontrado para este provedor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
