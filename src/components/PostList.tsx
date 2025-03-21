
import React, { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RedditPost, useRedditApi } from "@/services/reddit";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PostListProps {
  subreddit?: string;
  sort?: "hot" | "new" | "top" | "rising";
}

const PostList: React.FC<PostListProps> = ({ 
  subreddit = "", 
  sort = "hot" 
}) => {
  const { getPosts, vote } = useRedditApi();
  const { isAuthenticated } = useAuth();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ["posts", subreddit, sort, isAuthenticated],
    queryFn: ({ pageParam }) => getPosts(subreddit, sort, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.after,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract and flatten all posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];
  
  const handleVote = useCallback(async (id: string, direction: 1 | 0 | -1, prevVote: boolean | null) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    try {
      await vote(id, direction);
    } catch (error) {
      console.error("Vote failed:", error);
      toast.error("Failed to register vote");
    }
  }, [vote, isAuthenticated]);

  // Observer for infinite scroll
  const observerTarget = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentObserverTarget = observerTarget.current;
    
    if (!currentObserverTarget || !hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    
    observer.observe(currentObserverTarget);
    
    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">Failed to load posts</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-2">No posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {posts.map((post: RedditPost) => (
        <PostCard key={post.id} post={post} onVote={handleVote} />
      ))}
      
      <div ref={observerTarget} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </div>
  );
};

export default PostList;
