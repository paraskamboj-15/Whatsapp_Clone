import { Response } from "express";
import asyncHandler from "express-async-handler";
import Message from "../models/messageModel";
import User from "../models/userModel";
import Chat from "../models/chatModel";

// @description     Get all Messages
// @route           GET /api/message/:chatId
// @access          Protected
export const allMessages = asyncHandler(async (req: any, res: Response) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
      
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @description     Create New Message
// @route           POST /api/message
// @access          Protected
export const sendMessage = asyncHandler(async (req: any, res: Response) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    res.sendStatus(400);
    return;
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message: any = await Message.create(newMessage);

    // Populate sender details (name, pic) so frontend can show it immediately
    message = await message.populate("sender", "name pic");
    
    // Populate chat details
    message = await message.populate("chat");
    
    // Deep populate the users inside the chat object
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the Chat model's 'latestMessage' field
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @description     Mark all messages in a chat as read
// @route           PUT /api/message/read
// @access          Protected
export const markMessagesAsRead = asyncHandler(async (req: any, res: Response) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("ChatId is required");
  }

  // Update all messages in this chat where the user is NOT in the readBy array
  await Message.updateMany(
    { chat: chatId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  res.status(200).json({ message: "Messages marked as read" });
});

// @description     Edit a message
// @route           PUT /api/message/:id
export const editMessage = asyncHandler(async (req: any, res: Response) => {
  const { content } = req.body;
  const messageId = req.params.id;

  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Check if the user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can only edit your own messages");
  }

  message.content = content;
  message.isEdited = true; // Flag it as edited
  // @ts-ignore
  const updatedMessage = await message.save();
  
  // Populate for frontend
  const fullMessage = await Message.findById(updatedMessage._id)
      .populate("sender", "name pic email")
      .populate("chat");

  res.json(fullMessage);
});

// @description     Delete a message
// @route           DELETE /api/message/:id
export const deleteMessage = asyncHandler(async (req: any, res: Response) => {
  const messageId = req.params.id;
  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can only delete your own messages");
  }

  await message.deleteOne();
  res.json({ message: "Message removed" });
});