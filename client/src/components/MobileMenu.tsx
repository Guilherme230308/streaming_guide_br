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
  Bookmark,
  List,
  Bell,
  Calendar,
  Grid3x3,
  Clock,
  DollarSign,
  User,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Separator } from "@/components/ui/separator";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Swipe gesture detection
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

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
      const minSwipeDistance = 50; // Minimum distance for swipe
      const edgeThreshold = 50; // Distance from left edge to trigger

      // Check if swipe started from left edge and moved right
      if (
        touchStartX <= edgeThreshold && // Started from left edge
        swipeDistanceX > minSwipeDistance && // Swiped right enough
        swipeDistanceY < 100 // Mostly horizontal swipe
      ) {
        setOpen(true);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const menuItems = [
    { href: "/watchlist", icon: Bookmark, label: "Minha Lista", tour: "" },
    { href: "/lists", icon: List, label: "Listas", tour: "lists" },
    { href: "/subscriptions", icon: Bell, label: "Assinaturas", tour: "subscriptions" },
    { href: "/upcoming", icon: Calendar, label: "Em Breve", tour: "" },
    { href: "/alerts", icon: Bell, label: "Alertas", tour: "alerts" },
    { href: "/genres", icon: Grid3x3, label: "Gêneros", tour: "genres" },
    { href: "/history", icon: Clock, label: "Histórico", tour: "history" },
    { href: "/streaming-prices", icon: DollarSign, label: "Preços", tour: "" },
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
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user?.name || "Menu"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    active ? "bg-primary/10 text-primary" : ""
                  }`}
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

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-base">Sair</span>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
