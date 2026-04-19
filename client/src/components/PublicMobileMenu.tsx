import { useState } from "react";
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
  Search,
  Grid3x3,
  Calendar,
  DollarSign,
  Info,
  LogIn,
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const publicNavItems = [
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/genres", icon: Grid3x3, label: "Gêneros" },
  { href: "/upcoming", icon: Calendar, label: "Em Breve" },
  { href: "/streaming-prices", icon: DollarSign, label: "Preços" },
  { href: "/about", icon: Info, label: "Sobre" },
];

export function PublicMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 sm:px-3" aria-label="Menu" data-tour="menu">
          <Menu className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t">
          <Button asChild variant="default" className="w-full justify-start gap-3 h-12">
            <a href={getLoginUrl()} className="flex items-center gap-3">
              <LogIn className="h-5 w-5 flex-shrink-0" />
              <span className="text-base">Entrar</span>
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
