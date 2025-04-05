
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Link2, Image, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useRedditApi } from "@/services/reddit";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title is too long"),
  content: z.string().max(40000, "Content is too long"),
  url: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  subreddit: z.string().min(1, "Subreddit is required"),
});

type PostFormValues = z.infer<typeof postSchema>;

const PostSubmission = ({ defaultSubreddit = "" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [postType, setPostType] = useState<"text" | "link" | "image">("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redditApi = useRedditApi();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      url: "",
      subreddit: defaultSubreddit,
    },
  });

  const onSubmit = async (values: PostFormValues) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a post");
      return;
    }

    setIsSubmitting(true);
    try {
      // This would be integrated with the Reddit API once implemented
      toast.success("Post submitted successfully!");
      navigate(`/r/${values.subreddit}`);
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("Failed to submit post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background rounded-md border border-border">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">Create a post</h1>
      </div>

      {isAuthenticated ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="subreddit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subreddit</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md">
                        r/
                      </span>
                      <Input
                        {...field}
                        className="rounded-l-none"
                        placeholder="subreddit"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs 
              defaultValue="text" 
              onValueChange={(value) => setPostType(value as "text" | "link" | "image")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image size={16} />
                  <span>Image</span>
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link2 size={16} />
                  <span>Link</span>
                </TabsTrigger>
              </TabsList>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Title" 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="text" className="mt-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Text (optional)" 
                          className="min-h-[200px] bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <div className="border-2 border-dashed border-muted-foreground/50 rounded-md p-8 text-center">
                  <p className="text-muted-foreground mb-2">
                    Drag and drop images or
                  </p>
                  <Button type="button" variant="outline">Upload</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Image upload is not yet functional
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url" 
                          placeholder="URL" 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-reddit-orange hover:bg-reddit-orange/90"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="p-8 text-center">
          <p className="mb-4">You need to be logged in to submit a post</p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostSubmission;
