import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Activity,
  Database,
  Cpu,
  Zap,
  Search,
  Eye,
  Brain,
  HardDrive,
  TrendingDown,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useMemo } from "react";

export default function UsageMetrics() {
  const { user, loading: authLoading } = useAuth();

  const { data: summary, isLoading: summaryLoading, refetch } = trpc.metrics.getSummary.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Activity className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Acesso Restrito</h1>
        <p className="text-muted-foreground text-center">
          Faça login como administrador para acessar as métricas de uso.
        </p>
        <a href={getLoginUrl()}>
          <Button>Entrar</Button>
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Activity className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
        <p className="text-muted-foreground text-center">
          Apenas administradores podem acessar esta página.
        </p>
        <Link href="/">
          <Button variant="outline">Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  const weekApiCalls = summary?.weekSummary?.tmdb_api_call || 0;
  const weekCacheHits = summary?.weekSummary?.tmdb_cache_hit || 0;
  const weekPageViews = summary?.weekSummary?.page_view || 0;
  const weekSearches = summary?.weekSummary?.search_request || 0;
  const weekAiUsage = summary?.weekSummary?.ai_usage || 0;

  const monthApiCalls = summary?.monthSummary?.tmdb_api_call || 0;
  const monthCacheHits = summary?.monthSummary?.tmdb_cache_hit || 0;
  const monthPageViews = summary?.monthSummary?.page_view || 0;
  const monthSearches = summary?.monthSummary?.search_request || 0;
  const monthAiUsage = summary?.monthSummary?.ai_usage || 0;

  const totalWeekRequests = weekApiCalls + weekCacheHits;
  const weekCacheRate = totalWeekRequests > 0 ? ((weekCacheHits / totalWeekRequests) * 100).toFixed(1) : "0";

  const totalMonthRequests = monthApiCalls + monthCacheHits;
  const monthCacheRate = totalMonthRequests > 0 ? ((monthCacheHits / totalMonthRequests) * 100).toFixed(1) : "0";

  const cacheStats = summary?.cacheStats;
  const costEstimate = summary?.costEstimate;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Métricas de Uso</h1>
            <p className="text-muted-foreground">
              Monitoramento de recursos e estimativa de custos
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Cost Estimate Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Estimativa de Custo (últimos 30 dias)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Nuvem (Compute)</p>
                        <p className="text-3xl font-bold text-green-500">
                          ${costEstimate?.cloud?.toFixed(4) || "0.0000"}
                        </p>
                      </div>
                      <Cpu className="w-10 h-10 text-green-500/30" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      CPU + Memória por requisição
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">IA (LLM)</p>
                        <p className="text-3xl font-bold text-purple-500">
                          ${costEstimate?.ai?.toFixed(4) || "0.0000"}
                        </p>
                      </div>
                      <Brain className="w-10 h-10 text-purple-500/30" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {monthAiUsage} chamadas × ~$0.003/chamada
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Estimado</p>
                        <p className="text-3xl font-bold text-cyan-500">
                          ${costEstimate?.total?.toFixed(4) || "0.0000"}
                        </p>
                      </div>
                      <DollarSign className="w-10 h-10 text-cyan-500/30" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Limite gratuito: $10 Nuvem + $1 IA/mês
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cache Performance */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-500" />
                Performance do Cache TMDB
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cache Hit Rate (7d)</p>
                        <p className="text-3xl font-bold text-foreground">{weekCacheRate}%</p>
                      </div>
                      {Number(weekCacheRate) > 50 ? (
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {weekCacheHits} hits / {totalWeekRequests} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cache Hit Rate (30d)</p>
                        <p className="text-3xl font-bold text-foreground">{monthCacheRate}%</p>
                      </div>
                      {Number(monthCacheRate) > 50 ? (
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {monthCacheHits} hits / {totalMonthRequests} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Entradas no Cache</p>
                        <p className="text-3xl font-bold text-foreground">
                          {cacheStats?.active || 0}
                        </p>
                      </div>
                      <HardDrive className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {cacheStats?.expired || 0} expiradas / {cacheStats?.total || 0} total (max 500)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Chamadas TMDB Evitadas</p>
                        <p className="text-3xl font-bold text-green-500">
                          {monthCacheHits}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Economia de ~${((monthCacheHits * 0.1 * 0.000016)).toFixed(4)} em CPU
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Usage Stats - Week */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Uso dos Últimos 7 Dias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Page Views</p>
                        <p className="text-xl font-bold text-foreground">{weekPageViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Activity className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">API TMDB</p>
                        <p className="text-xl font-bold text-foreground">{weekApiCalls.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Database className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cache Hits</p>
                        <p className="text-xl font-bold text-foreground">{weekCacheHits.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <Search className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Buscas</p>
                        <p className="text-xl font-bold text-foreground">{weekSearches.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Brain className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IA (LLM)</p>
                        <p className="text-xl font-bold text-foreground">{weekAiUsage.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Usage Stats - Month */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Uso dos Últimos 30 Dias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Page Views</p>
                        <p className="text-xl font-bold text-foreground">{monthPageViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Activity className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">API TMDB</p>
                        <p className="text-xl font-bold text-foreground">{monthApiCalls.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Database className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cache Hits</p>
                        <p className="text-xl font-bold text-foreground">{monthCacheHits.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <Search className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Buscas</p>
                        <p className="text-xl font-bold text-foreground">{monthSearches.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Brain className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IA (LLM)</p>
                        <p className="text-xl font-bold text-foreground">{monthAiUsage.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Explanation Section */}
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-base">Como funciona o custo no Autoscale</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  No modelo <Badge variant="outline">Autoscale</Badge>, você paga por tempo de CPU e memória consumidos por cada requisição. 
                  Quando não há tráfego, o custo é zero (instância escala para 0).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-foreground mb-1">O que gera custo:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Cada page view acorda o servidor (~0.05s CPU)</li>
                      <li>Cada chamada TMDB que não está em cache (~0.1s CPU)</li>
                      <li>Cada uso da IA/LLM (~2s CPU + custo por token)</li>
                      <li>Bots do Google/Facebook rastreando o site</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-foreground mb-1">O que reduz custo:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Cache TMDB (evita chamadas repetidas à API)</li>
                      <li>robots.txt bloqueando crawlers desnecessários</li>
                      <li>IA restrita a usuários logados</li>
                      <li>Sitemap com cache de 24h</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs mt-4 text-muted-foreground/70">
                  * Estimativas baseadas em: $0.000016/vCPU-segundo + $0.0000018/GiB-segundo. 
                  Valores reais podem variar. O saldo gratuito é reiniciado mensalmente.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
