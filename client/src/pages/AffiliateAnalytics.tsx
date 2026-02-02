import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  MousePointerClick,
  DollarSign,
  Calendar,
  ArrowLeft,
  Film
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function AffiliateAnalytics() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: stats, isLoading } = trpc.affiliate.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl mb-4">Acesso negado</p>
          <p className="text-muted-foreground mb-6">Você precisa ser administrador para acessar esta página</p>
          <Button onClick={() => setLocation("/")}>Voltar para início</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Film className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
              </div>
            </Link>

            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics de Afiliados</h1>
          <p className="text-muted-foreground">
            Estatísticas de cliques em links de streaming
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Todos os tempos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streaming Mais Clicado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.clicksByProvider[0]?.providerName || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.clicksByProvider[0]?.count || 0} cliques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipo Mais Comum</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats?.clicksByType[0]?.clickType === 'stream' ? 'Streaming' :
                 stats?.clicksByType[0]?.clickType === 'rent' ? 'Aluguel' :
                 stats?.clicksByType[0]?.clickType === 'buy' ? 'Compra' : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.clicksByType[0]?.count || 0} cliques
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Clicks by Provider */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cliques por Streaming</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.clicksByProvider && stats.clicksByProvider.length > 0 ? (
              <div className="space-y-4">
                {stats.clicksByProvider.map((provider) => (
                  <div key={provider.providerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{provider.providerId}</Badge>
                      <span className="font-medium text-foreground">{provider.providerName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(provider.count / (stats.totalClicks || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-16 text-right">
                        {provider.count} cliques
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum clique registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Clicks by Type */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cliques por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.clicksByType && stats.clicksByType.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {stats.clicksByType.map((type) => (
                  <Card key={type.clickType}>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{type.count}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {type.clickType === 'stream' ? 'Streaming' :
                         type.clickType === 'rent' ? 'Aluguel' :
                         type.clickType === 'buy' ? 'Compra' : type.clickType}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum clique registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Clicks by Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cliques por Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.clicksByDate && stats.clicksByDate.length > 0 ? (
              <div className="space-y-2">
                {stats.clicksByDate.slice(-30).map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-medium text-foreground">{day.count} cliques</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum clique registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Sobre o Sistema de Afiliados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O sistema rastreia automaticamente todos os cliques em links de streamings, aluguel e compra.
              Os dados são coletados anonimamente e usados para otimizar a experiência do usuário e gerar receita através de programas de afiliados.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Configure seus IDs de afiliado em <code className="bg-secondary px-1 py-0.5 rounded">server/affiliateConfig.ts</code> para monetizar os cliques.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
