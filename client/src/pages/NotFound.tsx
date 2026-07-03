import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background pt-16">
      <SEO
        title="Página não encontrada"
        description="A página que você está procurando não existe ou foi removida."
        noindex={true}
      />
      <div className="w-full max-w-lg mx-4 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

        <h2 className="text-xl font-semibold text-muted-foreground mb-4">
          Página não encontrada
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Desculpe, a página que você está procurando não existe.
          <br />
          Ela pode ter sido movida ou removida.
        </p>

        <Button
          onClick={handleGoHome}
          className="px-6 py-2.5"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
