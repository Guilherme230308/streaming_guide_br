import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Film, Search, Bell, List, TrendingUp, CheckCircle, Sparkles, Clock, ChevronRight, BarChart3, Smartphone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { SEO, buildWebSiteJsonLd } from "@/components/SEO";

const HERO_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/cgGBWpLKRuMgKbls.jpg";
const PHONE_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/dVPxUTQUbCSVnCSG.webp";
const LOGOS_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/GvxmStaUjHgSykOL.jpeg";
const COZY_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/CJlpFDHPtMLbFYvE.jpeg";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = trpc.content.searchWithFilters.useQuery(
    { query: searchQuery, page: 1 },
    { enabled: searchQuery.length >= 2 }
  );

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = (suggestions?.results || []) as any[];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const item = items[selectedIndex];
        // Determine type: if it has 'name' field it's a TV show, otherwise movie
        const type = "name" in item ? "tv" : "movie";
        setLocation(`/${type}/${item.id}`);
        setShowSuggestions(false);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const allSuggestions = (suggestions?.results || []) as any[];

  return (
    <div className="min-h-screen bg-background pt-16">
      <SEO
        title="Filmes e Séries nos Streamings do Brasil"
        description="Descubra onde assistir filmes e séries no Brasil. Compare preços de Netflix, Prime Video, Disney+, HBO Max e Globoplay. Grátis!"
        keywords="onde assistir, streaming brasil, filmes online, séries online, netflix brasil, prime video, disney plus, hbo max, globoplay, comparar streaming, preços streaming, onde ver filmes"
        url="/"
        jsonLd={buildWebSiteJsonLd()}
      />
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img 
            src={HERO_IMG} 
            alt="Família assistindo filme" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Grátis para sempre</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Descubra onde assistir <span className="text-primary">qualquer filme ou série</span> no Brasil
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Encontre em qual streaming está disponível, compare preços, receba alertas e organize tudo em listas personalizadas.
            </p>
            
            {/* Search Bar */}
            <div ref={searchRef} className="relative max-w-xl mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar filmes e séries..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      setSelectedIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-12 text-base bg-background/70 backdrop-blur-sm border-border/50"
                  />
                </div>
                <Button size="lg" className="h-12 px-6" onClick={handleSearch}>
                  Buscar
                </Button>
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && searchQuery.length >= 2 && allSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                  {allSuggestions.slice(0, 6).map((item: any, index: number) => {
                    const type = item.media_type === "tv" ? "tv" : "movie";
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date || "").slice(0, 4);
                    const posterUrl = item.poster_path
                      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                      : null;
                    return (
                      <button
                        key={`${type}-${item.id}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors ${
                          index === selectedIndex ? "bg-accent/50" : ""
                        }`}
                        onClick={() => {
                          setLocation(`/${type}/${item.id}`);
                          setShowSuggestions(false);
                        }}
                      >
                        {posterUrl ? (
                          <img src={posterUrl} alt={title} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-muted/30 rounded flex items-center justify-center">
                            <Film className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.media_type === "tv" ? "Série" : "Filme"}
                            {year ? ` • ${year}` : ""}
                            {item.vote_average ? ` • ⭐ ${item.vote_average.toFixed(1)}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    className="w-full px-4 py-3 text-sm text-primary hover:bg-accent/50 text-left font-medium border-t border-border/50"
                    onClick={handleSearch}
                  >
                    Ver todos os resultados para "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Começar Gratuitamente
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-background/50 backdrop-blur-sm"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Recursos
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Sem cartão de crédito • Cadastro em 30 segundos
            </p>
          </div>
        </div>
      </section>

      {/* Streaming Logos Section */}
      <section className="container py-12 border-b border-border/20">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">
            Cobertura completa dos principais streamings do Brasil
          </p>
          <div className="relative rounded-2xl overflow-hidden">
            <img 
              src={LOGOS_IMG} 
              alt="Logos dos streamings - Netflix, Prime Video, Disney+, HBO Max, Apple TV+" 
              className="w-full h-auto object-contain max-h-48 mx-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>
        </div>
      </section>

      {/* Features Section with Image */}
      <section id="features" className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pare de perder tempo procurando onde assistir. Tenha todas as informações na palma da sua mão.
            </p>
          </div>

          {/* Feature 1: Search - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={PHONE_IMG} 
                alt="Pessoa usando app de streaming no tablet" 
                className="w-full h-auto object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>
            <div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Busca Inteligente
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                Encontre qualquer filme ou série com autocomplete em tempo real. Veja instantaneamente em quais streamings está disponível no Brasil.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  Autocomplete com resultados instantâneos
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  Filtros por gênero, ano e streaming
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  Deep links diretos para cada plataforma
                </li>
              </ul>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Alertas Automáticos
                </h3>
                <p className="text-muted-foreground">
                  Receba notificações push quando filmes e séries chegarem nos seus streamings. Nunca mais perca um lançamento!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <List className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Listas Personalizadas
                </h3>
                <p className="text-muted-foreground">
                  Crie quantas listas quiser: filmes para assistir, favoritos, recomendações para amigos. Organize do seu jeito!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Recomendações IA
                </h3>
                <p className="text-muted-foreground">
                  Descubra novos filmes e séries baseados no que você já assistiu. Quanto mais usa, melhores as sugestões!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Análise de Streamings
                </h3>
                <p className="text-muted-foreground">
                  Descubra qual streaming vale mais a pena para você com base no seu histórico e preferências.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Histórico Completo
                </h3>
                <p className="text-muted-foreground">
                  Marque o que já assistiu, avalie e escreva reviews. Acompanhe sua jornada cinematográfica completa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  App Instalável
                </h3>
                <p className="text-muted-foreground">
                  Instale como app no seu celular com acesso offline. Funciona como um app nativo, direto do navegador.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-card/50" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Como funciona?
              </h2>
              <p className="text-lg text-muted-foreground">
                Simples, rápido e totalmente gratuito
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Faça login
                </h3>
                <p className="text-muted-foreground">
                  Crie sua conta gratuitamente em segundos. Sem complicação, sem cartão de crédito.
                </p>
                {/* Connector line */}
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
              </div>

              <div className="text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Configure seus streamings
                </h3>
                <p className="text-muted-foreground">
                  Selecione quais serviços você assina para receber recomendações personalizadas.
                </p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
              </div>

              <div className="text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Comece a descobrir
                </h3>
                <p className="text-muted-foreground">
                  Busque, organize em listas, receba alertas e aproveite tudo que seus streamings oferecem!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section with Image */}
      <section className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Por que usar o Onde Assistir?
              </h2>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">100% Gratuito</h3>
                    <p className="text-muted-foreground">Todos os recursos, sem custos escondidos, para sempre.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Dados do Brasil</h3>
                    <p className="text-muted-foreground">Informações precisas sobre disponibilidade nos streamings brasileiros.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sempre Atualizado</h3>
                    <p className="text-muted-foreground">Catálogos verificados regularmente para garantir informações corretas.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sem Anúncios Invasivos</h3>
                    <p className="text-muted-foreground">Experiência limpa e focada no que importa: encontrar o que assistir.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Multiplataforma</h3>
                    <p className="text-muted-foreground">Acesse de qualquer dispositivo: computador, tablet ou celular.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Comunidade Brasileira</h3>
                    <p className="text-muted-foreground">Reviews e avaliações de outros usuários brasileiros como você.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={COZY_IMG} 
                alt="Noite de cinema em casa" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Pronto para descobrir onde assistir?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de brasileiros que já estão aproveitando melhor seus streamings
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 py-6"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Criar Conta Grátis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Leva menos de 30 segundos • Não precisa de cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Onde Assistir</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Onde Assistir. Encontre onde assistir seus filmes e séries favoritos no Brasil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
