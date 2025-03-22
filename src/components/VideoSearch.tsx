
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRedditApi } from "@/services/reddit";
import { useDebounce } from "@/hooks/use-debounce";
import VideoCard from "./VideoCard";

const VideoSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { searchVideos } = useRedditApi();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchVideos", debouncedQuery],
    queryFn: () => searchVideos(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search for videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-white"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {debouncedQuery.length > 2 ? (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">
                Error searching videos. Please try again.
              </p>
            </Card>
          ) : (
            <>
              {data && data.posts && data.posts.length > 0 ? (
                <div className="space-y-4">
                  {data.posts.map((post) => (
                    <VideoCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No videos found. Try a different search term.
                  </p>
                </Card>
              )}
            </>
          )}
        </>
      ) : searchQuery.length > 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Type at least 3 characters to search
          </p>
        </Card>
      ) : (
        <Card className="p-6 border-dashed">
          <div className="text-center space-y-2">
            <p className="font-medium">Search for Reddit Videos</p>
            <p className="text-sm text-muted-foreground">
              Find video content from across all subreddits
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoSearch;
