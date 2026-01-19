import express from "express";
import { registerUser, authUser, allUsers } from "../controllers/userControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route for registration
// Chain the methods: POST to register, GET to search (but protect it!)
router.route("/").post(registerUser).get(protect, allUsers);
// Route for login
router.post("/login", authUser);

export default router;