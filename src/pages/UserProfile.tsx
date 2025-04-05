
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Trophy, Award, BookOpen, MessageSquare, ArrowUp, Clock, Flame } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRedditApi } from "@/services/reddit";
import { Loader2 } from "lucide-react";
import PostList from "@/components/PostList";

const UserProfile = () => {
  const { username = "" } = useParams<{ username: string }>();
  const { getPersonalizedFeed } = useRedditApi();
  
  // Mock user profile data since getUserProfile doesn't exist
  const mockUserProfile = {
    name: username,
    profile_img: "",
    post_karma: 1024,
    comment_karma: 512,
    created: Math.floor(Date.now() / 1000) - 86400 * 365, // 1 year ago
    description: `This is ${username}'s profile.`
  };
  
  const { 
    data: profile, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => Promise.resolve(mockUserProfile),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!username,
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <p className="text-muted-foreground mb-4">The user profile could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {/* User header */}
            <Card className="mb-4 p-6 border border-border/60">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                  <AvatarImage src={profile.profile_img} alt={username} />
                  <AvatarFallback className="text-xl bg-reddit-orange text-white">
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold mb-1">{username}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>{profile.post_karma || 0} Post Karma</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{profile.comment_karma || 0} Comment Karma</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      <span>Joined {formatDate(profile.created || Date.now() / 1000)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-auto hidden sm:block">
                  <Button 
                    variant="outline" 
                    className="bg-reddit-orange text-white hover:bg-reddit-orange/90"
                    onClick={() => toast.info("Following feature not implemented yet")}
                  >
                    Follow
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* User content */}
            <Card className="border border-border/60">
              <Tabs defaultValue="posts">
                <TabsList className="w-full justify-start p-0 h-12 border-b rounded-none gap-0">
                  <TabsTrigger 
                    value="posts" 
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-reddit-orange rounded-none"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments" 
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-reddit-orange rounded-none"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="about" 
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-reddit-orange rounded-none"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    About
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="p-4">
                  <div className="flex mb-4 border-b border-border/60">
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-reddit-blue text-reddit-blue">
                      <Flame className="h-4 w-4 inline mr-1" />
                      Hot
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      New
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground">
                      <ArrowUp className="h-4 w-4 inline mr-1" />
                      Top
                    </button>
                  </div>
                  
                  <PostList subreddit="" sort="hot" />
                </TabsContent>
                
                <TabsContent value="comments" className="p-4">
                  <p className="text-muted-foreground text-center py-8">
                    User comments will appear here
                  </p>
                </TabsContent>
                
                <TabsContent value="about" className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Trophy Case</h3>
                      <div className="bg-secondary/50 rounded-md p-4 flex items-center gap-3">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="font-medium">Verified Email</p>
                          <p className="text-xs text-muted-foreground">User has a verified email address</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Reddit History</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Created</span>
                          <span>{formatDate(profile.created || Date.now() / 1000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60">
              <h2 className="text-base font-semibold mb-3">About u/{username}</h2>
              <div className="text-sm text-muted-foreground">
                {profile.description || "This user hasn't added a description yet."}
              </div>
            </Card>
            
            <Card className="p-4 border border-border/60">
              <h2 className="text-base font-semibold mb-3">Moderated Communities</h2>
              <p className="text-sm text-muted-foreground">
                This user doesn't moderate any communities.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
