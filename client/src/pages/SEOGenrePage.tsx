import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ContentCard } from "@/components/ContentCard";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Film, Tv } from "lucide-react";
import { useState } from "react";

const GENRE_DATA: Record<string, { id: number; tvId?: number; name: string; description: string }> = {
  "acao": { id: 28, tvId: 10759, name: "Ação", description: "Explosões, perseguições e adrenalina pura. Os melhores filmes e séries de ação disponíveis no streaming brasileiro." },
  "aventura": { id: 12, tvId: 10759, name: "Aventura", description: "Jornadas épicas e mundos inexplorados. Descubra as melhores aventuras no streaming." },
  "animacao": { id: 16, name: "Animação", description: "De Pixar a anime, as melhores animações para todas as idades no streaming." },
  "comedia": { id: 35, name: "Comédia", description: "Rir é o melhor remédio. As comédias mais engraçadas disponíveis no streaming brasileiro." },
  "crime": { id: 80, name: "Crime", description: "Investigações, máfias e suspense criminal. O melhor do gênero crime no streaming." },
  "documentario": { id: 99, name: "Documentário", description: "Histórias reais que fascinam. Os documentários mais impactantes no streaming." },
  "drama": { id: 18, name: "Drama", description: "Histórias emocionantes e performances marcantes. Os melhores dramas no streaming." },
  "familia": { id: 10751, name: "Família", description: "Diversão para toda a família. Filmes e séries para assistir juntos no streaming." },
  "fantasia": { id: 14, tvId: 10765, name: "Fantasia", description: "Mundos mágicos e criaturas fantásticas. O melhor da fantasia no streaming." },
  "terror": { id: 27, name: "Terror", description: "Sustos, tensão e horror. Os filmes e séries mais assustadores no streaming." },
  "romance": { id: 10749, name: "Romance", description: "Histórias de amor que emocionam. Os melhores romances no streaming brasileiro." },
  "ficcao-cientifica": { id: 878, tvId: 10765, name: "Ficção Científica", description: "Viagens espaciais, tecnologia e futuros possíveis. A melhor ficção científica no streaming." },
  "suspense": { id: 53, name: "Suspense", description: "Tensão do início ao fim. Os thrillers mais envolventes no streaming." },
  "guerra": { id: 10752, tvId: 10768, name: "Guerra", description: "Batalhas históricas e dramas bélicos. Os melhores filmes de guerra no streaming." },
  "faroeste": { id: 37, name: "Faroeste", description: "O velho oeste em toda sua glória. Westerns clássicos e modernos no streaming." },
  "musical": { id: 10402, name: "Musical", description: "Música, dança e emoção. Os melhores musicais disponíveis no streaming." },
  "misterio": { id: 9648, name: "Mistério", description: "Enigmas e reviravoltas. Os mistérios mais intrigantes no streaming." },
  "historia": { id: 36, name: "História", description: "Fatos históricos que moldaram o mundo. Os melhores filmes históricos no streaming." },
};

export default function SEOGenrePage() {
  const { genre } = useParams();
  const genreInfo = genre ? GENRE_DATA[genre] : null;
  const [mediaTab, setMediaTab] = useState<"movie" | "tv">("movie");

  const genreId = mediaTab === "movie" ? genreInfo?.id : (genreInfo?.tvId || genreInfo?.id);

  const { data: content, isLoading } = trpc.content.discoverByGenre.useQuery(
    { mediaType: mediaTab, genreId: genreId || 0, page: 1 },
    { enabled: !!genreInfo }
  );

  if (!genreInfo) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Gênero não encontrado</h1>
        <Link href="/genres" className="text-primary hover:underline">Ver todos os gêneros</Link>
      </div>
    );
  }

  const year = new Date().getFullYear();

  return (
    <div className="container py-6">
      <SEO
        title={`Filmes de ${genreInfo.name} para Assistir no Streaming - ${year} | Stream Radar`}
        description={`Os melhores filmes e séries de ${genreInfo.name.toLowerCase()} disponíveis no streaming no Brasil em ${year}. Descubra onde assistir agora.`}
        url={`/onde-assistir/${genre}`}
      />

      <Link href="/genres" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar aos Gêneros
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Filmes e Séries de {genreInfo.name} para Assistir no Streaming
        </h1>
        <p className="text-muted-foreground text-lg">{genreInfo.description}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Lista atualizada em {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} com os títulos mais populares e bem avaliados disponíveis nas plataformas de streaming do Brasil.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMediaTab("movie")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mediaTab === "movie" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-4 h-4" /> Filmes
        </button>
        <button
          onClick={() => setMediaTab("tv")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mediaTab === "tv" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tv className="w-4 h-4" /> Séries
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : content && content.results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {content.results.map((item: any) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title || item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              releaseDate={item.release_date || item.first_air_date}
              mediaType={mediaTab}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Nenhum conteúdo encontrado.</p>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-4">Outros Gêneros Populares</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GENRE_DATA)
            .filter(([slug]) => slug !== genre)
            .slice(0, 12)
            .map(([slug, info]) => (
              <Link
                key={slug}
                href={`/onde-assistir/${slug}`}
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
