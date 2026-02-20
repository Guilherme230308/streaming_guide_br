import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  MousePointerClick,
  DollarSign,
  ArrowLeft,
  Film,
  BarChart3,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  ShoppingCart,
  Play,
  Eye,
  CalendarDays,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useEffect, useRef, useState, useMemo } from "react";

type Period = '7d' | '30d' | '90d' | 'all';

// Chart.js lazy loader
function useChart(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: any,
  deps: any[]
) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !config) return;

    let mounted = true;

    import('chart.js/auto').then((mod) => {
      if (!mounted || !canvasRef.current) return;
      const Chart = mod.default;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new Chart(canvasRef.current, config);
    });

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, deps);
}

function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  accentColor = 'text-primary'
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${accentColor}`}>{value}</span>
              {trend && (
                <span className={`flex items-center text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
                }`}>
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
                   trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : 
                   <Minus className="h-3 w-3" />}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl bg-primary/10 ${accentColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AffiliateAnalytics() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<Period>('30d');
  
  const clicksChartRef = useRef<HTMLCanvasElement>(null);
  const providerChartRef = useRef<HTMLCanvasElement>(null);
  const typeChartRef = useRef<HTMLCanvasElement>(null);
  const hourlyChartRef = useRef<HTMLCanvasElement>(null);

  const { data: stats, isLoading } = trpc.affiliate.getRevenueDashboard.useQuery(
    { period },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Clicks over time chart
  const clicksChartConfig = useMemo(() => {
    if (!stats?.clicksByDate?.length) return null;
    return {
      type: 'line' as const,
      data: {
        labels: stats.clicksByDate.map(d => {
          const date = new Date(d.date + 'T12:00:00');
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }),
        datasets: [
          {
            label: 'Cliques',
            data: stats.clicksByDate.map(d => d.count),
            borderColor: '#2dd4bf',
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: 'Receita Est. (R$)',
            data: stats.clicksByDate.map(d => d.estimatedRevenue),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            borderWidth: 2,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' as const },
        plugins: {
          legend: { 
            display: true,
            labels: { color: '#94a3b8', font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
          },
        },
        scales: {
          x: { 
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b', maxTicksLimit: 10 }
          },
          y: { 
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b' },
            beginAtZero: true,
          },
          y1: {
            position: 'right' as const,
            grid: { drawOnChartArea: false },
            ticks: { 
              color: '#f59e0b',
              callback: (value: any) => `R$${value}`
            },
            beginAtZero: true,
          },
        },
      },
    };
  }, [stats?.clicksByDate]);

  useChart(clicksChartRef, clicksChartConfig, [clicksChartConfig]);

  // Provider chart (horizontal bar)
  const providerChartConfig = useMemo(() => {
    if (!stats?.clicksByProvider?.length) return null;
    const top8 = stats.clicksByProvider.slice(0, 8);
    return {
      type: 'bar' as const,
      data: {
        labels: top8.map(p => p.providerName),
        datasets: [{
          label: 'Cliques',
          data: top8.map(p => p.count),
          backgroundColor: top8.map(p => 
            p.isAmazon ? 'rgba(245, 158, 11, 0.8)' : 'rgba(45, 212, 191, 0.6)'
          ),
          borderColor: top8.map(p => 
            p.isAmazon ? '#f59e0b' : '#2dd4bf'
          ),
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            callbacks: {
              afterLabel: (context: any) => {
                const provider = top8[context.dataIndex];
                if (provider.isAmazon && provider.estimatedRevenue > 0) {
                  return `Receita est.: R$${provider.estimatedRevenue.toFixed(2)}`;
                }
                return '';
              }
            }
          },
        },
        scales: {
          x: { 
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b' },
            beginAtZero: true,
          },
          y: { 
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } },
          },
        },
      },
    };
  }, [stats?.clicksByProvider]);

  useChart(providerChartRef, providerChartConfig, [providerChartConfig]);

  // Click type donut chart
  const typeChartConfig = useMemo(() => {
    if (!stats?.clicksByType?.length) return null;
    const typeLabels: Record<string, string> = {
      stream: 'Streaming',
      rent: 'Aluguel',
      buy: 'Compra',
    };
    const colors = ['#2dd4bf', '#f59e0b', '#8b5cf6'];
    return {
      type: 'doughnut' as const,
      data: {
        labels: stats.clicksByType.map(t => typeLabels[t.clickType] || t.clickType),
        datasets: [{
          data: stats.clicksByType.map(t => t.count),
          backgroundColor: stats.clicksByType.map((_, i) => colors[i % colors.length]),
          borderColor: '#0f172a',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: { color: '#94a3b8', padding: 16, font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
          },
        },
      },
    };
  }, [stats?.clicksByType]);

  useChart(typeChartRef, typeChartConfig, [typeChartConfig]);

  // Hourly distribution chart
  const hourlyChartConfig = useMemo(() => {
    if (!stats?.clicksByHour?.length) return null;
    return {
      type: 'bar' as const,
      data: {
        labels: stats.clicksByHour.map(h => `${h.hour.toString().padStart(2, '0')}h`),
        datasets: [{
          label: 'Cliques',
          data: stats.clicksByHour.map(h => h.count),
          backgroundColor: 'rgba(45, 212, 191, 0.5)',
          borderColor: '#2dd4bf',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
          },
        },
        scales: {
          x: { 
            grid: { display: false },
            ticks: { color: '#64748b', maxTicksLimit: 12 },
          },
          y: { 
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b' },
            beginAtZero: true,
          },
        },
      },
    };
  }, [stats?.clicksByHour]);

  useChart(hourlyChartRef, hourlyChartConfig, [hourlyChartConfig]);

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
          <BarChart3 className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard de receita...</p>
        </div>
      </div>
    );
  }

  const amazonRevenue = stats?.clicksByProvider
    ?.filter(p => p.isAmazon)
    ?.reduce((sum, p) => sum + p.estimatedRevenue, 0) || 0;

  const amazonClicks = stats?.clicksByProvider
    ?.filter(p => p.isAmazon)
    ?.reduce((sum, p) => sum + p.count, 0) || 0;

  const platformTotal = (stats?.platformStats?.mobile || 0) + 
    (stats?.platformStats?.desktop || 0) + 
    (stats?.platformStats?.pwa || 0) + 
    (stats?.platformStats?.other || 0);

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

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Page Title & Period Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Dashboard de Receita
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão unificada de afiliados Amazon e AdSense
            </p>
          </div>

          <div className="flex gap-2 bg-secondary/50 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className={period === p ? 'bg-primary text-primary-foreground' : ''}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : 'Tudo'}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total de Cliques"
            value={stats?.totalClicks?.toLocaleString('pt-BR') || '0'}
            subtitle={`${stats?.totalClicksToday || 0} hoje`}
            icon={MousePointerClick}
            trend={stats?.totalClicksToday && stats.totalClicksToday > 0 ? 'up' : 'neutral'}
          />
          <KPICard
            title="Receita Estimada"
            value={`R$${(stats?.estimatedRevenue || 0).toFixed(2)}`}
            subtitle="Baseado em comissões Amazon"
            icon={DollarSign}
            accentColor="text-amber-400"
            trend={stats?.estimatedRevenue && stats.estimatedRevenue > 0 ? 'up' : 'neutral'}
          />
          <KPICard
            title="Cliques Amazon"
            value={amazonClicks.toLocaleString('pt-BR')}
            subtitle={`R$${amazonRevenue.toFixed(2)} em comissões est.`}
            icon={ShoppingCart}
            accentColor="text-amber-400"
          />
          <KPICard
            title="Cliques Semana"
            value={stats?.totalClicksThisWeek?.toLocaleString('pt-BR') || '0'}
            subtitle={`${stats?.totalClicksThisMonth || 0} no mês`}
            icon={TrendingUp}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Clicks Over Time - Large */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-primary" />
                Cliques e Receita ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '320px' }}>
                {stats?.clicksByDate && stats.clicksByDate.length > 0 ? (
                  <canvas ref={clicksChartRef} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum dado no período selecionado</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Click Type Donut */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="h-5 w-5 text-primary" />
                Tipo de Clique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '280px' }}>
                {stats?.clicksByType && stats.clicksByType.length > 0 ? (
                  <canvas ref={typeChartRef} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Sem dados</p>
                  </div>
                )}
              </div>
              {stats?.clicksByType && stats.clicksByType.length > 0 && (
                <div className="mt-4 space-y-2">
                  {stats.clicksByType.map((t) => (
                    <div key={t.clickType} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {t.clickType === 'stream' ? 'Streaming' : t.clickType === 'rent' ? 'Aluguel' : 'Compra'}
                      </span>
                      <span className="text-foreground font-medium">
                        R${t.estimatedRevenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Provider Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-primary" />
                Cliques por Provedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '320px' }}>
                {stats?.clicksByProvider && stats.clicksByProvider.length > 0 ? (
                  <canvas ref={providerChartRef} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Nenhum clique registrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Distribuição por Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '320px' }}>
                {stats?.clicksByHour && stats.clicksByHour.some(h => h.count > 0) ? (
                  <canvas ref={hourlyChartRef} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Sem dados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Top Content */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Conteúdo que Mais Gera Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topContent && stats.topContent.length > 0 ? (
                <div className="space-y-3">
                  {stats.topContent.slice(0, 10).map((item, index) => (
                    <div key={`${item.tmdbId}-${item.mediaType}`} className="flex items-center gap-4">
                      <span className="text-sm font-bold text-muted-foreground w-6 text-right">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/${item.mediaType}/${item.tmdbId}`}>
                          <span className="text-sm font-medium text-foreground hover:text-primary cursor-pointer truncate block">
                            {item.title}
                          </span>
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {item.mediaType === 'movie' ? 'Filme' : 'Série'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{item.clicks}</span>
                        <span className="text-xs text-muted-foreground ml-1">cliques</span>
                      </div>
                      {item.estimatedRevenue > 0 && (
                        <Badge variant="secondary" className="text-amber-400 bg-amber-400/10">
                          R${item.estimatedRevenue.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum conteúdo com cliques registrados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Platform Stats + AdSense Info */}
          <div className="space-y-6">
            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5 text-primary" />
                  Plataformas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platformTotal > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-foreground">Desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(stats?.platformStats?.desktop || 0) / platformTotal * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((stats?.platformStats?.desktop || 0) / platformTotal * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-foreground">Mobile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(stats?.platformStats?.mobile || 0) / platformTotal * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((stats?.platformStats?.mobile || 0) / platformTotal * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-foreground">PWA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(stats?.platformStats?.pwa || 0) / platformTotal * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((stats?.platformStats?.pwa || 0) / platformTotal * 100)}%
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados de plataforma</p>
                )}
              </CardContent>
            </Card>

            {/* AdSense Status Card */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Megaphone className="h-5 w-5 text-amber-400" />
                  Google AdSense
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    import.meta.env.VITE_ADSENSE_PUBLISHER_ID ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-sm text-foreground">
                    {import.meta.env.VITE_ADSENSE_PUBLISHER_ID ? 'Configurado' : 'Pendente configuração'}
                  </span>
                </div>
                
                {!import.meta.env.VITE_ADSENSE_PUBLISHER_ID ? (
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p>Para ativar o AdSense:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Crie conta em <span className="text-amber-400">adsense.google.com</span></li>
                      <li>Cadastre o domínio do app</li>
                      <li>Configure o Publisher ID nas variáveis de ambiente</li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    <p>Publisher ID configurado. Os anúncios estão sendo exibidos nas páginas de busca, detalhes de filmes/séries e home.</p>
                    <p className="mt-2">A receita do AdSense pode ser acompanhada diretamente no painel do Google AdSense.</p>
                  </div>
                )}

                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Posições de anúncio ativas:</strong>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Busca', 'Filmes', 'Séries', 'Home'].map(pos => (
                      <Badge key={pos} variant="secondary" className="text-xs">
                        {pos}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue Breakdown Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-amber-500/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-400" />
              Como a Receita é Calculada
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">Amazon Associates</p>
                <p className="text-muted-foreground">
                  Comissão de 4% em assinaturas Prime Video (R$14.90/mês) e 2.5% em aluguéis/compras. 
                  Taxa de conversão estimada: 3-5% dos cliques.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Google AdSense</p>
                <p className="text-muted-foreground">
                  Receita por impressão (CPM) e clique (CPC). Valores variam conforme tráfego e região. 
                  Acompanhe no painel do AdSense.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Nota Importante</p>
                <p className="text-muted-foreground">
                  Os valores de receita são <strong className="text-amber-400">estimativas</strong> baseadas em taxas médias. 
                  A receita real depende das conversões confirmadas pelo Amazon Associates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
