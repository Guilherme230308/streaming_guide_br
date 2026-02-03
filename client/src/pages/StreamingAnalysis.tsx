import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Film, 
  Tv, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

// Provider logos mapping
const PROVIDER_LOGOS: Record<number, string> = {
  8: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg", // Netflix
  119: "https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg", // Prime Video
  337: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg", // Disney+
  384: "https://image.tmdb.org/t/p/original/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg", // HBO Max
  531: "https://image.tmdb.org/t/p/original/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg", // Paramount+
  350: "https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg", // Apple TV+
  307: "https://image.tmdb.org/t/p/original/oIkQkEkwfmcG7IGpRR1NB8frZZM.jpg", // Globoplay
  619: "https://image.tmdb.org/t/p/original/cv5S44vHpNoMSGjnGHLq6381Ppz.jpg", // Star+
  283: "https://image.tmdb.org/t/p/original/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg", // Crunchyroll
  167: "https://image.tmdb.org/t/p/original/tkU3qVgkgFpYCyJWKhxNGRvE3xn.jpg", // Claro Video
};

export default function StreamingAnalysis() {
  const { data, isLoading, error } = trpc.streamingAnalysis.getAnalysis.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
          <div className="container py-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <div className="container py-12">
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar análise</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar a análise de streamings. Tente novamente mais tarde.
            </p>
            <Link href="/">
              <Button>Voltar para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscribedProviders = data.providers.filter(p => p.isSubscribed);
  const notSubscribedProviders = data.providers.filter(p => !p.isSubscribed && p.totalContent > 0);
  const bestValue = data.providers.filter(p => p.totalContent > 0).sort((a, b) => a.costPerTitle - b.costPerTitle)[0];
  const mostContent = data.providers.sort((a, b) => b.totalContent - a.totalContent)[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-12">
        {/* Hero Section */}
        <div className="mb-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Análise de Streamings
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Descubra quais streamings valem mais a pena para você
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conteúdo Analisado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {data.totalUserContent}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                títulos na sua lista
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Suas Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {data.userSubscriptionsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                streamings ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Melhor Custo-Benefício
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {bestValue?.providerName || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {bestValue ? `R$ ${bestValue.costPerTitle.toFixed(2)}/título` : "Adicione conteúdo"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mais Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {mostContent?.providerName || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mostContent ? `${mostContent.totalContent} títulos` : "Adicione conteúdo"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Section */}
        {data.recommendations.length > 0 && (
          <Card className="mb-12 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription>
                Baseado no seu histórico e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      rec.type === 'subscribe' 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : rec.type === 'cancel'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-blue-500/30 bg-blue-500/5'
                    }`}
                  >
                    {rec.type === 'subscribe' && (
                      <TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0" />
                    )}
                    {rec.type === 'cancel' && (
                      <TrendingDown className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )}
                    {rec.type === 'keep' && (
                      <CheckCircle2 className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {rec.type === 'subscribe' && 'Considere assinar '}
                        {rec.type === 'cancel' && 'Considere cancelar '}
                        {rec.type === 'keep' && 'Mantenha '}
                        <span className="text-primary">{rec.providerName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Badge 
                      variant={rec.type === 'subscribe' ? 'default' : rec.type === 'cancel' ? 'destructive' : 'secondary'}
                    >
                      {rec.type === 'subscribe' && 'Assinar'}
                      {rec.type === 'cancel' && 'Cancelar'}
                      {rec.type === 'keep' && 'Manter'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Subscriptions */}
        {subscribedProviders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Seus Streamings
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {subscribedProviders.map((provider) => (
                <ProviderCard key={provider.providerId} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {/* Not Subscribed but Relevant */}
        {notSubscribedProviders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Streamings com Conteúdo Relevante
              <Badge variant="outline" className="ml-2">Você não assina</Badge>
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {notSubscribedProviders.map((provider) => (
                <ProviderCard key={provider.providerId} provider={provider} highlight />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.totalUserContent === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Nenhum conteúdo para analisar
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adicione filmes e séries à sua lista, marque como assistido ou crie listas personalizadas para ver a análise de streamings.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button>Explorar Conteúdo</Button>
                </Link>
                <Link href="/watchlist">
                  <Button variant="outline">Ver Minha Lista</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Providers Ranking */}
        {data.totalUserContent > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ranking Completo</CardTitle>
              <CardDescription>
                Todos os streamings ordenados por quantidade de conteúdo do seu interesse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.providers
                  .filter(p => p.totalContent > 0)
                  .map((provider, index) => (
                  <div 
                    key={provider.providerId}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    <img 
                      src={PROVIDER_LOGOS[provider.providerId]} 
                      alt={provider.providerName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {provider.providerName}
                        {provider.isSubscribed && (
                          <Badge variant="secondary" className="text-xs">Assinante</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {provider.totalContent} títulos · R$ {provider.costPerTitle.toFixed(2)}/título
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {provider.matchPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface ProviderCardProps {
  provider: {
    providerId: number;
    providerName: string;
    monthlyPrice: number;
    totalContent: number;
    watchlistContent: number;
    watchedContent: number;
    listContent: number;
    matchPercentage: number;
    costPerTitle: number;
    isSubscribed: boolean;
    sampleTitles: string[];
  };
  highlight?: boolean;
}

function ProviderCard({ provider, highlight }: ProviderCardProps) {
  return (
    <Card className={highlight ? 'border-amber-500/30' : ''}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={PROVIDER_LOGOS[provider.providerId]} 
              alt={provider.providerName}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <CardTitle className="text-lg">{provider.providerName}</CardTitle>
              <CardDescription>
                R$ {provider.monthlyPrice.toFixed(2)}/mês
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {provider.matchPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">match</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Compatibilidade</span>
              <span className="font-medium">{provider.totalContent} títulos</span>
            </div>
            <Progress value={provider.matchPercentage} className="h-2" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{provider.watchlistContent}</div>
              <div className="text-xs text-muted-foreground">Na Lista</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{provider.watchedContent}</div>
              <div className="text-xs text-muted-foreground">Assistidos</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">
                R$ {provider.costPerTitle.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Por Título</div>
            </div>
          </div>

          {/* Sample titles */}
          {provider.sampleTitles.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Alguns títulos disponíveis:
              </div>
              <div className="flex flex-wrap gap-1">
                {provider.sampleTitles.slice(0, 5).map((title, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {title}
                  </Badge>
                ))}
                {provider.sampleTitles.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.sampleTitles.length - 5} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
