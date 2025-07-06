import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Users, Settings, Copy, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const VideoCall = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, navigate]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing camera/microphone:", error);
      toast.error("Cannot access camera or microphone");
      return null;
    }
  };

  const createRoom = async () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    setIsHost(true);
    setIsInCall(true);
    
    const stream = await startLocalVideo();
    if (stream) {
      setParticipants(["You (Host)"]);
      toast.success("Video call room created!");
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    
    setIsInCall(true);
    const stream = await startLocalVideo();
    if (stream) {
      setParticipants(["You", "Host"]);
      toast.success("Joined video call!");
    }
  };

  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsInCall(false);
    setRoomId("");
    setIsHost(false);
    setParticipants([]);
    toast.info("Left the call");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard!");
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/video-call?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Room link copied to clipboard!");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Calls</h1>
          <p className="text-muted-foreground">
            Connect with other Reddit users through video calls
          </p>
        </div>

        {!isInCall ? (
          <div className="max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Start a Video Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={createRoom} className="w-full" size="lg">
                  <Video className="mr-2 h-5 w-5" />
                  Create New Room
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Input
                    placeholder="Enter room ID to join"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <Button onClick={joinRoom} variant="outline" className="w-full" size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    Join Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle>Room: {roomId}</CardTitle>
                    {isHost && <Badge variant="secondary">Host</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={copyRoomId}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy ID
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareRoom}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Participants: {participants.join(", ")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {isVideoOff && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <VideoOff className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary">You</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {participants.length > 1 && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Waiting for participants...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Call Controls */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleMute}
                    className="rounded-full h-12 w-12"
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleVideo}
                    className="rounded-full h-12 w-12"
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full h-12 w-12"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={leaveCall}
                    className="rounded-full h-12 w-12"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;