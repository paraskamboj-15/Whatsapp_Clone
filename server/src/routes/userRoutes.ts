import express from "express";
import { 
  registerUser, 
  authUser, 
  allUsers, 
  updateUserProfile 
} from "../controllers/userControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Registration and Search (Search is protected)
router.route("/").post(registerUser).get(protect, allUsers);
// Login
router.post("/login", authUser);
// Profile Update (Protected)
router.route("/profile").put(protect, updateUserProfile);

export default router;