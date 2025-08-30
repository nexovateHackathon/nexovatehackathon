const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:9002", // <-- This is the crucial line
    methods: ["GET", "POST"],
  },
});

// In-memory object to store messages for each room
const roomMessages = {
  general: [],
  tomato: [],
  pest: [],
  organic: [],
  market: [],
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Event listener for a user joining a specific room
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);

    // Send the message history for the joined room
    socket.emit("message history", roomMessages[roomId] || []);
  });

  // Event listener for a user leaving a room
  socket.on("leave room", (roomId) => {
    socket.leave(roomId);
    console.log(`${socket.id} left room: ${roomId}`);
  });

  // Event listener for a new chat message
  //   socket.on("chat message", (msg, roomId) => {
  //     console.log(`Message from ${socket.id} in room ${roomId}:`, msg.text);

  //     // Add the new message to the room's history
  //     if (roomMessages[roomId]) {
  //       roomMessages[roomId].push(msg);
  //     }

  //     // Broadcast the message to all clients in that specific room
  //     io.to(roomId).emit("chat message", msg);
  //   });

  // Event listener for a user disconnecting
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  // This is the correct logic for your server.js file
  socket.on("chat message", (msg, roomId) => {
    // Add the new message to the room's history
    if (roomMessages[roomId]) {
      roomMessages[roomId].push(msg);
    }

    // Send the original message to the sender (isSelf: true)
    socket.emit("chat message", msg);

    // Create a copy for other users and set isSelf to false
    const otherMsg = { ...msg, isSelf: false };

    // Broadcast to everyone else in the room
    socket.broadcast.to(roomId).emit("chat message", otherMsg);
  });
});

const PORT = 5000;
server.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
