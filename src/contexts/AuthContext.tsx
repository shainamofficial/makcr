import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);

        // If this is a popup OAuth callback, notify the opener and close
        if (session && window.opener) {
          window.opener.postMessage({ type: "oauth-complete" }, window.location.origin);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      if (session && window.opener) {
        window.opener.postMessage({ type: "oauth-complete" }, window.location.origin);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const isIframe = window.self !== window.top;
    const redirectTo = `${window.location.origin}/profile`;

    if (isIframe) {
      // Popup flow for iframe (Lovable preview editor)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error || !data?.url) return;

      const popup = window.open(data.url, "oauth", "width=500,height=600");
      if (!popup) {
        alert("Please allow popups for this site to sign in, then try again.");
        return;
      }

      // Listen for postMessage from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.data?.type === "oauth-complete") {
          cleanup();
          window.location.reload();
        }
      };
      window.addEventListener("message", messageHandler);

      // Polling fallback: check session periodically in case postMessage fails
      const pollInterval = setInterval(async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          cleanup();
          window.location.reload();
        }
      }, 1500);

      // Timeout after 2 minutes
      const timeout = setTimeout(() => cleanup(), 120_000);

      function cleanup() {
        clearInterval(pollInterval);
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);
        popup?.close();
      }
    } else {
      // Published / standard domain — use skipBrowserRedirect + manual redirect
      // to avoid auth-bridge interference on lovable.app
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (!error && data?.url) {
        window.location.href = data.url;
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        signInWithGoogle,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
