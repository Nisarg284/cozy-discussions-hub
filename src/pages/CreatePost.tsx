
import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostSubmission from "@/components/PostSubmission";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookCheck, SquarePen } from "lucide-react";
import SubscribedSubreddits from "@/components/SubscribedSubreddits";

const CreatePost = () => {
  const { subreddit } = useParams<{ subreddit: string }>();

  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />

      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <PostSubmission defaultSubreddit={subreddit} />
          </div>

          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <SquarePen className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Posting to Reddit</h2>
              </div>
              <Separator className="my-3" />
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Remember to follow the community rules</span>
                </li>
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Choose a relevant title for your post</span>
                </li>
                <li className="flex gap-2">
                  <BookCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Add a tag to your post if applicable</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>Don't share personal information</span>
                </li>
              </ul>
            </Card>

            <SubscribedSubreddits />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
