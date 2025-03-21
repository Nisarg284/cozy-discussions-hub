
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useRedditApi, Subreddit } from "@/services/reddit";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SubscribedSubreddits: React.FC = () => {
  const { getSubscribedSubreddits } = useRedditApi();
  const { isAuthenticated } = useAuth();
  
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscribedSubreddits", isAuthenticated],
    queryFn: () => getSubscribedSubreddits(20),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated,
  });

  const subreddits = data?.subreddits || [];

  if (!isAuthenticated) {
    return (
      <Card className="p-4 border border-border/60 bg-white">
        <h2 className="text-base font-semibold mb-2">Your Communities</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to see your subscribed communities
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-4 border border-border/60 bg-white">
        <h2 className="text-base font-semibold mb-2">Your Communities</h2>
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-4 border border-border/60 bg-white">
        <h2 className="text-base font-semibold mb-2">Your Communities</h2>
        <p className="text-sm text-destructive">Failed to load communities</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-border/60 bg-white">
      <h2 className="text-base font-semibold mb-3">Your Communities</h2>
      {subreddits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven't subscribed to any communities yet
        </p>
      ) : (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {subreddits.map((subreddit: Subreddit) => (
              <Link
                key={subreddit.name}
                to={`/r/${subreddit.display_name}`}
                className="flex items-center p-2 rounded-md hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage 
                    src={subreddit.icon_img} 
                    alt={subreddit.display_name} 
                  />
                  <AvatarFallback className="text-xs">
                    {subreddit.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    r/{subreddit.display_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};

export default SubscribedSubreddits;
