
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import PostList from "@/components/PostList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowUp, Flame, Clock, TrendingUp, Award, Shield, Info } from "lucide-react";

const Index = () => {
  const [sort, setSort] = useState<"hot" | "new" | "top" | "rising">("hot");
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6 pt-4">
          {/* Main content */}
          <div className="flex-1">
            <Card className="bg-white mb-4 p-2 border border-border/60">
              <Tabs 
                defaultValue="hot" 
                onValueChange={(value) => setSort(value as any)}
              >
                <TabsList className="bg-transparent w-full justify-start gap-1 h-auto p-0">
                  <TabsTrigger 
                    value="hot" 
                    className="rounded-md data-[state=active]:bg-muted/50 h-8 px-3 text-sm"
                  >
                    <Flame className="h-4 w-4 mr-1.5" />
                    Hot
                  </TabsTrigger>
                  <TabsTrigger 
                    value="new" 
                    className="rounded-md data-[state=active]:bg-muted/50 h-8 px-3 text-sm"
                  >
                    <Clock className="h-4 w-4 mr-1.5" />
                    New
                  </TabsTrigger>
                  <TabsTrigger 
                    value="top" 
                    className="rounded-md data-[state=active]:bg-muted/50 h-8 px-3 text-sm"
                  >
                    <ArrowUp className="h-4 w-4 mr-1.5" />
                    Top
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rising" 
                    className="rounded-md data-[state=active]:bg-muted/50 h-8 px-3 text-sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-1.5" />
                    Rising
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="hot">
                  <PostList sort="hot" />
                </TabsContent>
                
                <TabsContent value="new">
                  <PostList sort="new" />
                </TabsContent>
                
                <TabsContent value="top">
                  <PostList sort="top" />
                </TabsContent>
                
                <TabsContent value="rising">
                  <PostList sort="rising" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60 bg-white overflow-hidden">
              <div className="bg-reddit-blue h-10 -mx-4 -mt-4 mb-4"></div>
              <h2 className="text-base font-semibold mb-4">About Reddit</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reddit is a network of communities where people can dive into their interests, hobbies and passions.
              </p>
              <div className="text-xs text-muted-foreground">
                Created Jan 23, 2023
              </div>
              <div className="border-t border-border/60 pt-4 mt-4">
                <Button className="w-full bg-reddit-orange hover:bg-reddit-orange/90 text-white">
                  Create Post
                </Button>
              </div>
            </Card>

            <Card className="p-4 border border-border/60 bg-white">
              <h2 className="text-base font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-reddit-blue" />
                Reddit Content Policy
              </h2>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Remember the human</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Behave like you would in real life</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Look for the original source of content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Search for duplicates before posting</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>Read the community's rules</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 border border-border/60 bg-white">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Reddit Inc © 2023. All rights reserved</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
