import { Request } from "express";
import { IUser } from "../models/userModel"; // Assuming you have an IUser interface exported from your model

// Extends standard Express Request to include our 'user' object
export interface AuthRequest extends Request {
  user?: IUser | any; 
}