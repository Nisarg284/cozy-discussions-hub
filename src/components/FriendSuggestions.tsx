
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFriendSuggestions } from '@/services/backendApi';

const FriendSuggestions = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['friendSuggestions'],
    queryFn: getFriendSuggestions,
  });

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            <div className="h-6 bg-muted rounded w-32"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subreddit Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load suggestions.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Use mock data when the API doesn't return expected format
  const suggestions = data?.data?.children || [
    { data: { display_name: 'programming', subscribers: 3200000 } },
    { data: { display_name: 'AskReddit', subscribers: 39000000 } },
    { data: { display_name: 'funny', subscribers: 42500000 } },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-reddit-orange" />
          Suggested Communities
        </CardTitle>
        <CardDescription>Communities you might be interested in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.slice(0, 3).map((item) => (
          <div key={item.data.display_name} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {item.data.display_name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-sm font-medium">r/{item.data.display_name}</h4>
              <p className="text-xs text-muted-foreground">
                {formatSubscribers(item.data.subscribers)} members
              </p>
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Join
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-0">
        <Link to="/explore" className="w-full">
          <Button variant="ghost" className="w-full text-reddit-orange hover:text-reddit-orange/90">
            View More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

function formatSubscribers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default FriendSuggestions;
