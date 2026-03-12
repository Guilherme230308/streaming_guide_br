import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Lock } from "lucide-react";
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
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Criar conta / Entrar
              </Button>
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
            <Button
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Criar conta / Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
