import express from "express";
import { protect } from "../middleware/authMiddleware";
import { accessChat, createGroupChat, fetchChats } from "../controllers/chatControllers";

const router = express.Router();

// Notice we use 'protect' here. 
// A user CANNOT access these routes unless they are logged in.
router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);

export default router;