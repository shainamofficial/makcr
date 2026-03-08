import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PartyPopper, User, FileText } from "lucide-react";

const CompletionBanner = () => (
  <div className="mx-3 sm:mx-4 my-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
    <div className="flex justify-center">
      <PartyPopper className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">
      🎉 Your career profile is complete!
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mx-auto">
      Great job! Your career graph has been built. You can now view your profile
      or generate a tailored resume.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Button asChild>
        <Link to="/profile">
          <User className="mr-2 h-4 w-4" />
          View My Profile
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/resumes">
          <FileText className="mr-2 h-4 w-4" />
          Generate a Resume
        </Link>
      </Button>
    </div>
  </div>
);

export default CompletionBanner;
