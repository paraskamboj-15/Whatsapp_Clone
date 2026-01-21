import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";

const ProfileModal = ({ user, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user: loggedUser, setUser } = ChatState();

  // Initialize modal with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPic(user.pic);
    }
  }, [user, isOpen]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${loggedUser.token}` } };
      const { data } = await axios.put("/api/user/profile", { name, pic }, config);

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setLoading(false);
      setIsOpen(false);
      alert("Profile Updated!");
    } catch (error) {
      setLoading(false);
      alert("Error Updating Profile");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative flex flex-col items-center">
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-4 text-2xl text-gray-500">&times;</button>
            <h1 className="text-2xl font-bold mb-4">{loggedUser._id === user._id ? "Edit Profile" : "User Profile"}</h1>
            <img src={pic} alt={name} className="w-24 h-24 rounded-full mb-4 object-cover border" />
            
            {loggedUser._id === user._id ? (
                <>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded mb-4 w-full" placeholder="Enter Name" />
                    {/* (Optional: Add Image Upload Input Here similar to Signup) */}
                    <button onClick={updateProfile} disabled={loading} className="bg-whatsapp-green text-white px-4 py-2 rounded font-bold hover:bg-green-600">
                        {loading ? "Updating..." : "Update"}
                    </button>
                </>
            ) : (
                <>
                    <h2 className="text-xl">{name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;