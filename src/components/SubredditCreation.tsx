
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRedditApi } from "@/services/reddit";

const subredditSchema = z.object({
  name: z
    .string()
    .min(3, "Subreddit name must be at least 3 characters")
    .max(21, "Subreddit name must be less than 21 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  type: z.enum(["public", "restricted", "private"], {
    required_error: "You must select a community type",
  }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type SubredditFormValues = z.infer<typeof subredditSchema>;

const SubredditCreation = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redditApi = useRedditApi();

  const form = useForm<SubredditFormValues>({
    resolver: zodResolver(subredditSchema),
    defaultValues: {
      name: "",
      type: "public",
      description: "",
    },
  });

  const onSubmit = async (values: SubredditFormValues) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to create a subreddit");
      return;
    }

    setIsSubmitting(true);
    try {
      // This would be integrated with the Reddit API once implemented
      toast.success(`r/${values.name} has been created!`);
      navigate(`/r/${values.name}`);
    } catch (error) {
      console.error("Error creating subreddit:", error);
      toast.error("Failed to create subreddit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create a Community</CardTitle>
          <CardDescription>
            You need to be logged in to create a subreddit
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Community</CardTitle>
        <CardDescription>
          Create a community to share content with like-minded people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <div className="flex">
                    <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md">
                      r/
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-l-none"
                        placeholder="community_name"
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Community names must be between 3-21 characters, and can only contain
                    letters, numbers, and underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Community Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Public</span> - Anyone can view, post, and comment
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="restricted" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Restricted</span> - Anyone can view, but only approved users can post
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          <span className="font-medium">Private</span> - Only approved users can view and post
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your community..."
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    This will be shown in the community sidebar and in search results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
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
                {isSubmitting ? "Creating..." : "Create Community"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubredditCreation;
