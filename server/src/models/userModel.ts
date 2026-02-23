import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the Interface
// This tells TypeScript what properties a User document has.
// We extend 'Document' to inherit Mongoose methods (like .save(), ._id).
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pic: string;
  isAdmin: boolean;
  lastSeen: Date; 
  favorites: mongoose.Schema.Types.ObjectId[];
  matchPassword: (enteredPassword: string) => Promise<boolean>; // Method signature
}

// 2. Define the Schema
// This tells Mongoose how to organize the data in MongoDB.
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      required: true,
      default: 
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: { 
      type: Boolean, 
      required: true, 
      default: false, 
    },
    lastSeen: { 
      type: Date, 
      default: null, 
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }]
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields 
  }
);

// 3. Encrypt Password Middleware (The "Pre-Save" Hook)
// Before saving a user to the DB, check if the password was modified.
// If yes, hash it. If no (e.g., just updating the name), skip this.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
   
  // Generate a "salt" (random data to make the hash unique)
  const salt = await bcrypt.genSalt(10);
  // Hash the password
  this.password = await bcrypt.hash(this.password, salt);
});

// 4. Instance Method: Compare Passwords
// We add a custom method to the user document to check login credentials.
// It compares the plain text password (from login form) with the hashed one in DB.
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 5. Create and Export the Model
const User = mongoose.model<IUser>("User", userSchema);
export default User;