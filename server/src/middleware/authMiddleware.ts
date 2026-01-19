import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/userModel";

// Extend the Express Request interface to include our User
// This fixes the "property user does not exist on type Request" error in TS
interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token from the header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // Find the user in the DB and attach it to the request object
      // We exclude the password (-password) because we don't need it
      req.user = await User.findById(decoded.id).select("-password") as IUser;

      next(); // Move to the actual controller
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
