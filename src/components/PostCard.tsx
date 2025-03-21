
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, MessageSquare, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { RedditPost, useRedditApi } from "@/services/reddit";

// Helper function to format dates
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
};

interface PostCardProps {
  post: RedditPost;
  onVote: (id: string, direction: 1 | 0 | -1, prevVote: boolean | null) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onVote }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [vote, setVote] = useState<boolean | null>(post.liked);
  const [score, setScore] = useState(post.score);
  const { isAuthenticated } = useAuth();
  
  const handleVote = (direction: 1 | 0 | -1) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    // Calculate the new vote state
    let newVote: boolean | null;
    if (direction === 1) {
      newVote = vote === true ? null : true;
    } else if (direction === -1) {
      newVote = vote === false ? null : false;
    } else {
      newVote = null;
    }
    
    // Calculate score change
    let scoreChange = 0;
    if (vote === true && newVote !== true) scoreChange--;
    if (vote === false && newVote !== false) scoreChange++;
    if (newVote === true && vote !== true) scoreChange++;
    if (newVote === false && vote !== false) scoreChange--;
    
    // Update local state
    setVote(newVote);
    setScore(prevScore => prevScore + scoreChange);
    
    // Call the parent handler
    onVote(post.id, direction, vote);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(`https://reddit.com${post.permalink}`);
    toast.success("Link copied to clipboard");
  };

  // Format content for display
  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const redditUrl = `https://reddit.com${post.permalink}`;
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 mb-4 ${
        isHovered ? "shadow-card -translate-y-1" : "shadow-subtle"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vote sidebar */}
      <div className="flex">
        <div className="bg-secondary/50 w-12 flex flex-col items-center py-2">
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-8 w-8 rounded-full ${vote === true ? "text-reddit-orange" : ""}`}
            onClick={() => handleVote(1)}
          >
            <ArrowUp size={18} className={vote === true ? "animate-vote-up" : ""} />
          </Button>
          
          <span className="text-sm font-semibold my-1">{score}</span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-8 w-8 rounded-full ${vote === false ? "text-primary" : ""}`}
            onClick={() => handleVote(-1)}
          >
            <ArrowDown size={18} className={vote === false ? "animate-vote-down" : ""} />
          </Button>
        </div>

        <div className="flex-1 p-4">
          {/* Post header */}
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Link to={`/r/${post.subreddit}`} className="font-medium hover:underline">
              r/{post.subreddit}
            </Link>
            <span className="mx-1">•</span>
            <span>Posted by u/{post.author}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(post.created)}</span>
          </div>

          {/* Post title */}
          <h3 className="text-lg font-semibold mb-3 text-balance">
            <a href={redditUrl} target="_blank" rel="noopener noreferrer">
              {post.title}
            </a>
          </h3>

          {/* Post content - conditional */}
          {post.is_self && post.selftext && (
            <div className="prose prose-sm max-w-none mb-4">
              <p>{truncateText(post.selftext)}</p>
              {post.selftext.length > 300 && (
                <a 
                  href={redditUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  Read more
                </a>
              )}
            </div>
          )}

          {/* Post thumbnail - if available and not a self post */}
          {!post.is_self && post.thumbnail && post.thumbnail.startsWith('http') && (
            <div className="mb-4">
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="rounded-md max-h-96 object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center space-x-4 mt-2">
            <a 
              href={redditUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <MessageSquare size={16} className="mr-1" />
              <span>{post.num_comments} comments</span>
            </a>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground h-8 px-2"
              onClick={handleShare}
            >
              <Share2 size={16} className="mr-1" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
