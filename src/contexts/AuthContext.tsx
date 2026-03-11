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

    if (isIframe) {
      // Use popup flow to bypass iframe cookie restrictions
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) return;

      const popup = window.open(data.url, "oauth", "width=500,height=600");
      if (!popup) {
        alert("Please allow popups for this site to sign in, then try again.");
        return;
      }

      const messageHandler = (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.data?.type === "oauth-complete") {
          popup?.close();
          window.removeEventListener("message", messageHandler);
          window.location.reload();
        }
      };
      window.addEventListener("message", messageHandler);
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
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
