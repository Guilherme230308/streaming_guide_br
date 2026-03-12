import { Button } from "@/components/ui/button";
import { Film, List, Bell, DollarSign, Sparkles, BarChart3, ArrowLeft, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MobileMenu } from "@/components/MobileMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Pages that should show a "Back" button instead of full nav
const DETAIL_PAGES = ["/movie/", "/tv/", "/list/"];

// Desktop nav items visible to all users
// requiresAuth: true means the item is disabled for non-authenticated users
const NAV_ITEMS = [
  { href: "/lists", icon: List, label: "Listas", requiresAuth: true },
  { href: "/alerts", icon: Bell, label: "Alertas", requiresAuth: true },
  { href: "/streaming-prices", icon: DollarSign, label: "Preços", requiresAuth: false },
  { href: "/streaming-analysis", icon: Sparkles, label: "Análise", requiresAuth: true },
];

export function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isDetailPage = DETAIL_PAGES.some((p) => location.startsWith(p));

  const handleLockedClick = () => {
    toast.info("Crie uma conta gratuita para acessar esta funcionalidade.", {
      action: {
        label: "Criar conta",
        onClick: () => { window.location.href = getLoginUrl(); },
      },
    });
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 bg-background/95">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <Film className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-2xl font-bold text-foreground whitespace-nowrap">Onde Assistir</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-1">
              {isDetailPage ? (
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              ) : (
                <>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isLocked = item.requiresAuth && !isAuthenticated;

                    if (isLocked) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 px-3 opacity-50 cursor-not-allowed"
                              onClick={handleLockedClick}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm">{item.label}</span>
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Faça login para acessar</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button variant="ghost" size="sm" className="gap-2 px-3" data-tour={item.href.replace("/", "")}>
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  {/* Admin-only: Receita */}
                  {isAuthenticated && user?.role === 'admin' && (
                    <Link href="/affiliate-analytics">
                      <Button variant="ghost" size="sm" className="gap-2 px-3 text-amber-400 hover:text-amber-300">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Receita</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Mobile: Back button on detail pages */}
            <div className="flex lg:hidden items-center gap-2">
              {isDetailPage && (
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm">Voltar</span>
                </Button>
              )}
            </div>

            {/* PWA install + Mobile menu (always) + Login button (non-auth) */}
            <div className="flex items-center gap-2">
              <PWAInstallPrompt />
              <MobileMenu />
              {!isAuthenticated && (
                <Button asChild variant="default" size="sm">
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
