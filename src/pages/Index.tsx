import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  MessageSquare,
  Network,
  FileText,
  Search,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Smart Interview",
    description:
      "Our AI conducts a smart interview to capture your skills, impact, and career highlights.",
  },
  {
    icon: Network,
    title: "Career Graph",
    description:
      "Your answers become a structured career graph — the single source of truth for every resume.",
  },
  {
    icon: FileText,
    title: "Instant Tailoring",
    description:
      "Paste a job description. Get a tailored, ATS-ready resume in seconds.",
  },
];

const roadmap = [
  {
    version: "v1",
    title: "AI Resume Generation",
    badge: "Available Now",
    available: true,
    icon: FileText,
  },
  {
    version: "v2",
    title: "Recruiter Search",
    badge: "Coming Soon",
    available: false,
    icon: Search,
  },
  {
    version: "v3",
    title: "Job Posting & Matching",
    badge: "Coming Soon",
    available: false,
    icon: Briefcase,
  },
  {
    version: "v4",
    title: "Career Growth AI",
    badge: "Coming Soon",
    available: false,
    icon: TrendingUp,
  },
];

const Index = () => {
  const { session, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (session) {
      navigate("/profile");
    } else {
      signInWithGoogle();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="relative container mx-auto px-4 md:px-6 py-16 md:py-36 lg:py-44 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Your AI Career Partner
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Makcr uses AI to interview you, build your structured career profile,
            and generate tailored resumes for any job — in minutes.
          </p>
          <Button size="lg" className="mt-8 md:mt-10 text-base px-8 py-6 w-full sm:w-auto" onClick={handleCTA}>
            Get Started — It's Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
          How It Works
        </h2>
        <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
          Three simple steps to a stronger career profile and better resumes.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <span className="mt-4 text-sm font-medium text-muted-foreground">
                Step {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-28">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
            Product Roadmap
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
            We're building the AI-native career platform — one milestone at a time.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {roadmap.map(({ version, title, badge, available, icon: Icon }) => (
              <Card
                key={version}
                className={`relative transition-shadow ${
                  available
                    ? "border-primary/30 shadow-md"
                    : "border-border opacity-80"
                }`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {version}
                    </span>
                    <Badge
                      variant={available ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {badge}
                    </Badge>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-sm">
                    {available
                      ? "Paste a job description and get a tailored resume powered by your career graph."
                      : "Stay tuned — this feature is on the way."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Makcr. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
