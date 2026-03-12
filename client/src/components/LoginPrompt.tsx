import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";

interface LoginPromptProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}

/**
 * Full-page login prompt for protected pages (Watchlist, Lists, History, etc.)
 */
export function LoginPromptPage({
  title = "Faça login para continuar",
  description = "Crie uma conta gratuita para acessar esta funcionalidade.",
  icon,
}: LoginPromptProps) {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            {icon || <Lock className="h-16 w-16 text-muted-foreground/50" />}
          </div>
          <h1 className="text-2xl font-bold mb-3">{title}</h1>
          <p className="text-muted-foreground mb-8">{description}</p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => window.location.href = getLoginUrl()}
          >
            <LogIn className="h-5 w-5 mr-2" />
            Criar conta / Entrar
          </Button>
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
}: LoginPromptProps) {
  return (
    <Card>
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
  );
}
