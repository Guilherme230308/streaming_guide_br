import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  UserPlus,
  LogIn,
  Bookmark,
  Clock,
  Star,
  BellRing,
  ListChecks,
  BarChart3,
  History,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getLoginUrl } from "@/const";

const LOCKED_FEATURES = [
  {
    icon: Bookmark,
    title: "Salvar na Lista",
    description: "Salve filmes e séries para assistir depois",
  },
  {
    icon: Clock,
    title: "Marcar como Assistido",
    description: "Registre o que você já assistiu",
  },
  {
    icon: Star,
    title: "Avaliar Conteúdo",
    description: "Dê notas e escreva reviews",
  },
  {
    icon: ListChecks,
    title: "Listas Personalizadas",
    description: "Crie listas temáticas e compartilhe",
  },
  {
    icon: BellRing,
    title: "Alertas de Disponibilidade",
    description: "Saiba quando um título chegar ao streaming",
  },
  {
    icon: History,
    title: "Histórico & Recomendações",
    description: "Veja seu histórico e receba sugestões",
  },
  {
    icon: BarChart3,
    title: "Análise de Streamings",
    description: "Descubra qual streaming vale mais a pena",
  },
  {
    icon: MessageSquare,
    title: "Comunidade",
    description: "Participe de discussões e veja reviews",
  },
];

/**
 * Broad CTA section listing all premium features locked for non-authenticated users.
 * Designed to be placed on detail pages to encourage account creation.
 */
export function FeaturesCTA() {
  return (
    <div id="signup-cta" className="py-12 border-t border-border mt-6">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-background via-background to-cyan-950/10">
          <CardContent className="p-0">
            {/* Header */}
            <div className="px-6 pt-8 pb-6 text-center border-b border-border/30">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-4">
                <Sparkles className="h-8 w-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Desbloqueie todas as funcionalidades
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Crie uma conta gratuita e aproveite ao máximo o Stream Radar.
                Salve listas, avalie conteúdo, receba alertas e muito mais.
              </p>
            </div>

            {/* Features Grid */}
            <div className="px-6 py-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {LOCKED_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-cyan-500/10">
                      <feature.icon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        {feature.title}
                        <Lock className="h-3 w-3 text-muted-foreground/40" />
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="px-6 pb-8 pt-2">
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex-1 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-400/40 hover:scale-[1.02]"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar conta grátis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-border/60 hover:bg-muted/50"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Já tenho conta — Entrar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-4 text-center">
                100% gratuito. Leva menos de 30 segundos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Compact inline CTA for individual action buttons (e.g., "Adicionar à lista", "Marcar como assistido").
 * Shows a small prompt with lock icon and signup/login buttons.
 */
export function ActionLockedPrompt({
  actionLabel,
  actionIcon: ActionIcon,
  description,
}: {
  actionLabel: string;
  actionIcon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <div className="relative group">
      <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
        <div className="shrink-0 p-2 rounded-lg bg-muted/40">
          <ActionIcon className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            {actionLabel}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-sm shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-400/40 hover:scale-[1.02]"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Criar conta
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border/60 hover:bg-muted/50"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            <LogIn className="h-3.5 w-3.5 mr-1.5" />
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
}
