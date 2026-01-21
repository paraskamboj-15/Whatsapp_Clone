import express from "express";
import { allMessages, deleteMessage, editMessage, markMessagesAsRead, sendMessage } from "../controllers/messageControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route to send a message
router.route("/").post(protect, sendMessage);

// Route to fetch all messages for a specific chat ID
router.route("/:chatId").get(protect, allMessages);
router.route("/read").put(protect, markMessagesAsRead);
router.route("/:id").put(protect, editMessage).delete(protect, deleteMessage);

export default router;