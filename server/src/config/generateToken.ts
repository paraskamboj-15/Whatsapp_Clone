import jwt from "jsonwebtoken";

const generateToken = (id: string): string => {
  // sign() creates the token
  // 1st arg: Payload (data we want to hide in the token, usually user ID)
  // 2nd arg: Secret Key (from .env - keep this safe!)
  // 3rd arg: Options (expires in 30 days)
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

export default generateToken;