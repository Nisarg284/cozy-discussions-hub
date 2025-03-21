
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import PostList from "@/components/PostList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [sort, setSort] = useState<"hot" | "new" | "top" | "rising">("hot");

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto pt-24 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <Tabs 
              defaultValue="hot" 
              className="mb-6"
              onValueChange={(value) => setSort(value as any)}
            >
              <TabsList className="bg-white/50 backdrop-blur-xs border rounded-full p-1 w-full sm:w-auto">
                <TabsTrigger value="hot" className="rounded-full text-sm">Hot</TabsTrigger>
                <TabsTrigger value="new" className="rounded-full text-sm">New</TabsTrigger>
                <TabsTrigger value="top" className="rounded-full text-sm">Top</TabsTrigger>
                <TabsTrigger value="rising" className="rounded-full text-sm">Rising</TabsTrigger>
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
          </div>
          
          {/* Sidebar */}
          <div className="md:w-72 space-y-4">
            <Card className="p-5 border border-border/60 bg-white">
              <h2 className="text-lg font-semibold mb-4">About Reddit Clone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This is a minimalist Reddit clone built with React and the Reddit API.
                You can browse posts, view comments, and vote if you sign in with your Reddit account.
              </p>
              <div className="border-t border-border/60 pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  Design inspired by clean, minimalist principles.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
