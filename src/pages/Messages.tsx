
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import MessageCompose from "@/components/MessageCompose";
import { format } from "date-fns";

// Define proper types for messages
type ReceivedMessage = {
  id: number;
  from: string;
  subject: string;
  content: string;
  read: boolean;
  time: Date;
};

type SentMessage = {
  id: number;
  to: string;
  subject: string;
  content: string;
  time: Date;
};

type Message = ReceivedMessage | SentMessage;

// Helper function to determine if a message is a received message
const isReceivedMessage = (message: Message): message is ReceivedMessage => {
  return 'from' in message;
};

// Mock data
const mockMessages: Message[] = [
  {
    id: 1,
    from: "reddit_user1",
    subject: "Welcome to Reddit Clone",
    content: "Thanks for joining our community! Let me know if you need any help getting started.",
    read: false,
    time: new Date(2023, 2, 15, 9, 30)
  },
  {
    id: 2,
    from: "moderator_coolsub",
    subject: "Your post has been approved",
    content: "Your recent submission to r/coolsub has been approved by our moderation team. Thanks for contributing!",
    read: true,
    time: new Date(2023, 2, 14, 15, 45)
  },
  {
    id: 3,
    to: "new_redditor",
    subject: "Question about your post",
    content: "I really enjoyed your recent post about coding. Would you mind sharing some additional resources on the topic?",
    time: new Date(2023, 2, 13, 11, 20)
  }
];

const Messages = () => {
  const { isAuthenticated } = useAuth();
  const [messages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const { view, messageId } = useParams();
  const navigate = useNavigate();
  
  const filteredMessages = messages.filter(message => {
    if (view === "inbox") return isReceivedMessage(message);
    if (view === "sent") return !isReceivedMessage(message);
    return true;
  });
  
  React.useEffect(() => {
    if (messageId) {
      const message = messages.find(m => m.id === parseInt(messageId));
      if (message) {
        setSelectedMessage(message);
        setComposeMode(false);
      }
    }
  }, [messageId, messages]);

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setComposeMode(false);
    navigate(`/messages/${view || 'inbox'}/${message.id}`);
  };
  
  const handleComposeClick = () => {
    setComposeMode(true);
    setSelectedMessage(null);
    navigate('/messages/compose');
  };

  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-background">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto pt-16 pb-10 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Messages navigation */}
          <div className="md:w-64 w-full">
            <Card>
              <div className="p-4">
                <Button 
                  className="w-full mb-4 bg-reddit-orange hover:bg-reddit-orange/90"
                  onClick={handleComposeClick}
                >
                  New Message
                </Button>
                
                <Tabs defaultValue={view || "inbox"} className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger 
                      value="inbox" 
                      className="flex-1"
                      onClick={() => navigate('/messages/inbox')}
                    >
                      Inbox
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sent" 
                      className="flex-1"
                      onClick={() => navigate('/messages/sent')}
                    >
                      Sent
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="inbox" className="m-0">
                    <ScrollArea className="h-[500px]">
                      {filteredMessages.length > 0 ? (
                        <div className="space-y-1">
                          {filteredMessages.map(message => (
                            <div 
                              key={message.id}
                              className={`p-3 rounded-md cursor-pointer transition-colors ${
                                selectedMessage?.id === message.id 
                                  ? 'bg-secondary' 
                                  : 'hover:bg-secondary/50'
                              } ${
                                isReceivedMessage(message) && !message.read 
                                  ? 'font-semibold' 
                                  : ''
                              }`}
                              onClick={() => handleSelectMessage(message)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-sm font-medium truncate">
                                  {isReceivedMessage(message) 
                                    ? `From: ${message.from}` 
                                    : `To: ${message.to}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(message.time, 'MMM d')}
                                </div>
                              </div>
                              <div className="text-sm truncate mt-1">{message.subject}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No messages found
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="sent" className="m-0">
                    <ScrollArea className="h-[500px]">
                      {filteredMessages.length > 0 ? (
                        <div className="space-y-1">
                          {filteredMessages.map(message => (
                            <div 
                              key={message.id}
                              className={`p-3 rounded-md cursor-pointer transition-colors ${
                                selectedMessage?.id === message.id 
                                  ? 'bg-secondary' 
                                  : 'hover:bg-secondary/50'
                              }`}
                              onClick={() => handleSelectMessage(message)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-sm font-medium truncate">
                                  {isReceivedMessage(message) 
                                    ? `From: ${message.from}` 
                                    : `To: ${message.to}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(message.time, 'MMM d')}
                                </div>
                              </div>
                              <div className="text-sm truncate mt-1">{message.subject}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No messages found
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>
          
          {/* Message content area */}
          <div className="flex-1">
            <Card className="p-6">
              {composeMode ? (
                <MessageCompose />
              ) : selectedMessage ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                      <div className="text-sm text-muted-foreground mt-1">
                        {isReceivedMessage(selectedMessage) 
                          ? `From: ${selectedMessage.from}` 
                          : `To: ${selectedMessage.to}`} • {format(selectedMessage.time, 'PPpp')}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setComposeMode(true);
                        navigate('/messages/compose');
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{selectedMessage.content}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    Select a message to read or compose a new one
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
