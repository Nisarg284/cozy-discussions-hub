
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Inbox, SendHorizontal, Archive, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MessageCompose from "@/components/MessageCompose";

// Mock data for messages
const mockInboxMessages = [
  {
    id: 1,
    from: "redditAdmin",
    subject: "Welcome to Reddit",
    content: "Welcome to Reddit! We're excited to have you join our community. If you have any questions, feel free to ask.",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 2,
    from: "moderator_r_news",
    subject: "Your post has been removed",
    content: "Your post has been removed for violating community guidelines. Please review the subreddit rules before posting again.",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    id: 3,
    from: "userX",
    subject: "Question about your post",
    content: "Hey, I had a question about the post you made regarding the new product launch. Could you provide more details about it?",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
  },
];

const mockSentMessages = [
  {
    id: 1,
    to: "userY",
    subject: "Response to your comment",
    content: "Thanks for your comment on my post. I've added the additional information you requested.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 2,
    to: "moderator_r_askscience",
    subject: "Question about my post removal",
    content: "I noticed my post was removed from r/askscience. Could you let me know which rule it violated so I can make appropriate adjustments?",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
];

type MessageType = {
  id: number;
  from?: string;
  to?: string;
  subject: string;
  content: string;
  read?: boolean;
  time: Date;
};

const Messages = () => {
  const { view = "inbox", messageId } = useParams<{ view: string; messageId?: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  
  // Determine which messages to show based on the view
  const messagesForView = view === "sent" ? mockSentMessages : mockInboxMessages;
  
  // If a messageId is provided, find the message
  React.useEffect(() => {
    if (messageId) {
      const found = messagesForView.find(m => m.id.toString() === messageId);
      if (found) {
        setSelectedMessage(found);
        // Mark as read if it's an inbox message
        if (view === "inbox" && !found.read) {
          // This would update the message in a real implementation
        }
      }
    } else {
      setSelectedMessage(null);
    }
  }, [messageId, view, messagesForView]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto pt-16 pb-10 px-4">
          <Card className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-4">Sign in to view your messages</h1>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto pt-16 pb-10 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">View and manage your private messages</p>
        </div>

        {view === "compose" ? (
          <MessageCompose />
        ) : (
          <Card className="overflow-hidden">
            <Tabs defaultValue={view || "inbox"} className="w-full">
              <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                <TabsList className="grid grid-cols-3 w-auto">
                  <TabsTrigger 
                    value="inbox" 
                    className="flex items-center gap-2"
                    onClick={() => navigate("/messages/inbox")}
                  >
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sent" 
                    className="flex items-center gap-2"
                    onClick={() => navigate("/messages/sent")}
                  >
                    <SendHorizontal className="h-4 w-4" />
                    <span>Sent</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mod" 
                    className="flex items-center gap-2"
                    onClick={() => navigate("/messages/mod")}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Mod</span>
                  </TabsTrigger>
                </TabsList>
                
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate("/messages/compose")}
                >
                  <SendHorizontal className="h-4 w-4" />
                  <span>New Message</span>
                </Button>
              </div>

              <div className="flex h-[calc(100vh-300px)] min-h-[400px]">
                {/* Message List */}
                <div className="w-1/3 border-r border-border overflow-y-auto">
                  {messagesForView.length > 0 ? (
                    <div className="divide-y divide-border">
                      {messagesForView.map((message) => (
                        <button
                          key={message.id}
                          className={`p-3 text-left w-full hover:bg-muted/50 ${
                            selectedMessage?.id === message.id ? 'bg-muted' : ''
                          } ${!message.read && view === 'inbox' ? 'font-medium' : ''}`}
                          onClick={() => {
                            setSelectedMessage(message);
                            navigate(`/messages/${view}/${message.id}`);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="text-xs">
                                {message.from 
                                  ? message.from.substring(0, 2).toUpperCase() 
                                  : message.to?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm truncate">
                                  {message.from ? `u/${message.from}` : `To: u/${message.to}`}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {formatDistanceToNow(message.time, { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-sm font-medium truncate">{message.subject}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content}
                              </p>
                            </div>
                            {!message.read && view === 'inbox' && (
                              <div className="h-2 w-2 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      {view === "inbox" ? (
                        <>
                          <Inbox className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">Your inbox is empty</p>
                        </>
                      ) : view === "sent" ? (
                        <>
                          <SendHorizontal className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">You haven't sent any messages</p>
                        </>
                      ) : (
                        <>
                          <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">No mod messages</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="w-2/3 p-4 overflow-y-auto">
                  {selectedMessage ? (
                    <div>
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <div>
                            {selectedMessage.from ? (
                              <span>
                                From: <Link to={`/user/${selectedMessage.from}`} className="text-primary hover:underline">u/{selectedMessage.from}</Link>
                              </span>
                            ) : (
                              <span>
                                To: <Link to={`/user/${selectedMessage.to}`} className="text-primary hover:underline">u/{selectedMessage.to}</Link>
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(selectedMessage.time, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p>{selectedMessage.content}</p>
                      </div>
                      
                      <div className="mt-6 flex gap-2">
                        {selectedMessage.from && (
                          <Button 
                            onClick={() => navigate(`/messages/compose?to=${selectedMessage.from}`)}
                            className="flex items-center gap-2"
                          >
                            <SendHorizontal className="h-4 w-4" />
                            Reply
                          </Button>
                        )}
                        <Button variant="outline" className="flex items-center gap-2">
                          <Archive className="h-4 w-4" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground text-center">
                        Select a message to view its contents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Messages;
