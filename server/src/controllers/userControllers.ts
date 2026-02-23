import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import generateToken from "../config/generateToken";
import { AuthRequest } from "../types/express"; // Import the custom type

// @description     Register new user
// @route           POST /api/user
// @access          Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id as unknown as string),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

// @description     Auth the user (Login)
// @route           POST /api/user/login
// @access          Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id as unknown as string),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @description     Get or Search all users
// @route           GET /api/user?search=
// @access          Protected
export const allUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const keyword = req.query.search
    ? {
        $or: [
          // Explicitly cast 'req.query.search' to string to satisfy TypeScript
          { name: { $regex: req.query.search as string, $options: "i" } },
          { email: { $regex: req.query.search as string, $options: "i" } },
        ],
      }
    : {};

  // Check if req.user is defined before accessing _id
  if (!req.user) {
     res.status(401);
     throw new Error("Not authorized");
  }

  // Combine the search keyword with the ID exclusion in a single find() call
  // This is cleaner and avoids chaining .find() which can sometimes confuse TS types
  const users = await User.find({ ...keyword, _id: { $ne: req.user._id } });
  
  res.send(users);
});

// @description     Update User Profile
// @route           PUT /api/user/profile
// @access          Protected
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  // 1. Find the current logged-in user
  const user = await User.findById(req.user._id);

  if (user) {
    // 2. Update Name and Pic if provided
    user.name = req.body.name || user.name;
    user.pic = req.body.pic || user.pic;

    // 3. Update Email (with duplicate check)
    // If the user sends an email AND it's different from their current one
    if (req.body.email && req.body.email !== user.email) {
       const emailExists = await User.findOne({ email: req.body.email });
       if (emailExists) {
         res.status(400);
         throw new Error("Email is already in use by another account");
       }
       user.email = req.body.email;
    }

    // 4. Update Password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // 5. Save the updated user
    const updatedUser = await user.save();

    // 6. Send back the updated data (including a fresh token)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id as unknown as string),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @description     Toggle Favorite Chat
// @route           PUT /api/user/favorites
// @access          Protected
export const toggleFavoriteChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { chatId } = req.body;
  
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    // Check if chat is already in favorites
    const isFavorited = user.favorites.includes(chatId as any);

    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter((id) => id.toString() !== chatId);
    } else {
      // Add to favorites
      user.favorites.push(chatId as any);
    }

    const updatedUser = await user.save();
    res.json({ favorites: updatedUser.favorites });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});