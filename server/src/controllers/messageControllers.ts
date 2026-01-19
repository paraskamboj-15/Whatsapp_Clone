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