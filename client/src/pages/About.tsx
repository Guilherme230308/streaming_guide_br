import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Shield, Users, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container py-4">
          <Link href="/">
            <a className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              ← Voltar
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sobre o Onde Assistir
          </h1>
          <p className="text-xl text-muted-foreground">
            Entenda como coletamos e apresentamos informações sobre disponibilidade de filmes e séries nos streamings brasileiros.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              O <strong className="text-foreground">Onde Assistir</strong> foi criado para resolver um problema comum: descobrir em qual streaming brasileiro está disponível aquele filme ou série que você quer assistir.
            </p>
            <p>
              Com tantos serviços de streaming disponíveis (Netflix, Prime Video, Disney+, HBO Max, Paramount+, Apple TV+, e muitos outros), fica difícil saber onde encontrar o conteúdo desejado. Nossa plataforma centraliza essas informações em um só lugar, economizando seu tempo e facilitando suas escolhas.
            </p>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Fontes de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">The Movie Database (TMDB)</h3>
              <p className="mb-3">
                Utilizamos a API do <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  TMDB <ExternalLink className="h-3 w-3" />
                </a>, uma das maiores bases de dados de filmes e séries do mundo, mantida por uma comunidade global de colaboradores.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Metadados de conteúdo</Badge>
                <Badge variant="secondary">Disponibilidade nos streamings</Badge>
                <Badge variant="secondary">Avaliações e reviews</Badge>
                <Badge variant="secondary">Imagens e trailers</Badge>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Dados Específicos do Brasil</h3>
              <p>
                Todas as informações de disponibilidade são filtradas especificamente para o mercado brasileiro (região BR), garantindo que você veja apenas os streamings e conteúdos acessíveis no Brasil.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Metodologia de Coleta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Atualização de Dados</h3>
              <p>
                Os dados são consultados em tempo real através da API do TMDB sempre que você faz uma busca ou acessa uma página de detalhes. Isso garante que você tenha acesso às informações mais recentes disponíveis.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Sistema de Alertas</h3>
              <p>
                Nosso sistema de alertas verifica periodicamente a disponibilidade de conteúdo que você marcou para acompanhar. Quando um filme ou série chega em um dos seus streamings cadastrados, você recebe uma notificação automática.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Recomendações Personalizadas</h3>
              <p>
                As recomendações são geradas com base no seu histórico de visualização, avaliações e preferências de gênero. Utilizamos algoritmos que analisam padrões de similaridade entre conteúdos para sugerir filmes e séries que você provavelmente vai gostar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Importante: Precisão dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              <strong className="text-foreground">Fazemos o melhor esforço para manter as informações precisas e atualizadas</strong>, mas é importante entender algumas limitações:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-foreground">Catálogos mudam constantemente:</strong> Os serviços de streaming adicionam e removem conteúdo regularmente. Pode haver um pequeno atraso entre a mudança real e a atualização nos nossos dados.
              </li>
              <li>
                <strong className="text-foreground">Dependência de fontes externas:</strong> Nossos dados vêm do TMDB, que por sua vez depende de contribuições da comunidade e parcerias com os streamings. Ocasionalmente podem ocorrer imprecisões.
              </li>
              <li>
                <strong className="text-foreground">Variações regionais:</strong> Alguns conteúdos podem estar disponíveis apenas em determinadas regiões do Brasil ou ter restrições específicas não capturadas pelos dados.
              </li>
              <li>
                <strong className="text-foreground">Conteúdo temporário:</strong> Filmes e séries podem estar disponíveis por tempo limitado (especialmente aluguel/compra), e essas datas nem sempre são precisas.
              </li>
            </ul>

            <div className="border-t border-yellow-500/30 pt-4 mt-4">
              <p className="text-sm">
                <strong className="text-foreground">Recomendação:</strong> Sempre confirme a disponibilidade diretamente no aplicativo ou site do streaming antes de assinar um serviço especificamente para assistir determinado conteúdo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              Levamos sua privacidade a sério. Coletamos apenas as informações necessárias para fornecer nossos serviços:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Informações de perfil básicas (nome, email) via OAuth do Manus</li>
              <li>Suas preferências de streamings e listas personalizadas</li>
              <li>Histórico de visualização e avaliações (apenas para recomendações)</li>
              <li>Alertas configurados</li>
            </ul>

            <p>
              <strong className="text-foreground">Não compartilhamos seus dados pessoais com terceiros</strong> e você pode excluir sua conta a qualquer momento, removendo permanentemente todas as suas informações.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Dúvidas ou Sugestões?
          </h2>
          <p className="text-muted-foreground mb-6">
            Estamos sempre trabalhando para melhorar o Onde Assistir. Se você encontrou algum problema ou tem sugestões de novos recursos, adoraríamos ouvir!
          </p>
          <Link href="/">
            <a className="text-primary hover:underline font-medium">
              Voltar para a página inicial →
            </a>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © 2026 Onde Assistir. Dados fornecidos por{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              The Movie Database (TMDB)
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
