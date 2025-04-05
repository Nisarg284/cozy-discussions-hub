
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const messageSchema = z.object({
  recipient: z.string().min(1, "Recipient username is required"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  message: z.string().min(1, "Message is required").max(10000, "Message is too long"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageComposeProps {
  defaultRecipient?: string;
}

const MessageCompose: React.FC<MessageComposeProps> = ({ defaultRecipient = "" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipient: defaultRecipient,
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: MessageFormValues) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to send a message");
      return;
    }

    setIsSubmitting(true);
    try {
      // This would be integrated with the Reddit API once implemented
      toast.success(`Message sent to u/${values.recipient}!`);
      navigate("/messages/inbox");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Send a Private Message</CardTitle>
          <CardDescription>
            You need to be logged in to send messages
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
        <CardTitle>Send a Private Message</CardTitle>
        <CardDescription>
          Send a private message to another Reddit user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <div className="flex">
                    <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md">
                      u/
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-l-none"
                        placeholder="username"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Subject" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Your message..."
                      className="min-h-[200px] resize-y"
                    />
                  </FormControl>
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
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MessageCompose;
