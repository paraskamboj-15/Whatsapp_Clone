import mongoose from "mongoose";

// Function to connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    // 1. Get the connection string from environment variables
    // It's crucial to use env vars so we don't expose passwords in code
    const connString = process.env.MONGO_URI || "";

    if (!connString) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    // 2. Attempt connection
    const conn = await mongoose.connect(connString);

    // 3. Log success with the host name (helps debugging)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // 4. If connection fails, log the error and stop the server
    // process.exit(1) means "exit with failure"
    console.error(`❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;