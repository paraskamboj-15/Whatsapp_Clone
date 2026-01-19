import { Response } from "express";
import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel";
import User from "../models/userModel";

// We need to use 'any' for the Request type temporarily to access req.user easily 
// or import the custom AuthRequest interface we made above.
// For simplicity here, I'll assume req has user.

// @description     Create or fetch One-on-One Chat
// @route           POST /api/chat
// @access          Protected
export const accessChat = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    res.sendStatus(400);
    return;
  }

  // 1. Find the chat
  var isChat: any = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  // Populate the 'sender' of the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // 2. If chat exists, return it
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // 3. If no chat, create a new one
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error((error as Error).message);
    }
  }
});

// @description     Fetch all chats for a user
// @route           GET /api/chat
// @access          Protected
export const fetchChats = asyncHandler(async (req: any, res: Response) => {
  try {
    // Find all chats where the current user is a part of the 'users' array
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // Sort by newest first
      .then(async (results: any) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});


// @description     Create New Group Chat
export const createGroupChat = asyncHandler(async (req: any, res: Response) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please Fill all the fields" });
    return;
  }

  // Frontend sends users as a JSON string string, so we parse it
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400).send("More than 2 users are required to form a group chat");
    return;
  }

  // Add the currently logged-in user (the admin) to the list
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @description     Rename Group (Optional - add later)
export const renameGroup = asyncHandler(async (req: any, res: Response) => {
    // We can add this logic later if you want full admin controls!
    res.json({ message: "Rename feature coming soon" });
});