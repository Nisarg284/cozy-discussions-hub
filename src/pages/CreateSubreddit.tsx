
import React from "react";
import Navbar from "@/components/Navbar";
import SubredditCreation from "@/components/SubredditCreation";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const CreateSubreddit = () => {
  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <SubredditCreation />
          </div>

          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Creating a Community</h2>
              </div>
              <Separator className="my-3" />
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Community names must be between 3-21 characters</span>
                </li>
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Use a clear, concise name related to your topic</span>
                </li>
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Add a comprehensive description to help others find your community</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Avoid using trademarked or offensive names</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubreddit;
