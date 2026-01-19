import express from "express";
import { allMessages, sendMessage } from "../controllers/messageControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route to send a message
router.route("/").post(protect, sendMessage);

// Route to fetch all messages for a specific chat ID
router.route("/:chatId").get(protect, allMessages);

export default router;