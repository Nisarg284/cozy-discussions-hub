
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRedditApi } from "@/services/reddit";

interface CommentSubmissionProps {
  postId: string;
  subreddit: string;
  onCommentSubmitted?: () => void;
}

const CommentSubmission: React.FC<CommentSubmissionProps> = ({
  postId,
  subreddit,
  onCommentSubmitted,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redditApi = useRedditApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Placeholder for API call - to be implemented
      // await redditApi.submitComment(postId, comment);
      
      toast.success("Comment submitted successfully!");
      setComment("");
      onCommentSubmitted?.();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    return user?.name?.substring(0, 2).toUpperCase() || "?";
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-background border border-border rounded-md p-4 mb-4">
        <p className="text-center text-muted-foreground mb-2">
          Log in or sign up to leave a comment
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <a href="/auth">Log In</a>
          </Button>
          <Button asChild>
            <a href="/auth">Sign Up</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-md p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[100px] mb-3 resize-y bg-background"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="bg-reddit-orange hover:bg-reddit-orange/90"
              >
                {isSubmitting ? "Commenting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSubmission;
