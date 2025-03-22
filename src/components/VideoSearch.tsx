
import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Loader2, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRedditApi } from "@/services/reddit";
import PostCard from "./PostCard";
import { toast } from "sonner";

const VideoSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { searchVideos, vote } = useRedditApi();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ["videoSearch", activeSearch],
    queryFn: ({ pageParam }) => searchVideos(activeSearch, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.after,
    enabled: !!activeSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setActiveSearch(searchTerm.trim());
  };

  const handleVote = async (id: string, direction: 1 | 0 | -1, prevVote: boolean | null) => {
    try {
      await vote(id, direction);
    } catch (error) {
      console.error("Vote failed:", error);
      toast.error("Failed to register vote");
    }
  };

  // Observer for infinite scroll
  const observerTarget = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
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

  // Flatten posts from all pages
  const videos = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              type="text"
              placeholder="Search for videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-reddit-orange hover:bg-reddit-orange/90 text-white">
            Search
          </Button>
        </form>
      </Card>

      {activeSearch && (
        <div className="flex items-center gap-2 mb-4">
          <Film className="h-5 w-5 text-reddit-orange" />
          <h2 className="text-lg font-medium">Video results for "{activeSearch}"</h2>
        </div>
      )}

      {isLoading && activeSearch && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <Card className="p-4 text-center bg-destructive/5 border-destructive/20">
          <p className="text-destructive mb-2">Failed to load video results</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </Card>
      )}

      {!isLoading && activeSearch && videos.length === 0 && (
        <Card className="p-6 text-center">
          <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">No videos found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </Card>
      )}

      {videos.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          {videos.map(post => (
            <PostCard key={post.id} post={post} onVote={handleVote} />
          ))}
          
          <div ref={observerTarget} className="h-10 flex justify-center items-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSearch;
