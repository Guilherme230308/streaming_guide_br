import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Lock, UserPlus } from "lucide-react";
import { getLoginUrl } from "@/const";

interface LoginPromptProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  compact?: boolean;
  /** Blurred preview content rendered behind the login overlay */
  preview?: React.ReactNode;
}

/**
 * Full-page login prompt with optional blurred preview content behind it.
 * The preview gives users a taste of what they'll get after signing up.
 */
export function LoginPromptPage({
  title = "Faça login para continuar",
  description = "Crie uma conta gratuita para acessar esta funcionalidade.",
  icon,
  preview,
}: LoginPromptProps) {
  return (
    <div className="min-h-screen bg-background pt-16 relative overflow-hidden">
      {/* Blurred preview content */}
      {preview && (
        <div className="pointer-events-none select-none" aria-hidden="true">
          <div className="container px-4 py-8">
            <div className="blur-[6px] opacity-40">
              {preview}
            </div>
          </div>
        </div>
      )}

      {/* Login overlay - centered over the blurred content */}
      <div
        className={`${preview ? "absolute inset-0 pt-16" : ""} flex items-start justify-center`}
        style={preview ? { zIndex: 10 } : undefined}
      >
        <div className="mt-16 sm:mt-24">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="bg-background/80 backdrop-blur-md rounded-2xl border border-border/50 p-8 shadow-2xl">
              <div className="mb-5 flex justify-center">
                {icon || <Lock className="h-14 w-14 text-muted-foreground/50" />}
              </div>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{description}</p>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold w-full shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-400/40 hover:scale-[1.02]"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar conta grátis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-border/60 hover:bg-muted/50"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Já tenho conta — Entrar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-4">
                100% gratuito. Leva menos de 30 segundos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline login prompt for sections within a page (e.g., rating section in movie details)
 */
export function LoginPromptInline({
  title = "Faça login para continuar",
  description = "Crie uma conta gratuita para acessar esta funcionalidade.",
  preview,
}: LoginPromptProps) {
  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Blurred preview */}
      {preview && (
        <div className="pointer-events-none select-none blur-[4px] opacity-30" aria-hidden="true">
          {preview}
        </div>
      )}

      {/* Login overlay */}
      <div className={preview ? "absolute inset-0 flex items-center justify-center z-10" : ""}>
        <Card className={preview ? "bg-background/80 backdrop-blur-md border-border/50 shadow-xl" : ""}>
          <CardContent className="pt-6 text-center">
            <Lock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="font-semibold mb-1">{title}</p>
            <p className="text-muted-foreground text-sm mb-4">{description}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-400/40 hover:scale-[1.02]"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar conta grátis
              </Button>
              <Button
                variant="outline"
                className="border-border/60 hover:bg-muted/50"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
