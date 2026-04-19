import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Bell, List, TrendingUp, CheckCircle, BarChart3, Smartphone, ChevronRight } from "lucide-react";
import { getLoginUrl } from "@/const";

const PHONE_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/dVPxUTQUbCSVnCSG.webp";
const LOGOS_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/GvxmStaUjHgSykOL.jpeg";
const COZY_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029229201/CJlpFDHPtMLbFYvE.jpeg";

/**
 * Platform info sections shown below the carousel for non-logged users:
 * Streaming coverage, features, how it works, benefits, and CTA.
 */
export function PlatformInfoSections() {
  return (
    <>
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

      {/* Features Section */}
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
              <h3 className="text-2xl font-bold text-foreground mb-3">Busca Inteligente</h3>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Alertas Automáticos</h3>
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
                <h3 className="text-xl font-semibold text-foreground mb-2">Listas Personalizadas</h3>
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
                <h3 className="text-xl font-semibold text-foreground mb-2">Recomendações IA</h3>
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
                <h3 className="text-xl font-semibold text-foreground mb-2">Análise de Streamings</h3>
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
                <h3 className="text-xl font-semibold text-foreground mb-2">Histórico Completo</h3>
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
                <h3 className="text-xl font-semibold text-foreground mb-2">App Instalável</h3>
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como funciona?</h2>
              <p className="text-lg text-muted-foreground">Simples, rápido e totalmente gratuito</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Faça login</h3>
                <p className="text-muted-foreground">
                  Crie sua conta gratuitamente em segundos. Sem complicação, sem cartão de crédito.
                </p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
              </div>

              <div className="text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Configure seus streamings</h3>
                <p className="text-muted-foreground">
                  Selecione quais serviços você assina para receber recomendações personalizadas.
                </p>
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
              </div>

              <div className="text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Comece a descobrir</h3>
                <p className="text-muted-foreground">
                  Busque, organize em listas, receba alertas e aproveite tudo que seus streamings oferecem!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Por que usar o Onde Assistir?
              </h2>
              <div className="space-y-5">
                {[
                  { title: "100% Gratuito", desc: "Todos os recursos, sem custos escondidos, para sempre." },
                  { title: "Dados do Brasil", desc: "Informações precisas sobre disponibilidade nos streamings brasileiros." },
                  { title: "Sempre Atualizado", desc: "Catálogos verificados regularmente para garantir informações corretas." },
                  { title: "Sem Anúncios Invasivos", desc: "Experiência limpa e focada no que importa: encontrar o que assistir." },
                  { title: "Multiplataforma", desc: "Acesse de qualquer dispositivo: computador, tablet ou celular." },
                  { title: "Comunidade Brasileira", desc: "Reviews e avaliações de outros usuários brasileiros como você." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img src={COZY_IMG} alt="Noite de cinema em casa" className="w-full h-auto object-cover aspect-[4/3]" />
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
    </>
  );
}
