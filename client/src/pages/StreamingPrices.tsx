import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";

interface StreamingService {
  name: string;
  logo: string;
  plans: {
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
  }[];
  website: string;
  color: string;
}

const STREAMING_SERVICES: StreamingService[] = [
  {
    name: "Netflix",
    logo: "🎬",
    color: "from-red-800 to-red-900",
    website: "https://www.netflix.com/br/",
    plans: [
      {
        name: "Padrão com anúncios",
        price: 18.90,
        features: ["HD (720p)", "2 dispositivos simultâneos", "Anúncios"]
      },
      {
        name: "Padrão",
        price: 44.90,
        features: ["Full HD (1080p)", "2 dispositivos simultâneos", "Sem anúncios"],
        popular: true
      },
      {
        name: "Premium",
        price: 59.90,
        features: ["4K + HDR", "4 dispositivos simultâneos", "Sem anúncios"]
      }
    ]
  },
  {
    name: "Prime Video",
    logo: "📦",
    color: "from-blue-800 to-blue-900",
    website: "https://www.primevideo.com/",
    plans: [
      {
        name: "Prime Video",
        price: 14.90,
        features: ["4K + HDR", "3 dispositivos simultâneos", "Incluso no Amazon Prime"],
        popular: true
      }
    ]
  },
  {
    name: "Disney+",
    logo: "🏰",
    color: "from-blue-700 to-indigo-800",
    website: "https://www.disneyplus.com/pt-br",
    plans: [
      {
        name: "Padrão",
        price: 33.90,
        features: ["4K + HDR", "4 dispositivos simultâneos", "Disney, Pixar, Marvel, Star Wars"],
        popular: true
      }
    ]
  },
  {
    name: "HBO Max",
    logo: "🎭",
    color: "from-purple-800 to-purple-900",
    website: "https://www.max.com/br/pt",
    plans: [
      {
        name: "Mensal",
        price: 34.90,
        features: ["4K + HDR", "3 dispositivos simultâneos", "HBO, Warner, DC"],
        popular: true
      }
    ]
  },
  {
    name: "Paramount+",
    logo: "⛰️",
    color: "from-blue-800 to-blue-900",
    website: "https://www.paramountplus.com/br/",
    plans: [
      {
        name: "Essencial",
        price: 19.90,
        features: ["Full HD", "2 dispositivos simultâneos", "Paramount, MTV, Nickelodeon"],
        popular: true
      }
    ]
  },
  {
    name: "Apple TV+",
    logo: "🍎",
    color: "from-gray-800 to-gray-900",
    website: "https://tv.apple.com/br",
    plans: [
      {
        name: "Mensal",
        price: 21.90,
        features: ["4K + HDR", "6 dispositivos simultâneos", "Originais Apple"],
        popular: true
      }
    ]
  },
  {
    name: "Globoplay",
    logo: "🌐",
    color: "from-orange-800 to-red-900",
    website: "https://globoplay.globo.com/",
    plans: [
      {
        name: "Básico",
        price: 27.90,
        features: ["HD", "2 dispositivos simultâneos", "Novelas, séries, filmes"]
      },
      {
        name: "Globoplay + Canais",
        price: 54.90,
        features: ["HD", "3 dispositivos simultâneos", "+ Canais ao vivo"],
        popular: true
      }
    ]
  },
  {
    name: "Star+",
    logo: "⭐",
    color: "from-purple-700 to-pink-800",
    website: "https://www.starplus.com/pt-br",
    plans: [
      {
        name: "Mensal",
        price: 32.90,
        features: ["4K", "4 dispositivos simultâneos", "ESPN, FX, séries adultas"],
        popular: true
      }
    ]
  }
];

export default function StreamingPrices() {
  const allPlans = STREAMING_SERVICES.flatMap(service => 
    service.plans.map(plan => ({
      ...plan,
      serviceName: service.name,
      serviceLogo: service.logo,
      serviceColor: service.color
    }))
  ).sort((a, b) => a.price - b.price);

  const cheapestPlan = allPlans[0];
  const averagePrice = allPlans.reduce((sum, plan) => sum + plan.price, 0) / allPlans.length;

  return (
    <div className="min-h-screen bg-background pt-16">
      <SEO
        title="Preços de Streaming no Brasil 2026"
        description="Compare preços de todos os serviços de streaming no Brasil: Netflix, Prime Video, Disney+, HBO Max, Globoplay, Star+, Paramount+ e mais. Atualizado em 2026."
        url="/streaming-prices"
      />
      <div className="container py-12">
        {/* Hero Section */}
        <div className="mb-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comparação de Preços dos Streamings
          </h1>
          <p className="text-xl text-muted-foreground">
            Compare os valores mensais dos principais serviços de streaming disponíveis no Brasil e escolha o melhor custo-benefício para você.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Mais Barato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                R$ {cheapestPlan.price.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {cheapestPlan.serviceName} - {cheapestPlan.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Preço Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                R$ {averagePrice.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Média de {allPlans.length} planos disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                Última Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                Fev/2026
              </div>
              <p className="text-sm text-muted-foreground">
                Preços sujeitos a alteração
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {STREAMING_SERVICES.map((service) => (
            <Card key={service.name} className="overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${service.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{service.logo}</span>
                    <div>
                      <CardTitle className="text-white">{service.name}</CardTitle>
                      <CardDescription className="text-white/80">
                        {service.plans.length} {service.plans.length === 1 ? 'plano' : 'planos'} disponível
                        {service.plans.length !== 1 ? 'is' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <a 
                    href={service.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {service.plans.map((plan, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        plan.popular 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{plan.name}</h3>
                          {plan.popular && (
                            <Badge variant="default" className="mt-1">Mais Popular</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            R$ {plan.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">/mês</div>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ranking by Price */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking por Preço</CardTitle>
            <CardDescription>
              Todos os planos ordenados do mais barato ao mais caro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPlans.map((plan, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    <span className="text-2xl">{plan.serviceLogo}</span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {plan.serviceName} - {plan.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.features[0]}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      R$ {plan.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">/mês</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">Informações Importantes:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Os preços são referentes aos planos mensais e podem variar com promoções ou planos anuais</li>
                  <li>Alguns serviços oferecem períodos de teste gratuito para novos assinantes</li>
                  <li>Valores sujeitos a alteração sem aviso prévio pelos serviços de streaming</li>
                  <li>Sempre confirme o preço atual no site oficial antes de assinar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dicas para Economizar</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">1. Alterne entre serviços:</strong> Assine um streaming por alguns meses, assista o que te interessa, cancele e mude para outro.
            </p>
            <p>
              <strong className="text-foreground">2. Compartilhe legalmente:</strong> Muitos serviços permitem múltiplos perfis e dispositivos simultâneos. Divida a conta com família ou amigos.
            </p>
            <p>
              <strong className="text-foreground">3. Aproveite promoções:</strong> Black Friday, Cyber Monday e outras datas costumam ter descontos significativos em planos anuais.
            </p>
            <p>
              <strong className="text-foreground">4. Use nossos alertas:</strong> Configure alertas para ser notificado quando o conteúdo que você quer assistir chegar no seu streaming atual.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Onde Assistir. Preços atualizados em Fevereiro de 2026.</p>
        </div>
      </footer>
    </div>
  );
}
