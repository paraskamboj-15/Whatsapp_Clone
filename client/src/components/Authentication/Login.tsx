import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async () => {
    if (loading) return;
    setLoading(true);

    // 1. Validation
    if (!email || !password) {
      alert("Please Fill all the Fields");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // 2. The API Call (Talking to the Backend)
         const { data } = await axios.post(
          "/api/user/login", 
          { email, password }, 
          config
        );

      // 3. Success! Save user data locally
      alert("Login Successful");
      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);
      navigate("/chats"); // Go to the app!

    } catch (error: any) {
      // 4. Handle Error ( Invalid credentials)
      const errorMessage = error.response?.data?.message || "An error occurred";
      alert("Error: " + errorMessage);
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (guestLoading) return;
    setGuestLoading(true);

    setEmail("");
    setPassword("");

    const guestEmail = "test@gmail.com";
    const guestPassword = "Test@123";

    for (let i = 0; i <= guestEmail.length; i++) {
      await new Promise((res) => setTimeout(res, 50));
      setEmail(guestEmail.slice(0, i));
    }

    for (let i = 0; i <= guestPassword.length; i++) {
      await new Promise((res) => setTimeout(res, 50));
      setPassword(guestPassword.slice(0, i));
    }

    setGuestLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-600">Email Address</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          className="p-2 border border-gray-300 rounded focus:border-whatsapp-teal outline-none transition"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter password"
          className="p-2 border border-gray-300 rounded focus:border-whatsapp-teal outline-none transition"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={submitHandler}
        disabled={loading}
        className={`relative w-full py-3 rounded-xl font-bold text-white overflow-hidden transition-all duration-300
          ${loading ? "bg-whatsapp-teal/70 cursor-not-allowed" : "bg-whatsapp-teal hover:bg-teal-700 active:scale-[0.98]"}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging in...
          </div>
        ) : (
          "Login"
        )}
      </button>

      {/* Guest Button */}
      <button
        onClick={handleGuestLogin}
        disabled={guestLoading}
        className={`relative w-full py-3 rounded-xl font-medium border border-whatsapp-teal overflow-hidden transition-all duration-300
          ${guestLoading ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-whatsapp-teal hover:bg-whatsapp-teal/10 active:scale-[0.98]"}`}
      >
        {guestLoading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin" />
            Fetching Guest Credentials...
          </div>
        ) : (
          "Get Guest User Credentials"
        )}
      </button>
    </div>
  );
};

export default Login;