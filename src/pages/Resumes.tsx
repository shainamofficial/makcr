import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import GenerateResumeTab from "@/components/resumes/GenerateResumeTab";
import PastResumesTab from "@/components/resumes/PastResumesTab";

export default function Resumes() {
  const { user } = useAuth();
  const [tab, setTab] = useState("generate");

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 pt-20">
      <h1 className="text-3xl font-bold text-foreground mb-6">Resumes</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Resume</TabsTrigger>
          <TabsTrigger value="past">Past Resumes</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <GenerateResumeTab userId={user.id} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <PastResumesTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
