import { Button } from "@/components/ui/button";
import { Anchor, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/ backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-accent bg-clip-text text-transparent">
              Angkara
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#features"
              className="text-foreground hover:text-primary transition-colors"
            >
              Fitur
            </a>
            <a
              href="/tour-packages"
              className="text-foreground hover:text-primary transition-colors"
            >
              Paket Tour
            </a>
            <a
              href="/permit-info"
              className="text-foreground hover:text-primary transition-colors"
            >
              Perizinan
            </a>
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-500/10 transition-all"
                  onClick={() => navigate("/auth")}
                >
                  Masuk
                </Button>

                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a
                href="/#features"
                className="text-black/90 hover:text-primary transition-colors"
              >
                Fitur
              </a>
              <a
                href="/tour-packages"
                className="text-black hover:text-primary transition-colors"
              >
                Paket Tour
              </a>
              <a
                href="/permit-info"
                className="text-black hover:text-primary transition-colors"
              >
                Perizinan
              </a>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => supabase.auth.signOut()}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Masuk
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Daftar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
