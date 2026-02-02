import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Search, Bell, List, TrendingUp, CheckCircle, Sparkles, Clock } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Onde Assistir</span>
            </div>
            <Button onClick={() => (window.location.href = getLoginUrl())}>
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Encontre onde assistir seus filmes e séries favoritos</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Descubra onde assistir <span className="text-primary">qualquer filme ou série</span> no Brasil
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encontre em qual streaming está disponível, compare preços, receba alertas quando chegar nos seus serviços e organize tudo em listas personalizadas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Começar Gratuitamente
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Recursos
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Grátis para sempre • Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pare de perder tempo procurando onde assistir. Tenha todas as informações na palma da sua mão.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Busca Inteligente
                </h3>
                <p className="text-muted-foreground">
                  Encontre qualquer filme ou série com autocomplete em tempo real. Veja instantaneamente em quais streamings está disponível no Brasil.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Alertas Automáticos
                </h3>
                <p className="text-muted-foreground">
                  Receba notificações quando filmes e séries chegarem nos seus streamings favoritos. Nunca mais perca um lançamento!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
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

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Recomendações Personalizadas
                </h3>
                <p className="text-muted-foreground">
                  Descubra novos filmes e séries baseados no que você já assistiu. Quanto mais você usa, melhores as sugestões!
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Histórico de Visualização
                </h3>
                <p className="text-muted-foreground">
                  Marque o que já assistiu, avalie e escreva reviews. Acompanhe sua jornada cinematográfica completa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Em Breve
                </h3>
                <p className="text-muted-foreground">
                  Fique por dentro dos próximos lançamentos nos streamings brasileiros. Planeje o que assistir com antecedência.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-20">
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
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Faça login
              </h3>
              <p className="text-muted-foreground">
                Crie sua conta gratuitamente em segundos. Sem complicação, sem cartão de crédito.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Configure seus streamings
              </h3>
              <p className="text-muted-foreground">
                Selecione quais serviços de streaming você assina para receber recomendações personalizadas.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Comece a descobrir
              </h3>
              <p className="text-muted-foreground">
                Busque, organize em listas, receba alertas e aproveite tudo que seus streamings têm a oferecer!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que usar o Onde Assistir?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">100% Gratuito</h3>
                <p className="text-muted-foreground">Todos os recursos, sem custos escondidos, para sempre.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dados do Brasil</h3>
                <p className="text-muted-foreground">Informações precisas sobre disponibilidade nos streamings brasileiros.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sempre Atualizado</h3>
                <p className="text-muted-foreground">Catálogos verificados regularmente para garantir informações corretas.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sem Anúncios Invasivos</h3>
                <p className="text-muted-foreground">Experiência limpa e focada no que importa: encontrar o que assistir.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Multiplataforma</h3>
                <p className="text-muted-foreground">Acesse de qualquer dispositivo: computador, tablet ou celular.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Comunidade Brasileira</h3>
                <p className="text-muted-foreground">Reviews e avaliações de outros usuários brasileiros como você.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container py-20">
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
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Leva menos de 30 segundos • Não precisa de cartão de crédito
          </p>
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
