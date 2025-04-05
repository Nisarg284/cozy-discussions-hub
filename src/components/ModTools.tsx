
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Filter, Flag, MessageSquare, Settings, ShieldAlert, User, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ModTools = () => {
  const { subreddit } = useParams<{ subreddit: string }>();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(
    "A place to share content about all the things that are mildly infuriating."
  );
  
  const [rules, setRules] = useState([
    "Be civil and respectful",
    "No personal information",
    "No reposts",
    "No memes or meme-like content",
    "No screenshots of text messages or social media"
  ]);

  const [newRule, setNewRule] = useState("");

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, newRule]);
    setNewRule("");
    toast.success("Rule added");
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
    toast.success("Rule removed");
  };

  const handleSaveDescription = () => {
    setIsEditing(false);
    toast.success("Community description updated");
  };

  // Mock reported content
  const reportedContent = [
    {
      id: 1,
      type: "post",
      title: "This is really annoying...",
      author: "user123",
      reason: "Spam",
      reports: 3,
      link: "/r/mildlyinfuriating/comments/abc123"
    },
    {
      id: 2,
      type: "comment",
      content: "This comment violates community rules...",
      author: "commenter456",
      reason: "Harassment",
      reports: 5,
      link: "/r/mildlyinfuriating/comments/def456"
    }
  ];

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Moderator Tools</CardTitle>
          <CardDescription>
            You need to be logged in and a moderator to access these tools
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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mod Tools: r/{subreddit}</h1>
        <p className="text-muted-foreground">
          Manage settings, rules, and reported content for r/{subreddit}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag size={16} />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Details</CardTitle>
                <CardDescription>
                  Basic information about r/{subreddit}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveDescription}>
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{description}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Description
                    </Button>
                  </>
                )}
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Created:</p>
                  <p className="text-sm text-muted-foreground">
                    January 1, 2020
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Subscribers:</p>
                  <p className="text-sm text-muted-foreground">
                    1,234,567
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Rules</CardTitle>
                <CardDescription>
                  Manage rules for your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {rules.map((rule, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between rounded-md p-2 hover:bg-muted group"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <p className="text-sm">{rule}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemoveRule(index)}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add new rule..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddRule}>Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent mod actions and community activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No recent mod actions to display
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Community Settings</CardTitle>
              <CardDescription>
                Manage settings for r/{subreddit}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Controls</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Image Posts</p>
                    <p className="text-sm text-muted-foreground">
                      Let users submit image posts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Video Posts</p>
                    <p className="text-sm text-muted-foreground">
                      Let users submit video posts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Link Posts</p>
                    <p className="text-sm text-muted-foreground">
                      Let users submit link posts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Text Posts</p>
                    <p className="text-sm text-muted-foreground">
                      Let users submit text posts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Community Type</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can view, post, and comment
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Restricted</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can view, but only approved users can post
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-sm text-muted-foreground">
                      Only approved users can view and post
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reported Content</CardTitle>
              <CardDescription>
                Review and take action on reported content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportedContent.length > 0 ? (
                <div className="space-y-4">
                  {reportedContent.map(report => (
                    <div 
                      key={report.id}
                      className="border border-border rounded-md p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive">{report.reports} Reports</Badge>
                        <Badge variant="outline">{report.reason}</Badge>
                      </div>
                      
                      <h4 className="font-medium">
                        {report.type === "post" ? report.title : "Comment"}
                      </h4>
                      
                      {report.type === "comment" && (
                        <p className="text-sm text-muted-foreground">
                          "{report.content}"
                        </p>
                      )}
                      
                      <p className="text-sm">
                        by <span className="font-medium">u/{report.author}</span>
                      </p>
                      
                      <div className="flex gap-2 mt-3">
                        <Button asChild variant="outline" size="sm">
                          <a href={report.link} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">Approve</Button>
                        <Button variant="destructive" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No reported content to review
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Community Members</CardTitle>
              <CardDescription>
                Manage moderators and banned users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="moderators" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="moderators">
                    <ShieldAlert size={16} className="mr-2" />
                    Moderators
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    <User size={16} className="mr-2" />
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="banned">
                    <Filter size={16} className="mr-2" />
                    Banned
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="moderators">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        <div>
                          <p className="font-medium">u/moderator1</p>
                          <p className="text-xs text-muted-foreground">
                            Joined Jan 1, 2020 • Full Permissions
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        <div>
                          <p className="font-medium">u/moderator2</p>
                          <p className="text-xs text-muted-foreground">
                            Joined Jun 15, 2021 • Posts only
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Invite Moderator
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="approved">
                  <div className="text-center py-6">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No approved users to display
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="banned">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-destructive" />
                        <div>
                          <p className="font-medium">u/banned_user1</p>
                          <p className="text-xs text-muted-foreground">
                            Banned Mar 15, 2023 • Reason: Spam
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Unban</Button>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModTools;
