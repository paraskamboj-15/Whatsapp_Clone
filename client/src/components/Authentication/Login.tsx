import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async () => {
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
      // 4. Handle Errors (Wrong password, etc.)
      console.error(error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      alert("Error: " + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Email Input */}
      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-600">Email Address</label>
        <input 
          type="email"
          value={email}
          placeholder="Enter your email" 
          className="p-2 border border-gray-300 rounded focus:border-whatsapp-teal outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-600">Password</label>
        <input 
          type="password"
          value={password}
          placeholder="Enter password" 
          className="p-2 border border-gray-300 rounded focus:border-whatsapp-teal outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Login Button */}
      <button 
        onClick={submitHandler}
        disabled={loading}
        className={`bg-whatsapp-teal text-white font-bold py-2 rounded hover:bg-teal-700 transition ${loading ? "opacity-50" : ""}`}
      >
        {loading ? "Loading..." : "Login"}
      </button>
      
      {/* Guest User Button (Optional Helper) */}
      <button 
        className="bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
        onClick={() => {
            setEmail("guest@example.com");
            setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </button>
    </div>
  );
};

export default Login;