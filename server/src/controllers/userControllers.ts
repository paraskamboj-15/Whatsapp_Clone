import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import generateToken from "../config/generateToken";

// @description     Register new user
// @route           POST /api/user
// @access          Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, pic } = req.body;

  // 1. Validation: Check if fields are empty
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // 3. Create the new user
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  // 4. If successful, send back the user data + the TOKEN
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

  // 1. Find user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists AND if password matches
  // (We use the matchPassword method we created in the Model earlier!)
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
export const allUsers = asyncHandler(async (req: any, res: Response) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } }, // "i" means case-insensitive
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // Find users matching the keyword, BUT exclude the currently logged in user ($ne = not equal)
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});