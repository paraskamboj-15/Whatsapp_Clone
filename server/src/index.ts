import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import { Server } from "socket.io"; 

dotenv.config();
connectDB();

const app = express();

// --------------------------
// 1. SECURITY (CORS) SETUP
// --------------------------
// This allows your Netlify Frontend to talk to this Backend
app.use(cors({
  origin: [
    "http://localhost:5173",                 // Localhost (for development)
    "https://wwhhaattssaapppp.netlify.app"   // Your Netlify URL (Production)
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("wwhhaattssaapppp API is running Successfully");
});

// --------------------------
// 2. API ROUTES
// --------------------------
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// --------------------------
// 3. START SERVER
// --------------------------
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --------------------------
// 4. SOCKET.IO SETUP
// --------------------------
const io = new Server(server, {
  pingTimeout: 60000, // Close connection if user is inactive for 60s
  cors: {
    // Must match the origins above EXACTLY
    origin: [
        "http://localhost:5173", 
        "https://wwhhaattssaapppp.netlify.app"
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Setup: User joins their own room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join Chat Room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // Typing Indicators
  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  // Sending a Message
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user: any) => {
      // Don't send the message back to the sender
      if (user._id == newMessageRecieved.sender._id) return;

      // Send to the specific user's room
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });
  
  // Clean up
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.disconnect();
  });
});