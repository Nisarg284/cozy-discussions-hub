import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Configure CORS with more detailed options
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Serve static files if needed
app.get("/", (req, res) => {
    res.send("WebRTC Signaling Server is running");
});

const server = createServer(app);
const io = new Server(server, {
    cors: { 
        origin: ["http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],  // Allow both websocket and polling
    allowEIO3: true,
    connectTimeout: 45000,
    cookie: {
        name: "io",
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    }
});

// Store active rooms and their participants
const rooms = new Map();

io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Handle connection errors
    socket.on("error", (error) => {
        console.error(`🔴 Socket Error for ${socket.id}:`, error);
    });

    socket.on("disconnect", (reason) => {
        console.log(`🔌 Client ${socket.id} disconnected: ${reason}`);
    });

    socket.on("connect_error", (error) => {
        console.error(`🔴 Connection Error for ${socket.id}:`, error.message);
    });

    // Handle room joining
    socket.on("join-room", (data) => {
        const { roomId, name } = data;
        
        // Leave previous room if any
        const previousRoom = [...socket.rooms].find(room => room !== socket.id);
        if (previousRoom) {
            socket.leave(previousRoom);
            if (rooms.has(previousRoom)) {
                rooms.get(previousRoom).delete(socket.id);
                if (rooms.get(previousRoom).size === 0) {
                    rooms.delete(previousRoom);
                }
            }
        }

        // Join new room
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(socket.id, { name });
        
        // Notify other participants
        socket.to(roomId).emit("user-joined", { id: socket.id, name });
        console.log(`👥 User ${name} (${socket.id}) joined room ${roomId}`);
        console.log(`📊 Room ${roomId} has ${rooms.get(roomId).size} participants`);
    });

    // Handle room leaving
    socket.on("leave-room", (data) => {
        const { roomId } = data;
        handleUserLeaving(socket, roomId);
    });

    // Handle WebRTC signaling
    socket.on("offer", (data) => {
        console.log(`📤 Sending offer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit("offer", {
            offer: data.offer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on("answer", (data) => {
        console.log(`📥 Sending answer from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit("answer", {
            answer: data.answer,
            roomId: data.roomId,
            from: socket.id
        });
    });

    socket.on("ice-candidate", (data) => {
        console.log(`❄️ Sending ICE candidate from ${socket.id} to room ${data.roomId}`);
        socket.to(data.roomId).emit("ice-candidate", {
            candidate: data.candidate,
            roomId: data.roomId,
            from: socket.id
        });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        // Clean up rooms
        for (const [roomId, participants] of rooms.entries()) {
            if (participants.has(socket.id)) {
                handleUserLeaving(socket, roomId);
            }
        }
    });

    function handleUserLeaving(socket, roomId) {
        if (rooms.has(roomId)) {
            const participants = rooms.get(roomId);
            const userData = participants.get(socket.id);
            
            if (userData) {
                const { name } = userData;
                participants.delete(socket.id);
                
                if (participants.size === 0) {
                    rooms.delete(roomId);
                    console.log(`🚫 Room ${roomId} deleted - no participants`);
                } else {
                    // Notify others that user left
                    socket.to(roomId).emit("user-left", { id: socket.id, name });
                    console.log(`👤 User ${name} (${socket.id}) left room ${roomId}`);
                    console.log(`📊 Room ${roomId} has ${participants.size} participants`);
                }
            }
            
            socket.leave(roomId);
        }
    }
});

const PORT = process.env.PORT || 3001;
console.log(`Starting server on port ${PORT}...`);
server.listen(PORT, () => {
    console.log(`📡 WebRTC Signaling Server running on http://localhost:${PORT}`);
    console.log('Server is ready to accept connections');
});