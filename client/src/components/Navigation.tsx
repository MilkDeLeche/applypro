import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LogOut, 
  LayoutDashboard, 
  Puzzle, 
  UserCircle,
  Settings,
  Menu
} from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/extension", label: "Extension", icon: Puzzle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-primary/20">
                      S
                    </div>
                    <span className="text-xl font-bold font-display tracking-tight text-foreground">
                      SudoFillr
                    </span>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button 
                        variant={location === item.href ? "secondary" : "ghost"} 
                        className="w-full justify-start gap-3"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-mobile-${item.label.toLowerCase()}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
                      <UserCircle className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-primary/20">
                S
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-foreground">
                SudoFillr
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={location === item.href ? "secondary" : "ghost"} 
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <UserCircle className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logout()}
              className="hidden md:flex gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
