import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowUp, ArrowDown, MessageSquare, Share2, BookmarkIcon } from "lucide-react";
import { useRedditApi, RedditPost, RedditComment } from "@/services/reddit";
import { useAuth } from "@/context/AuthContext";
import SubscribedSubreddits from "@/components/SubscribedSubreddits";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import CommentSubmission from "@/components/CommentSubmission";

const Comment = ({ 
  comment, 
  onVote 
}: { 
  comment: RedditComment; 
  onVote: (id: string, direction: 1 | 0 | -1, prevVote: boolean | null) => void;
}) => {
  const [vote, setVote] = useState<boolean | null>(comment.liked);
  const [score, setScore] = useState(comment.score);

  const handleVote = (direction: 1 | 0 | -1) => {
    let newVote: boolean | null;
    if (direction === 1) {
      newVote = vote === true ? null : true;
    } else if (direction === -1) {
      newVote = vote === false ? null : false;
    } else {
      newVote = null;
    }
    
    let scoreChange = 0;
    if (vote === true && newVote !== true) scoreChange--;
    if (vote === false && newVote !== false) scoreChange++;
    if (newVote === true && vote !== true) scoreChange++;
    if (newVote === false && vote !== false) scoreChange--;
    
    setVote(newVote);
    setScore(prevScore => prevScore + scoreChange);
    
    onVote(comment.id, direction, vote);
  };

  return (
    <div className="pt-4">
      <div className="pl-2 border-l-2 border-border/60">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-6 w-6 rounded-full ${vote === true ? "text-reddit-orange" : ""}`}
              onClick={() => handleVote(1)}
            >
              <ArrowUp size={14} />
            </Button>
            
            <span className="text-xs font-semibold my-0.5">{score}</span>
            
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-6 w-6 rounded-full ${vote === false ? "text-primary" : ""}`}
              onClick={() => handleVote(-1)}
            >
              <ArrowDown size={14} />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{comment.author}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(comment.created * 1000), { addSuffix: true })}</span>
            </div>
            
            <div className="text-sm prose-sm mb-2 max-w-none">{comment.body}</div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <button className="hover:text-foreground">
                <MessageSquare size={12} className="inline mr-1" />
                Reply
              </button>
              <button className="hover:text-foreground">
                <Share2 size={12} className="inline mr-1" />
                Share
              </button>
              <button className="hover:text-foreground">Report</button>
            </div>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4">
            {comment.replies.map(reply => (
              <Comment key={reply.id} comment={reply} onVote={onVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetail = () => {
  const { postId, subreddit } = useParams<{ postId: string; subreddit: string }>();
  const { isAuthenticated } = useAuth();
  const { getPosts, getComments, vote } = useRedditApi();
  
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = useQuery({
    queryKey: ["post", postId, subreddit],
    queryFn: async () => {
      const result = await getPosts(subreddit, "hot");
      const foundPost = result.posts.find(p => p.id === postId);
      if (!foundPost) {
        throw new Error("Post not found");
      }
      return foundPost;
    },
    enabled: !!postId && !!subreddit,
    staleTime: 5 * 60 * 1000,
  });
  
  const {
    data: comments,
    isLoading: isLoadingComments,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["comments", postId, subreddit],
    queryFn: () => getComments(postId || "", subreddit || ""),
    enabled: !!postId && !!subreddit,
    staleTime: 5 * 60 * 1000,
  });
  
  const [postVote, setPostVote] = useState<boolean | null>(post?.liked || null);
  const [postScore, setPostScore] = useState<number>(post?.score || 0);
  
  React.useEffect(() => {
    if (post) {
      setPostVote(post.liked);
      setPostScore(post.score);
    }
  }, [post]);

  const handlePostVote = async (direction: 1 | 0 | -1) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    if (!post) return;
    
    let newVote: boolean | null;
    if (direction === 1) {
      newVote = postVote === true ? null : true;
    } else if (direction === -1) {
      newVote = postVote === false ? null : false;
    } else {
      newVote = null;
    }
    
    let scoreChange = 0;
    if (postVote === true && newVote !== true) scoreChange--;
    if (postVote === false && newVote !== false) scoreChange++;
    if (newVote === true && postVote !== true) scoreChange++;
    if (newVote === false && postVote !== false) scoreChange--;
    
    setPostVote(newVote);
    setPostScore(prevScore => prevScore + scoreChange);
    
    try {
      await vote(post.id, direction);
    } catch (error) {
      console.error("Vote failed:", error);
      toast.error("Failed to register vote");
      
      setPostVote(post.liked);
      setPostScore(post.score);
    }
  };
  
  const handleCommentVote = async (id: string, direction: 1 | 0 | -1, prevVote: boolean | null) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    toast.info("Comment voting not implemented yet");
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleCommentSubmitted = () => {
    refetchComments();
    toast.success("Comment posted successfully!");
  };

  const isLoading = isLoadingPost || isLoadingComments;
  const isError = isPostError || isCommentsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
        <Navbar />
        <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-4">The post could not be loaded.</p>
            <Button onClick={() => refetchComments()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Card className="bg-card mb-4 border border-border/60 overflow-hidden">
              <div className="flex">
                <div className="bg-secondary/50 w-10 sm:w-12 flex flex-col items-center py-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`h-8 w-8 rounded-full ${postVote === true ? "text-reddit-orange" : ""}`}
                    onClick={() => handlePostVote(1)}
                  >
                    <ArrowUp size={18} className={postVote === true ? "animate-vote-up" : ""} />
                  </Button>
                  
                  <span className="text-sm font-semibold my-1">{postScore}</span>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`h-8 w-8 rounded-full ${postVote === false ? "text-primary" : ""}`}
                    onClick={() => handlePostVote(-1)}
                  >
                    <ArrowDown size={18} className={postVote === false ? "animate-vote-down" : ""} />
                  </Button>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Link to={`/r/${post.subreddit}`} className="font-medium hover:underline">
                      r/{post.subreddit}
                    </Link>
                    <span className="mx-1">•</span>
                    <span>Posted by u/{post.author}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDistanceToNow(new Date(post.created * 1000), { addSuffix: true })}</span>
                  </div>

                  <h1 className="text-xl font-semibold mb-3 text-balance">
                    {post.title}
                  </h1>

                  {post.is_self && post.selftext && (
                    <div className="prose prose-sm max-w-none mb-4">
                      <p>{post.selftext}</p>
                    </div>
                  )}

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

                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <MessageSquare size={16} className="mr-1" />
                      <span>{post.num_comments} comments</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground h-8 px-2"
                      onClick={handleShare}
                    >
                      <Share2 size={16} className="mr-1" />
                      <span>Share</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      <BookmarkIcon size={16} className="mr-1" />
                      <span>Save</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {post && (
              <CommentSubmission 
                postId={post.id} 
                subreddit={post.subreddit}
                onCommentSubmitted={handleCommentSubmitted}
              />
            )}

            <Card className="bg-card p-4 border border-border/60">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">{post.num_comments} Comments</h2>
                <Button variant="outline" size="sm" onClick={() => refetchComments()}>
                  Refresh
                </Button>
              </div>
              
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map(comment => (
                    <Comment key={comment.id} comment={comment} onVote={handleCommentVote} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No comments yet</p>
                </div>
              )}
            </Card>
          </div>
          
          <div className="md:w-80 space-y-4">
            <Card className="p-4 border border-border/60 bg-card">
              <h2 className="text-base font-semibold mb-2">About r/{post.subreddit}</h2>
              <Link 
                to={`/r/${post.subreddit}`}
                className="inline-block text-sm text-primary hover:underline mb-2"
              >
                Visit r/{post.subreddit}
              </Link>
              <div className="border-t border-border/60 pt-3 mt-3">
                <Button 
                  className="w-full bg-reddit-orange hover:bg-reddit-orange/90 text-white"
                  asChild
                >
                  <Link to={`/r/${post.subreddit}/submit`}>Create Post</Link>
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

export default PostDetail;
