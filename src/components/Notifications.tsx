
import React, { useState } from "react";
import { Bell, Mail, MessageSquare, User, Heart, ArrowUp, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: "reply",
    from: "user123",
    content: "Replied to your comment in r/mildlyinfuriating",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    link: "/r/mildlyinfuriating/comments/abc123",
  },
  {
    id: 2,
    type: "upvote",
    from: "redditor456",
    content: "Upvoted your post in r/AskReddit",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    link: "/r/AskReddit/comments/def456",
  },
  {
    id: 3,
    type: "message",
    from: "randomUser",
    content: "Sent you a direct message",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    link: "/messages/inbox/randomUser",
  },
  {
    id: 4,
    type: "mention",
    from: "techEnthusiast",
    content: "Mentioned you in a comment in r/programming",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: "/r/programming/comments/ghi789",
  },
  {
    id: 5,
    type: "reply",
    from: "movieFan",
    content: "Replied to your post in r/movies",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    link: "/r/movies/comments/jkl012",
  },
];

// Mock data for messages
const mockMessages = [
  {
    id: 1,
    from: "redditAdmin",
    subject: "Welcome to Reddit",
    snippet: "Welcome to Reddit! We're excited to have you join our community...",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    link: "/messages/message/1",
  },
  {
    id: 2,
    from: "moderator_r_news",
    subject: "Your post has been removed",
    snippet: "Your post has been removed for violating community guidelines...",
    read: true,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    link: "/messages/message/2",
  },
  {
    id: 3,
    from: "userX",
    subject: "Question about your post",
    snippet: "Hey, I had a question about the post you made regarding...",
    read: false,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    link: "/messages/message/3",
  },
];

interface NotificationsProps {
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "upvote":
        return <ArrowUp className="h-4 w-4 text-reddit-orange" />;
      case "message":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "mention":
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = (link: string) => {
    navigate(link);
    onClose();
  };

  const handleMarkAllRead = () => {
    // Would be implemented with actual API call
    // For now just close
    onClose();
  };

  const filteredNotifications = activeTab === "all" 
    ? mockNotifications 
    : mockNotifications.filter(n => !n.read);

  return (
    <div className="w-full sm:w-[350px] bg-background border border-border rounded-md shadow-md">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold">Notifications</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/settings/notifications")} 
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs sm:text-sm">
            <Mail className="h-4 w-4 mr-1.5" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="p-0">
          <div className="flex items-center justify-between p-2 px-3 bg-muted/50">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "all" ? "default" : "ghost"} 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={() => setActiveTab("all")}
              >
                All
              </Button>
              <Button 
                variant={activeTab === "unread" ? "default" : "ghost"} 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={() => setActiveTab("unread")}
              >
                Unread
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                    onClick={() => handleNotificationClick(notification.link)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">u/{notification.from}</span>{" "}
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.time, { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  {activeTab === "all" 
                    ? "No notifications yet" 
                    : "No unread notifications"}
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="messages" className="p-0">
          <div className="flex items-center justify-between p-2 px-3 bg-muted/50">
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs h-7 px-2"
              >
                Inbox
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2"
              >
                Sent
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={() => navigate("/messages/compose")}
            >
              New Message
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            {mockMessages.length > 0 ? (
              <div className="divide-y divide-border">
                {mockMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${!message.read ? 'bg-muted/20' : ''}`}
                    onClick={() => handleNotificationClick(message.link)}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {message.from.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">u/{message.from}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.time, { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {message.snippet}
                        </p>
                      </div>
                      {!message.read && (
                        <div className="h-2 w-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Mail className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No messages yet</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-2 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full text-sm"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
