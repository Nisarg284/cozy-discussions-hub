
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import PostList from "@/components/PostList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRedditApi, Subreddit as SubredditType } from "@/services/reddit";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Users, Calendar, Info, Shield, ArrowUp, Flame, Clock, TrendingUp } from "lucide-react";
import SubscribedSubreddits from "@/components/SubscribedSubreddits";

const SubredditPage = () => {
  const { subreddit } = useParams<{ subreddit: string }>();
  const [sort, setSort] = useState<"hot" | "new" | "top" | "rising">("hot");
  const { isAuthenticated } = useAuth();
  const { getSubreddits, subscribeToSubreddit } = useRedditApi();

  // Fetch subreddit info
  const {
    data: subredditInfo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["subreddit", subreddit],
    queryFn: async () => {
      const subreddits = await getSubreddits(subreddit);
      return subreddits.find(s => s.display_name.toLowerCase() === subreddit?.toLowerCase());
    },
    enabled: !!subreddit,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSortChange = (value: string) => {
    setSort(value as any);
  };

  const handleSubscribe = async (action: 'sub' | 'unsub') => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      if (!subreddit) return;
      await subscribeToSubreddit(subreddit, action);
      toast.success(action === 'sub' ? "Subscribed successfully" : "Unsubscribed successfully");
      refetch();
    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DAE0E6]">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !subredditInfo) {
    return (
      <div className="min-h-screen bg-[#DAE0E6]">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Subreddit not found</h1>
            <p className="text-muted-foreground mb-4">The subreddit r/{subreddit} does not exist or could not be loaded.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      
      {/* Subreddit banner */}
      <div className="h-20 bg-reddit-blue w-full" />
      
      <div className="container max-w-5xl mx-auto pt-4 pb-10 px-4">
        {/* Subreddit header */}
        <div className="flex items-start mb-4">
          <div className="mr-4 -mt-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white overflow-hidden">
              {subredditInfo.icon_img ? (
                <img 
                  src={subredditInfo.icon_img} 
                  alt={`r/${subredditInfo.display_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-reddit-orange flex items-center justify-center text-white text-xl font-bold">
                  {subredditInfo.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">r/{subredditInfo.display_name}</h1>
            <p className="text-sm text-muted-foreground mb-2">
              {subredditInfo.subscribers?.toLocaleString() || 0} members
            </p>
          </div>
          <div>
            {isAuthenticated && (
              <Button 
                onClick={() => handleSubscribe(subredditInfo.user_is_subscriber ? 'unsub' : 'sub')}
                variant={subredditInfo.user_is_subscriber ? "outline" : "default"}
                className={!subredditInfo.user_is_subscriber ? "bg-reddit-orange hover:bg-reddit-orange/90 text-white" : ""}
              >
                {subredditInfo.user_is_subscriber ? "Joined" : "Join"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <Card className="bg-white mb-4 p-2 border border-border/60">
              <Tabs 
                defaultValue="hot" 
                value={sort}
                onValueChange={handleSortChange}
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
                  <PostList subreddit={subredditInfo.display_name} sort="hot" />
                </TabsContent>
                
                <TabsContent value="new">
                  <PostList subreddit={subredditInfo.display_name} sort="new" />
                </TabsContent>
                
                <TabsContent value="top">
                  <PostList subreddit={subredditInfo.display_name} sort="top" />
                </TabsContent>
                
                <TabsContent value="rising">
                  <PostList subreddit={subredditInfo.display_name} sort="rising" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-80 space-y-4">
            {/* About Subreddit */}
            <Card className="p-4 border border-border/60 bg-white overflow-hidden">
              <h2 className="text-base font-semibold mb-3">About Community</h2>
              
              {subredditInfo.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {subredditInfo.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-sm mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{subredditInfo.subscribers?.toLocaleString() || 0} Members</span>
              </div>
              
              <div className="border-t border-border/60 pt-3 mt-3">
                <Button 
                  className="w-full"
                  variant={!isAuthenticated || !subredditInfo.user_is_subscriber ? "default" : "outline"}
                  onClick={() => handleSubscribe(subredditInfo.user_is_subscriber ? 'unsub' : 'sub')}
                  disabled={!isAuthenticated}
                >
                  {!isAuthenticated ? "Sign in to Join" : 
                    subredditInfo.user_is_subscriber ? "Leave Community" : "Join Community"}
                </Button>
              </div>
            </Card>

            {isAuthenticated && <SubscribedSubreddits />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubredditPage;
