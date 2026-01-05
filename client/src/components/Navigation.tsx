import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  LayoutDashboard, 
  Puzzle, 
  UserCircle,
  Settings
} from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-primary/20">
                S
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-foreground">
                SudoFillr
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/extension">
                <Button 
                  variant={location === "/extension" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Puzzle className="w-4 h-4" />
                  Extension
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant={location === "/settings" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
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
              className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
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
