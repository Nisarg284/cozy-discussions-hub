
import React from "react";
import Navbar from "@/components/Navbar";
import VideoSearch from "@/components/VideoSearch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Film, TrendingUp, Info } from "lucide-react";

const VideoSearchPage = () => {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6 pt-4">
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Film className="h-6 w-6 text-reddit-orange" />
                Reddit Videos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Search and discover video content from across Reddit
              </p>
              <Separator className="mt-4" />
            </div>
            
            <VideoSearch />
          </div>
          
          {/* Sidebar */}
          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60 bg-white">
              <h2 className="text-base font-semibold mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-reddit-blue" />
                Video Search Tips
              </h2>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  <span>Try searching for topics like "cats", "gaming", or "cooking"</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  <span>Add "tutorial" to find instructional content</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  <span>Include subreddit names for more specific results</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 border border-border/60 bg-white">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Video quality may vary based on the original source</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSearchPage;
