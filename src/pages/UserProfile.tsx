
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserKarma, getUserTrophies } from "@/services/backendApi";
import { Trophy, ArrowUp, MessageSquare, CalendarClock, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import PostList from "@/components/PostList";

const UserProfile = () => {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  const { data: karma, isLoading: isKarmaLoading } = useQuery({
    queryKey: ["userKarma", username],
    queryFn: getUserKarma,
    enabled: isAuthenticated && !!username,
  });

  const { data: trophies, isLoading: isTrophiesLoading } = useQuery({
    queryKey: ["userTrophies", username],
    queryFn: getUserTrophies,
    enabled: isAuthenticated && !!username,
  });

  return (
    <div className="pt-16 min-h-screen bg-background dark:bg-gray-900">
      <div className="container max-w-5xl px-4 mx-auto">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-lg" />
          
          {/* Profile Info */}
          <div className="px-4 sm:px-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end mb-6">
              <Avatar className="h-24 w-24 border-4 border-background dark:border-gray-900 shadow-md">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold">{username}</h1>
                  <BadgeCheck className="h-5 w-5 ml-2 text-blue-500" />
                </div>
                
                <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground mt-1">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  <span>Redditor since 2 years ago</span>
                </div>
              </div>
              
              <div className="flex mt-4 sm:mt-0 sm:ml-auto">
                <Button>Follow</Button>
                <Button variant="outline" className="ml-2">Message</Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <ArrowUp className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <p className="font-medium text-xl">{isKarmaLoading ? <Skeleton className="h-6 w-12 mx-auto" /> : karma?.data?.link_karma || 0}</p>
                <p className="text-xs text-muted-foreground">Post Karma</p>
              </Card>
              
              <Card className="p-4 text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="font-medium text-xl">{isKarmaLoading ? <Skeleton className="h-6 w-12 mx-auto" /> : karma?.data?.comment_karma || 0}</p>
                <p className="text-xs text-muted-foreground">Comment Karma</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="font-medium text-xl">{isTrophiesLoading ? <Skeleton className="h-6 w-12 mx-auto" /> : trophies?.data?.trophies?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Trophies</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="font-medium text-xl">120</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {username ? (
              <PostList userId={username} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Comments will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Trophy Case</h3>
              
              {isTrophiesLoading ? (
                <div className="flex gap-4 flex-wrap">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-24 rounded-md" />
                  ))}
                </div>
              ) : trophies?.data?.trophies?.length ? (
                <div className="flex gap-4 flex-wrap">
                  {trophies.data.trophies.map((trophy: any, i: number) => (
                    <div key={i} className="text-center">
                      <div className="h-16 w-16 mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-2">
                        <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <p className="text-xs font-medium">{trophy.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No trophies yet</p>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Saved items will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
