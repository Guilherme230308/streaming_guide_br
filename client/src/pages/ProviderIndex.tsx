import { Link } from "wouter";
import { SEO, buildBreadcrumbJsonLd } from "@/components/SEO";
import { useMemo } from "react";

const PROVIDERS = [
  { id: 8, slug: "netflix", name: "Netflix", description: "Filmes, séries e documentários originais e licenciados", color: "#E50914" },
  { id: 119, slug: "amazon-prime-video", name: "Amazon Prime Video", description: "Grande catálogo com filmes, séries e conteúdo original Amazon", color: "#00A8E1" },
  { id: 337, slug: "disney-plus", name: "Disney+", description: "Disney, Pixar, Marvel, Star Wars e National Geographic", color: "#113CCF" },
  { id: 1899, slug: "hbo-max", name: "Max", description: "Séries HBO, filmes Warner Bros e conteúdo exclusivo", color: "#B535F6" },
  { id: 531, slug: "paramount-plus", name: "Paramount+", description: "Filmes Paramount, séries CBS e conteúdo original", color: "#0064FF" },
  { id: 283, slug: "crunchyroll", name: "Crunchyroll", description: "O maior catálogo de anime do mundo", color: "#F47521" },
  { id: 307, slug: "globoplay", name: "Globoplay", description: "Novelas, séries e jornalismo da Globo", color: "#F72B2B" },
  { id: 350, slug: "apple-tv-plus", name: "Apple TV+", description: "Séries e filmes originais Apple premiados", color: "#000000" },
  { id: 484, slug: "star-plus", name: "Star+", description: "Esportes ESPN, séries e filmes para adultos", color: "#02C8C8" },
];

function getProviderLogoUrl(providerId: number) {
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

export default function ProviderIndex() {
  const currentMonth = useMemo(() => {
    const date = new Date();
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Início", url: "/" },
    { name: "Melhores por Streaming", url: "/melhores" },
  ]);

  const seoDescription = `Descubra os melhores filmes e séries em cada plataforma de streaming no Brasil em ${currentMonth}. Compare catálogos de Netflix, Prime Video, Disney+, HBO Max e mais.`;

  return (
    <div className="min-h-screen bg-background pt-16">
      <SEO
        title={`Melhores Filmes e Séries por Streaming - ${currentMonth}`}
        description={seoDescription}
        keywords="melhores filmes streaming, melhores séries streaming, catálogo netflix, catálogo disney plus, catálogo hbo max, catálogo prime video, streaming brasil"
        url="/melhores"
        jsonLd={breadcrumbs}
      />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Melhores Filmes e Séries por Streaming
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore os títulos mais populares em cada plataforma de streaming disponível no Brasil em {currentMonth}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => {
            const logoUrl = getProviderLogoUrl(provider.id);
            return (
              <Link key={provider.slug} href={`/melhores/${provider.slug}`}>
                <div className="group flex items-center gap-4 p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-accent/5 transition-all cursor-pointer">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={provider.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: provider.color }}
                    >
                      {provider.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {provider.name}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-card border border-border/50">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Como escolher o melhor streaming?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Cada plataforma de streaming tem seu ponto forte. A <strong>Netflix</strong> se destaca pelo grande volume de conteúdo original e variedade internacional. O <strong>Amazon Prime Video</strong> oferece um catálogo extenso com bom custo-benefício. A <strong>Disney+</strong> é ideal para famílias e fãs de Marvel, Star Wars e Pixar. O <strong>HBO Max</strong> é referência em séries de qualidade como House of the Dragon e The Last of Us.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Para anime, o <strong>Crunchyroll</strong> é imbatível. O <strong>Globoplay</strong> é a escolha certa para quem acompanha novelas e conteúdo nacional. O <strong>Paramount+</strong> e o <strong>Apple TV+</strong> complementam com produções originais premiadas.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Use nosso comparador de preços na página <Link href="/streaming-prices" className="text-primary hover:underline">Preços de Streaming</Link> para encontrar o melhor plano para você.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Dados fornecidos por TMDB. Catálogos atualizados automaticamente. Disponibilidade pode variar.
        </p>
      </div>
    </div>
  );
}
