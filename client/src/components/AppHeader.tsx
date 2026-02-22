import { Button } from "@/components/ui/button";
import { Film, List, Bell, DollarSign, Sparkles, BarChart3, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MobileMenu } from "@/components/MobileMenu";

// Pages that should show a "Back" button instead of full nav
const DETAIL_PAGES = ["/movie/", "/tv/", "/list/"];
export function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const isDetailPage = DETAIL_PAGES.some((p) => location.startsWith(p));

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
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-1">
                  {isDetailPage ? (
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  ) : (
                    <>
                      <Link href="/lists">
                        <Button variant="ghost" size="sm" className="gap-2 px-3" data-tour="lists">
                          <List className="h-4 w-4" />
                          <span className="text-sm">Listas</span>
                        </Button>
                      </Link>
                      <Link href="/alerts">
                        <Button variant="ghost" size="sm" className="gap-2 px-3" data-tour="alerts">
                          <Bell className="h-4 w-4" />
                          <span className="text-sm">Alertas</span>
                        </Button>
                      </Link>
                      <Link href="/streaming-prices">
                        <Button variant="ghost" size="sm" className="gap-2 px-3">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Preços</span>
                        </Button>
                      </Link>
                      <Link href="/streaming-analysis">
                        <Button variant="ghost" size="sm" className="gap-2 px-3">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm">Análise</span>
                        </Button>
                      </Link>
                      {user?.role === 'admin' && (
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

                {/* Mobile: Back button on detail pages, menu on others */}
                <div className="flex lg:hidden items-center gap-2">
                  {isDetailPage && (
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      <span className="text-sm">Voltar</span>
                    </Button>
                  )}
                </div>

                {/* Always show PWA install and mobile menu */}
                <div className="flex items-center gap-2">
                  <PWAInstallPrompt />
                  <MobileMenu />
                </div>
              </>
            ) : (
              <>
                {/* Non-authenticated: show About, Prices, PWA install, and Login */}
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sobre
                  </Link>
                  <Link href="/streaming-prices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Preços
                  </Link>
                </div>
                <PWAInstallPrompt />
                <Button asChild variant="default" size="sm">
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
