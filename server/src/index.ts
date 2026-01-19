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

/* Enable CORS for Express */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://wwhhaattssaapppp.netlify.app"
  ],
  credentials: true,
}));

// app.options("/*", cors()); 

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// 1. Assign the server to a variable
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 2. Initialize Socket.io
const io = new Server(server, {
  pingTimeout: 60000, // Close connection if user is inactive for 60s
  cors: {
    origin: ["http://localhost:5173", "https://wwhhaattssaapppp.netlify.app/"], // Your Frontend URL
    credentials: true,
  },
});

// 3. Define Socket Logic
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Create a customized "room" for the user when they join
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Joining a Chat Room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

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