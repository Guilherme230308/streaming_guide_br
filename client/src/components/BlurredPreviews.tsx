import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Bell, Clock, Check, BarChart3, TrendingUp, DollarSign, Film, Tv, Sparkles } from "lucide-react";

/**
 * Fake movie/TV show poster cards for Watchlist and History previews
 */
const FAKE_POSTERS = [
  { title: "Filme Popular", year: "2025", rating: 8.2 },
  { title: "Série em Alta", year: "2024", rating: 7.9 },
  { title: "Novo Lançamento", year: "2026", rating: 8.5 },
  { title: "Clássico Favorito", year: "2019", rating: 8.8 },
  { title: "Ação & Aventura", year: "2025", rating: 7.6 },
  { title: "Drama Premiado", year: "2024", rating: 8.1 },
  { title: "Comédia Divertida", year: "2025", rating: 7.3 },
  { title: "Terror Assustador", year: "2024", rating: 7.7 },
  { title: "Ficção Científica", year: "2025", rating: 8.4 },
  { title: "Animação Incrível", year: "2026", rating: 8.0 },
  { title: "Documentário", year: "2024", rating: 7.5 },
  { title: "Romance Emocionante", year: "2025", rating: 7.8 },
];

function FakePosterCard({ title, year, rating }: { title: string; year: string; rating: number }) {
  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] bg-muted/30 rounded-lg" />
      <div>
        <p className="font-medium text-sm truncate">{title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{year}</span>
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Watchlist blurred preview - grid of movie/TV cards */
export function WatchlistPreview() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Minha Lista</h1>
        <p className="text-muted-foreground">Seus filmes e séries salvos para assistir depois</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {FAKE_POSTERS.map((item, i) => (
          <FakePosterCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/** MyLists blurred preview - list cards with thumbnails */
export function MyListsPreview() {
  const fakeLists = [
    { name: "Filmes para Maratonar", count: 12, isPublic: false },
    { name: "Séries de Suspense", count: 8, isPublic: true },
    { name: "Assistir com a Família", count: 15, isPublic: false },
    { name: "Melhores de 2025", count: 6, isPublic: true },
    { name: "Documentários Incríveis", count: 9, isPublic: false },
    { name: "Comédias Favoritas", count: 11, isPublic: true },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Listas</h1>
          <p className="text-muted-foreground">Organize seus filmes e séries em listas personalizadas</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fakeLists.map((list, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-24 bg-muted/30 rounded shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{list.name}</h3>
                  <p className="text-sm text-muted-foreground">{list.count} itens</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {list.isPublic ? "Pública" : "Privada"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Alerts blurred preview - alert cards with status */
export function AlertsPreview() {
  const fakeAlerts = [
    { title: "Novo Filme de Ação", status: "active", provider: "Netflix" },
    { title: "Série Premiada", status: "triggered", provider: "Disney+" },
    { title: "Documentário Esperado", status: "active", provider: "Prime Video" },
    { title: "Comédia Romântica", status: "active", provider: "HBO Max" },
    { title: "Anime Popular", status: "triggered", provider: "Crunchyroll" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Alertas e Disponibilidade</h1>
        <p className="text-muted-foreground">Veja o que está disponível nos seus streamings e configure alertas</p>
      </div>
      <div className="space-y-4">
        {fakeAlerts.map((alert, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-muted/30 rounded shrink-0" />
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">Aguardando em {alert.provider}</p>
                </div>
              </div>
              <Badge variant={alert.status === "triggered" ? "default" : "secondary"}>
                {alert.status === "triggered" ? (
                  <><Check className="h-3 w-3 mr-1" /> Disponível</>
                ) : (
                  <><Bell className="h-3 w-3 mr-1" /> Ativo</>
                )}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** History blurred preview - grid of watched content */
export function HistoryPreview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Histórico & Recomendações
        </h1>
        <p className="text-sm text-muted-foreground">Veja o que você assistiu e descubra novo conteúdo</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {FAKE_POSTERS.slice(0, 12).map((item, i) => (
          <FakePosterCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/** MySubscriptions blurred preview - provider grid */
export function SubscriptionsPreview() {
  const providers = [
    "Netflix", "Amazon Prime Video", "HBO Max", "Disney Plus",
    "Star Plus", "Paramount Plus", "Apple TV", "Globoplay",
    "Claro video", "Crunchyroll",
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Assinaturas</h1>
        <p className="text-muted-foreground">Selecione os serviços de streaming que você assina</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {providers.map((name, i) => (
          <Card key={i} className={i < 3 ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted/30 rounded-lg shrink-0" />
              <div>
                <p className="font-medium text-sm">{name}</p>
                {i < 3 && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Check className="h-3 w-3" /> Assinado
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** StreamingAnalysis blurred preview - analysis dashboard cards */
export function AnalysisPreview() {
  return (
    <div>
      <div className="mb-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Análise de Streamings</h1>
            <p className="text-xl text-muted-foreground mt-2">Descubra quais streamings valem mais a pena</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Gasto Mensal</span>
            </div>
            <p className="text-3xl font-bold">R$ 89,70</p>
            <p className="text-sm text-muted-foreground mt-1">3 assinaturas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Conteúdo Disponível</span>
            </div>
            <p className="text-3xl font-bold">2.847</p>
            <p className="text-sm text-muted-foreground mt-1">filmes e séries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Melhor Custo-Benefício</span>
            </div>
            <p className="text-3xl font-bold">Netflix</p>
            <p className="text-sm text-muted-foreground mt-1">R$ 0,03 por título</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider comparison cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {["Netflix", "Prime Video", "Disney+", "HBO Max"].map((name, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-muted/30 rounded-lg" />
                <div>
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[1200, 980, 650, 420][i]} títulos disponíveis
                  </p>
                </div>
              </div>
              <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${[85, 70, 50, 35][i]}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Review section blurred preview for MovieDetails */
export function ReviewSectionPreview() {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sua Avaliação</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-6 w-6 ${s <= 4 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
