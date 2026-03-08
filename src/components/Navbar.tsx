import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, MessageSquare, User, FileText } from "lucide-react";

const navLinks = [
  { to: "/interview", label: "AI Interview", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/resumes", label: "Resumes", icon: FileText },
];

const Navbar = () => {
  const { session, user, signInWithGoogle, signOut, loading } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase()
    ?? user?.user_metadata?.name?.charAt(0)?.toUpperCase()
    ?? user?.email?.charAt(0)?.toUpperCase()
    ?? "U";

  const userName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email
    ?? "User";

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to={session ? "/profile" : "/"}
          className="text-xl font-bold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
        >
          Makcr
        </Link>

        {session ? (
          <>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(to)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop avatar dropdown */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                    {user?.email && (
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    {/* User info */}
                    <div className="flex items-center gap-3 border-b border-border p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                        {user?.email && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Nav links */}
                    <div className="flex flex-col gap-1 p-2">
                      {navLinks.map(({ to, label, icon: Icon }) => (
                        <SheetClose asChild key={to}>
                          <Link
                            to={to}
                            onClick={() => setSheetOpen(false)}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              isActive(to)
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>

                    {/* Bottom actions */}
                    <div className="mt-auto border-t border-border p-2">
                      <SheetClose asChild>
                        <button
                          onClick={signOut}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Log Out
                        </button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          /* Logged out: Sign Up + Login */
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={signInWithGoogle} disabled={loading}>
              Login
            </Button>
            <Button onClick={signInWithGoogle} disabled={loading}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
