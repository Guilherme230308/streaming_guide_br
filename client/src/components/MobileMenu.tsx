import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  List,
  Bell,
  Calendar,
  Grid3x3,
  Clock,
  DollarSign,
  User,
  LogOut,
  Sparkles,
  BarChart3,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// All menu items with auth requirement flag
const ALL_MENU_ITEMS = [
  { href: "/lists", icon: List, label: "Listas", tour: "lists", requiresAuth: true },
  { href: "/subscriptions", icon: Bell, label: "Assinaturas", tour: "subscriptions", requiresAuth: true },
  { href: "/upcoming", icon: Calendar, label: "Em Breve", tour: "", requiresAuth: true },
  { href: "/alerts", icon: Bell, label: "Alertas", tour: "alerts", requiresAuth: true },
  { href: "/genres", icon: Grid3x3, label: "Gêneros", tour: "genres", requiresAuth: true },
  { href: "/history", icon: Clock, label: "Histórico", tour: "history", requiresAuth: true },
  { href: "/streaming-prices", icon: DollarSign, label: "Preços", tour: "", requiresAuth: true },
  { href: "/streaming-analysis", icon: Sparkles, label: "Análise", tour: "", requiresAuth: true },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Swipe gesture detection with haptic feedback and reverse swipe
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const triggerHapticFeedback = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = Math.abs(touchEndY - touchStartY);
      const minSwipeDistance = 50;
      const edgeThreshold = 50;
      const screenWidth = window.innerWidth;

      if (
        !open &&
        touchStartX <= edgeThreshold &&
        swipeDistanceX > minSwipeDistance &&
        swipeDistanceY < 100
      ) {
        setOpen(true);
        triggerHapticFeedback();
      }

      if (
        open &&
        touchStartX > screenWidth - 320 &&
        swipeDistanceX < -minSwipeDistance &&
        swipeDistanceY < 100
      ) {
        setOpen(false);
        triggerHapticFeedback();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const handleLockedClick = () => {
    toast.info("Crie uma conta gratuita para acessar esta funcionalidade.", {
      action: {
        label: "Criar conta",
        onClick: () => { window.location.href = getLoginUrl(); },
      },
    });
  };

  // Build menu items: all items always visible, admin item only for admins
  const menuItems = [
    ...ALL_MENU_ITEMS,
    ...(isAuthenticated && user?.role === 'admin'
      ? [{ href: "/affiliate-analytics", icon: BarChart3, label: "Receita", tour: "", requiresAuth: true, isAdmin: true }]
      : []),
  ];

  const isActive = (href: string) => location === href;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 sm:px-3"
          aria-label="Menu"
          data-tour="menu"
        >
          <Menu className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isAuthenticated ? (user?.name || "Menu") : "Menu"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isLocked = item.requiresAuth && !isAuthenticated;

            if (isLocked) {
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 opacity-45 cursor-not-allowed"
                  onClick={handleLockedClick}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base flex-1 text-left">{item.label}</span>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </Button>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    active ? "bg-primary/10 text-primary" : ""
                  } ${'isAdmin' in item && (item as any).isAdmin ? 'text-amber-400 hover:text-amber-300' : ''}`}
                  onClick={() => setOpen(false)}
                  data-tour={item.tour}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        {isAuthenticated ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-base">Sair</span>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              asChild
              variant="default"
              className="w-full justify-start gap-3 h-12 bg-cyan-600 hover:bg-cyan-700"
            >
              <a href={getLoginUrl()}>
                <UserPlus className="h-5 w-5 flex-shrink-0" />
                <span className="text-base">Criar conta grátis</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-3 h-12"
            >
              <a href={getLoginUrl()}>
                <LogIn className="h-5 w-5 flex-shrink-0" />
                <span className="text-base">Entrar</span>
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
