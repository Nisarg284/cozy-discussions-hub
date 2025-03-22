
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { RedditPost } from "@/services/reddit";
import { Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";

interface VideoCardProps {
  post: RedditPost;
}

const VideoCard: React.FC<VideoCardProps> = ({ post }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking the video itself
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  };

  // Get video URL from post
  const getVideoUrl = () => {
    if (post.media?.reddit_video?.fallback_url) {
      return post.media.reddit_video.fallback_url;
    }
    return null;
  };

  const videoUrl = getVideoUrl();
  const created = new Date(post.created * 1000);

  if (!videoUrl) {
    return null; // Skip non-video posts
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div 
          className="aspect-video bg-black relative cursor-pointer"
          onClick={handleVideoClick}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            poster={post.preview?.images[0]?.source?.url}
            muted={isMuted}
            playsInline
            loop
            onClick={handleVideoClick}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-black/70 hover:bg-black/90 text-white rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-black/70 hover:bg-black/90 text-white rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMute();
              }}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Link to={`/r/${post.subreddit}`} className="font-medium text-foreground hover:underline mr-2">
            r/{post.subreddit}
          </Link>
          <span className="text-xs">•</span>
          <span className="ml-2">Posted by u/{post.author}</span>
          <span className="text-xs ml-2">•</span>
          <span className="ml-2">{formatDistanceToNow(created, { addSuffix: true })}</span>
        </div>
        
        <h3 className="text-base font-medium mb-2">
          <Link to={`/r/${post.subreddit}/comments/${post.id}`} className="hover:underline line-clamp-2">
            {post.title}
          </Link>
        </h3>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center">
              <span>{post.score} points</span>
            </span>
            <span className="flex items-center">
              <span>{post.num_comments} comments</span>
            </span>
          </div>
          
          <a 
            href={`https://www.reddit.com${post.permalink}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs flex items-center text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Reddit</span>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard;
