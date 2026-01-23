import { Response } from "express";
import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import { AuthRequest } from "../types/express"; // Import the custom type

// @description     Create or fetch One-on-One Chat
// @route           POST /api/chat
// @access          Protected
export const accessChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    res.sendStatus(400);
    return;
  }

  // 1. Find the chat
  let isChat: any = await Chat.find({
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
    const chatData = {
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
export const fetchChats = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // FIX: Explicitly type 'results' as 'any' to prevent the 
    // "Type 'IUser[]' is not assignable to type 'IChat[]'" error later.
    let results: any = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Now TypeScript allows this assignment because results is 'any'
    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @description     Create New Group Chat
// @route           POST /api/chat/group
// @access          Protected
export const createGroupChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: "Please Fill all the fields" });
    return;
  }

  const users = JSON.parse(req.body.users);

  if (users.length < 0) {
    res.status(400).send("More than 0 users are required to form a group chat");
    return;
  }

  // Add the currently logged-in user (the admin)
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

// @description     Rename Group
// @route           PUT /api/chat/rename
// @access          Protected
export const renameGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @description     Add user to Group
// @route           PUT /api/chat/groupadd
// @access          Protected
export const addToGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

// @description     Remove user from Group
// @route           PUT /api/chat/groupremove
// @access          Protected
export const removeFromGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @description     Delete Group
// @route           DELETE /api/chat/group/:id
// @access          Protected
export const deleteGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const chat = await Chat.findById(id);

    // Optional: Only allow Admin to delete
    if(chat && chat.groupAdmin?.toString() !== req.user._id.toString()){
        res.status(401);
        throw new Error("Only admins can delete the group");
    }

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    await Chat.findByIdAndDelete(id);
    res.json({ message: "Group Deleted Successfully" });
});