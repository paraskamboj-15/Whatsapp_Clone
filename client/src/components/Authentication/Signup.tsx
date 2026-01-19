import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState<any>();
  
  
  const navigate = useNavigate();

  const postDetails = (pics: any) => {
    setLoading(true);
    if (pics === undefined) {
      alert("Please Select an Image!");
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET); 
      data.append("cloud_name", import.meta.env.VITE_CLOUD_NAME); 

      fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`, { 
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
          console.log(data.url.toString()); // Verify URL in console
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      alert("Please Select an Image (jpeg or png)");
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    setLoading(true);

    // 1. Validation
    if (!name || !email || !password || !confirmpassword) {
      alert("Please Fill all the Fields");
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      alert("Passwords Do Not Match");
      setLoading(false);
      return;
    }

    // 2. API Call
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // Sending data to our Backend
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic: pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" },
        config
      );

      // 3. Success! Save user data and redirect
      alert("Registration Successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      
      setLoading(false);
      navigate("/chats"); // Go to Chat Page

    } catch (error: any) {
      // 4. Handle Error (e.g., User already exists)
      console.error(error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      alert("Error: " + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Name Input */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Name</label>
        <input 
          type="text" 
          placeholder="Enter Your Name" 
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-whatsapp-teal"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Email Input */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <input 
          type="email" 
          placeholder="Enter Your Email" 
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-whatsapp-teal"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          placeholder="Enter Password" 
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-whatsapp-teal"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Confirm Password Input */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
        <input 
          type="password" 
          placeholder="Confirm Password" 
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-whatsapp-teal"
          onChange={(e) => setConfirmpassword(e.target.value)}
        />
      </div>

      {/* Picture Input */}
      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-600">Upload Picture</label>
        <input 
          type="file"
          accept="image/*"
          className="p-1 border border-gray-300 rounded outline-none"
          onChange={(e: any) => postDetails(e.target.files[0])}
        />
      </div>

      {/* Submit Button */}
      <button 
        onClick={submitHandler}
        disabled={loading}
        className={`bg-whatsapp-green text-white font-bold py-2 rounded-md hover:bg-green-600 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Uploading Image..." : "Sign Up"}
      </button>
    </div>
  );
};

export default Signup;