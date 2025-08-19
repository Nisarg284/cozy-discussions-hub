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
import { io, Socket } from "socket.io-client";

const VideoCall = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    // Initialize WebRTC configuration
    initializeWebRTC();
    
    return () => {
      cleanup();
    };
  }, [isAuthenticated, navigate]);

  const initializeWebRTC = () => {
    // Connect to local signaling server
    console.log('Attempting to connect to signaling server at http://localhost:3001');
    try {
      // Try multiple server URLs with different protocols and ports
      const serverUrls = [
        'http://localhost:3001', 
        'http://127.0.0.1:3001',
        'ws://localhost:3001',
        'ws://127.0.0.1:3001'
      ];
      let connectionAttempt = 0;
      
      const tryConnect = () => {
        if (connectionAttempt >= serverUrls.length) {
          console.error('Failed to connect to any server URL');
          toast.error('Could not connect to video call server after trying all URLs');
          return;
        }
        
        const serverUrl = serverUrls[connectionAttempt];
        console.log(`Attempt ${connectionAttempt + 1}: Connecting to ${serverUrl}`);
        
        socketRef.current = io(serverUrl, {
          transports: ['websocket', 'polling'],  // Try both transport methods
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 20000,
          forceNew: true,
          autoConnect: true
        });
        
        socketRef.current.on('connect', () => {
          console.log('Connected to signaling server with ID:', socketRef.current?.id);
          console.log('Using server URL:', serverUrl);
          toast.success('Connected to video call server');
        });
        
        socketRef.current.on('connect_error', (error) => {
          console.error(`Connection error to ${serverUrl}:`, error);
          connectionAttempt++;
          socketRef.current?.close();
          
          if (connectionAttempt < serverUrls.length) {
            console.log(`Trying next server URL: ${serverUrls[connectionAttempt]}`);
            setTimeout(tryConnect, 1000);
          } else {
            toast.error(`Failed to connect to video call server: ${error.message}`);
          }
        });
      };
      
      tryConnect();
      
      // Set up other event handlers
      if (socketRef.current) {
        socketRef.current.on('connect_timeout', () => {
          console.error('Connection timeout');
          toast.error('Connection to video call server timed out');
        });
        
        socketRef.current.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Attempting to reconnect (${attemptNumber})...`);
        });
        
        socketRef.current.on('reconnect_failed', () => {
          console.error('Failed to reconnect after multiple attempts');
          toast.error('Could not reconnect to video call server');
        });
      }
    } catch (error) {
      console.error('Error initializing socket connection:', error);
      toast.error(`Socket initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    socketRef.current.on('user-joined', (data) => {
      console.log('User joined event received:', data);
      try {
        if (!data || !data.name) {
          console.warn('Received user-joined event with invalid data:', data);
          toast.info('Someone joined the call');
          setParticipants(prev => [...prev, 'Unknown User']);
          return;
        }
        
        toast.info(`${data.name} joined the call`);
        console.log(`${data.name} joined room ${roomId}`);
        setParticipants(prev => {
          // Avoid duplicate entries
          if (prev.includes(data.name)) {
            console.log(`${data.name} already in participants list`);
            return prev;
          }
          return [...prev, data.name];
        });
      } catch (error) {
        console.error('Error handling user-joined event:', error);
      }
    });
    
    socketRef.current.on('user-left', (data) => {
      console.log('User left event received:', data);
      try {
        if (!data || !data.name) {
          console.warn('Received user-left event with invalid data:', data);
          toast.info('Someone left the call');
          return;
        }
        
        toast.info(`${data.name} left the call`);
        console.log(`${data.name} left room ${roomId}`);
        
        setParticipants(prev => {
          const updatedParticipants = prev.filter(p => p !== data.name);
          console.log('Updated participants list:', updatedParticipants);
          return updatedParticipants;
        });
        
        // If remote user left, clear remote video
        if (data.name !== 'You' && data.name !== 'You (Host)' && remoteVideoRef.current?.srcObject) {
          console.log('Clearing remote video stream');
          remoteVideoRef.current.srcObject = null;
        }
      } catch (error) {
        console.error('Error handling user-left event:', error);
      }
    });
    
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    
    const peerConnection = new RTCPeerConnection(configuration);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };
    
    peerConnection.ontrack = (event) => {
      console.log('ontrack event triggered:', event);
      if (event.streams && event.streams.length > 0) {
        console.log('Remote stream received with tracks:', event.streams[0].getTracks().length);
        remoteStreamRef.current = event.streams[0];
        
        if (remoteVideoRef.current) {
          console.log('Setting remote video source');
          remoteVideoRef.current.srcObject = event.streams[0];
          
          // Ensure the video plays
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log('Remote video metadata loaded, playing video');
            remoteVideoRef.current?.play().catch(e => {
              console.error('Error playing remote video:', e);
            });
          };
        } else {
          console.warn('Remote video element reference not available');
        }
        
        setParticipants(prev => prev.length < 2 ? [...prev, "Remote User"] : prev);
      } else {
        console.warn('Received ontrack event but no streams available', event);
      }
    };
    
    peerConnection.onconnectionstatechange = (event) => {
      console.log('Connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        console.log('Peer connection successfully established');
      } else if (peerConnection.connectionState === 'failed' || 
                 peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'closed') {
        console.warn('Peer connection state problem:', peerConnection.connectionState);
      }
    };
    
    peerConnection.onicecandidateerror = (event) => {
      console.error('ICE candidate error:', event);
    };
    
    return peerConnection;
  };

  const handleOffer = async (data: any) => {
    console.log('Received offer from:', data.from);
    try {
      if (!peerConnectionRef.current) {
        console.log('Creating new peer connection for offer');
        peerConnectionRef.current = createPeerConnection();
      }
      
      if (!data.offer) {
        throw new Error('Received invalid offer: offer data is missing');
      }
      
      // Ensure we have a valid RTCSessionDescription
      const offerDescription = new RTCSessionDescription(data.offer);
      await peerConnectionRef.current.setRemoteDescription(offerDescription);
      console.log('Remote description set successfully from offer');
      
      if (localStreamRef.current) {
        console.log('Adding local tracks to peer connection');
        
        if (localStreamRef.current.getTracks().length === 0) {
          console.error('No tracks found in local stream when handling offer');
          toast.error('No camera or microphone tracks available');
        }
        
        try {
          localStreamRef.current.getTracks().forEach(track => {
            const sender = peerConnectionRef.current!.addTrack(track, localStreamRef.current!);
            console.log(`Added ${track.kind} track to peer connection`, sender);
          });
        } catch (error) {
          console.error('Error adding tracks to peer connection:', error);
          toast.error('Failed to setup media connection');
        }
      } else {
        console.warn('No local stream available when handling offer');
        toast.error('Cannot connect: No camera or microphone access');
      }
      
      console.log('Creating answer...');
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('Local description set successfully');
      
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending answer to:', data.from);
        socketRef.current.emit('answer', {
          roomId: data.roomId,
          answer,
          to: data.from
        });
      } else {
        throw new Error('Socket not connected when trying to send answer');
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error(`Error handling offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAnswer = async (data: any) => {
    console.log('Received answer from:', data.from);
    try {
      if (!peerConnectionRef.current) {
        throw new Error('PeerConnection not initialized when receiving answer');
      }
      
      if (!data.answer) {
        throw new Error('Received invalid answer: answer data is missing');
      }
      
      // Ensure we have a valid RTCSessionDescription
      const answerDescription = new RTCSessionDescription(data.answer);
      await peerConnectionRef.current.setRemoteDescription(answerDescription);
      console.log('Remote description set successfully from answer');
    } catch (error) {
      console.error('Error handling answer:', error);
      toast.error(`Error handling answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleIceCandidate = async (data: any) => {
    console.log('Received ICE candidate from:', data.from);
    try {
      if (!peerConnectionRef.current) {
        throw new Error('PeerConnection not initialized when receiving ICE candidate');
      }
      
      if (!data.candidate) {
        console.log('Received empty ICE candidate, ignoring');
        return;
      }
      
      // Ensure we have a valid RTCIceCandidate
      const iceCandidate = new RTCIceCandidate(data.candidate);
      console.log(`Adding ICE candidate for ${data.candidate.sdpMid || 'unknown'} mline ${data.candidate.sdpMLineIndex || 'unknown'}`);
      
      await peerConnectionRef.current.addIceCandidate(iceCandidate);
      console.log('Added ICE candidate successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      toast.error(`Error with ICE candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Connection issue: Failed to process network information');
    }
  };

  const startLocalVideo = async () => {
    try {
      console.log('Requesting camera and microphone access...');
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not supported in this browser');
        toast.error('Your browser does not support video calls');
        return null;
      }
      
      // First try to get both video and audio
      try {
        console.log('Trying to access both camera and microphone...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        console.log('Successfully accessed both camera and microphone');
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        console.log(`Got ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`);
        if (videoTracks.length > 0) {
          console.log('Using video device:', videoTracks[0].label);
        }
        if (audioTracks.length > 0) {
          console.log('Using audio device:', audioTracks[0].label);
        }
        
        if (localVideoRef.current) {
          console.log('Setting local video source');
          localVideoRef.current.srcObject = stream;
        } else {
          console.warn('Local video element reference not available');
        }
        
        localStreamRef.current = stream;
        return stream;
      } catch (initialError) {
        console.warn('Failed to get both camera and microphone:', initialError);
        
        // If we can't get both, try just video
        try {
          console.log('Trying to access just camera...');
          const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          console.log('Successfully accessed camera only');
          toast.warning('Microphone access failed. Video call will proceed without audio.');
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = videoOnlyStream;
          }
          
          localStreamRef.current = videoOnlyStream;
          return videoOnlyStream;
        } catch (videoError) {
          console.warn('Failed to get camera access:', videoError);
          
          // If we can't get video, try just audio
          try {
            console.log('Trying to access just microphone...');
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            });
            
            console.log('Successfully accessed microphone only');
            toast.warning('Camera access failed. Video call will proceed with audio only.');
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = audioOnlyStream;
            }
            
            // Set video off state since we don't have video
            setIsVideoOff(true);
            
            localStreamRef.current = audioOnlyStream;
            return audioOnlyStream;
          } catch (audioError) {
            console.error('Failed to get any media access');
            throw new Error('Could not access camera or microphone');
          }
        }
      }
    } catch (error: any) {
      console.error("Error accessing camera/microphone:", error);
      
      // Provide more specific error messages based on the error name
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error("Camera or microphone access denied. Please allow access in your browser settings.");
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error("No camera or microphone found. Please connect a device and try again.");
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        toast.error("Could not access your camera or microphone. It may be in use by another application.");
      } else if (error.name === 'OverconstrainedError') {
        toast.error("Your camera does not meet the required constraints.");
      } else if (error.name === 'TypeError') {
        toast.error("Invalid media constraints specified.");
      } else {
        toast.error(`Cannot access camera or microphone: ${error.message || 'Unknown error'}`);
      }
      
      return null;
    }
  };

  const createRoom = async () => {
    try {
      const newRoomId = Math.random().toString(36).substr(2, 9);
      setRoomId(newRoomId);
      setIsHost(true);
      setIsConnecting(true);
      
      // Check socket connection first
      if (!socketRef.current || !socketRef.current.connected) {
        console.error('Socket not connected when creating room');
        toast.error("Not connected to signaling server. Please refresh the page and try again.");
        setIsConnecting(false);
        return;
      }
      
      console.log('Attempting to access camera and microphone...');
      const stream = await startLocalVideo();
      
      if (!stream) {
        console.error('Failed to get local media stream');
        toast.error("Could not access camera or microphone. Please check your device permissions.");
        setIsConnecting(false);
        return;
      }
      
      console.log('Creating room with ID:', newRoomId);
      socketRef.current.emit('join-room', {
        roomId: newRoomId,
        name: 'Host'
      });
      
      // Initialize peer connection
      if (!peerConnectionRef.current) {
        console.log('Creating new peer connection for host');
        peerConnectionRef.current = createPeerConnection();
        console.log('Peer connection created for host');
        
        // Add local tracks to peer connection
        if (stream.getTracks().length === 0) {
          console.error('No tracks found in local stream for host');
          toast.error('No camera or microphone tracks available');
        }
        
        try {
          stream.getTracks().forEach(track => {
            const sender = peerConnectionRef.current!.addTrack(track, stream);
            console.log(`Host added ${track.kind} track to peer connection`, sender);
          });
        } catch (error) {
          console.error('Error adding tracks to host peer connection:', error);
          toast.error('Failed to setup media connection');
        }
      }
      
      setIsInCall(true);
      setIsConnecting(false);
      setParticipants(["You (Host)"]);
      toast.success("Video call room created!");
      console.log('Room creation complete, waiting for participants...');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(`Error creating room: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const joinRoom = async () => {
    try {
      if (!roomId.trim()) {
        toast.error("Please enter a room ID");
        return;
      }
      
      setIsConnecting(true);
      
      // Check socket connection first
      if (!socketRef.current || !socketRef.current.connected) {
        console.error('Socket not connected when joining room');
        toast.error("Not connected to signaling server. Please refresh the page and try again.");
        setIsConnecting(false);
        return;
      }
      
      console.log('Attempting to access camera and microphone...');
      const stream = await startLocalVideo();
      
      if (!stream) {
        console.error('Failed to get local media stream');
        toast.error("Could not access camera or microphone. Please check your device permissions.");
        setIsConnecting(false);
        return;
      }
      
      console.log('Joining room with ID:', roomId);
      socketRef.current.emit('join-room', {
        roomId,
        name: 'User'
      });
      
      // Create peer connection and make offer
      if (!peerConnectionRef.current) {
        console.log('Creating new peer connection for joining user');
        peerConnectionRef.current = createPeerConnection();
        console.log('Peer connection created for joining user');
      }
      
      console.log('Adding local tracks to peer connection');
      if (stream.getTracks().length === 0) {
        console.error('No tracks found in local stream');
        toast.error('No camera or microphone tracks available');
      }
      
      try {
        stream.getTracks().forEach(track => {
          const sender = peerConnectionRef.current!.addTrack(track, stream);
          console.log(`Added ${track.kind} track to peer connection`, sender);
        });
      } catch (error) {
        console.error('Error adding tracks to peer connection:', error);
        toast.error('Failed to setup media connection');
      }
      
      console.log('Creating offer...');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Local description set, sending offer');
      
      socketRef.current.emit('offer', {
        roomId,
        offer,
        from: socketRef.current.id
      });
      console.log('Offer sent to room:', roomId);
      
      setIsInCall(true);
      setIsConnecting(false);
      setParticipants(["You"]);
      toast.success("Joined video call!");
      console.log('Successfully joined room, waiting for other participants...');
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(`Error joining room: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const leaveCall = () => {
    try {
      console.log('Leaving call, room ID:', roomId);
      
      if (!roomId) {
        console.warn('Attempting to leave call but no room ID is set');
      }
      
      // Stop all local tracks
      if (localStreamRef.current) {
        console.log('Stopping all local tracks...');
        localStreamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
            console.log('Stopped local track:', track.kind);
          } catch (trackError) {
            console.error('Error stopping track:', trackError);
          }
        });
        localStreamRef.current = null;
      } else {
        console.log('No local stream to clean up');
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        try {
          const connectionState = peerConnectionRef.current.connectionState;
          console.log(`Closing peer connection (current state: ${connectionState})`);
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
          console.log('Closed peer connection');
        } catch (peerError) {
          console.error('Error closing peer connection:', peerError);
        }
      }
      
      // Notify server
      if (socketRef.current && socketRef.current.connected) {
        console.log('Notifying server about leaving room:', roomId);
        socketRef.current.emit('leave-room', { roomId });
        console.log('Sent leave-room event to server');
      } else {
        console.log('Socket not connected, skipping leave-room notification');
      }
      
      // Clear video elements
      if (localVideoRef.current) {
        console.log('Clearing local video element');
        localVideoRef.current.srcObject = null;
      }
      
      if (remoteVideoRef.current) {
        console.log('Clearing remote video element');
        remoteVideoRef.current.srcObject = null;
      }
      
      // Reset state
      console.log('Resetting application state');
      setIsInCall(false);
      setRoomId("");
      setIsHost(false);
      setParticipants([]);
      setIsMuted(false);
      setIsVideoOff(false);
      remoteStreamRef.current = null;
      
      toast.info("Left the call");
      console.log('Successfully left the call');
    } catch (error) {
      console.error('Error leaving call:', error);
      toast.error(`Error leaving call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Force reset state even if there was an error
      setIsInCall(false);
      setRoomId("");
      setIsHost(false);
      setParticipants([]);
    }
  };

  const toggleMute = () => {
    try {
      if (!localStreamRef.current) {
        console.warn('Cannot toggle mute: No local stream available');
        toast.error('Cannot access microphone');
        return;
      }
      
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn('No audio tracks found in local stream');
        toast.error('No microphone detected');
        return;
      }
      
      const audioTrack = audioTracks[0];
      console.log(`Toggling audio: ${isMuted ? 'unmuting' : 'muting'}`);
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error(`Could not ${isMuted ? 'unmute' : 'mute'} microphone`);
    }
  };

  const toggleVideo = () => {
    try {
      if (!localStreamRef.current) {
        console.warn('Cannot toggle video: No local stream available');
        toast.error('Cannot access camera');
        return;
      }
      
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length === 0) {
        console.warn('No video tracks found in local stream');
        toast.error('No camera detected');
        return;
      }
      
      const videoTrack = videoTracks[0];
      console.log(`Toggling video: ${isVideoOff ? 'enabling' : 'disabling'}`);
      videoTrack.enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
      toast.success(isVideoOff ? 'Camera turned on' : 'Camera turned off');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error(`Could not ${isVideoOff ? 'enable' : 'disable'} camera`);
    }
  };

  const copyRoomId = () => {
    try {
      if (!roomId) {
        console.warn('Cannot copy room ID: No room ID available');
        toast.error('No room ID available to copy');
        return;
      }
      
      navigator.clipboard.writeText(roomId)
        .then(() => {
          console.log('Room ID copied to clipboard:', roomId);
          toast.success("Room ID copied to clipboard!");
        })
        .catch((error) => {
          console.error('Failed to copy room ID:', error);
          toast.error('Failed to copy room ID. Please try again.');
        });
    } catch (error) {
      console.error('Error copying room ID:', error);
      toast.error('Failed to copy room ID');
    }
  };

  const shareRoom = () => {
    try {
      if (!roomId) {
        console.warn('Cannot share room: No room ID available');
        toast.error('No room available to share');
        return;
      }
      
      const shareUrl = `${window.location.origin}/video-call?room=${roomId}`;
      console.log('Generating share URL:', shareUrl);
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          console.log('Room link copied to clipboard');
          toast.success("Room link copied to clipboard!");
        })
        .catch((error) => {
          console.error('Failed to copy room link:', error);
          toast.error('Failed to copy room link. Please try again.');
        });
    } catch (error) {
      console.error('Error sharing room:', error);
      toast.error('Failed to share room');
    }
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
                <Button 
                  onClick={createRoom} 
                  className="w-full" 
                  size="lg"
                  disabled={isConnecting}
                >
                  <Video className="mr-2 h-5 w-5" />
                  {isConnecting ? "Creating..." : "Create New Room"}
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
                  <Button 
                    onClick={joinRoom} 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    disabled={isConnecting}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    {isConnecting ? "Joining..." : "Join Room"}
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

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-800 relative">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!remoteStreamRef.current && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">
                            {participants.length > 1 ? "Connecting..." : "Waiting for participants..."}
                          </p>
                        </div>
                      </div>
                    )}
                    {remoteStreamRef.current && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary">Remote User</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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