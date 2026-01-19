import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './GroupChatModal';

const MyChats = ({ fetchAgain }: any) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    // console.log("User object:", user); // Debug 1
    // console.log("Token being sent:", user?.token); // Debug 2
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // console.log("Config headers:", config); // Debug 3
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      // console.log("Full error details:", error); // Debug 4
      alert("Failed to Load the chats");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo") as string));

    // Only try to fetch chats if the user token is actually ready
    if (user) fetchChats();
  }, [user, fetchAgain]);

  return (
    <div className={`flex flex-col p-3 bg-white w-full md:w-1/3 rounded-lg border border-gray-200 h-full ${selectedChat ? "hidden md:flex" : "flex"}`}>

      <div className="flex justify-between items-center px-3 pb-3 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-700">My Chats</h2>
        {/* NEW: Group Chat Modal Button */}
        <GroupChatModal>
          <button className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded transition">
            <span>New Group +</span>
          </button>
        </GroupChatModal>
      </div>

      <div className="flex flex-col p-3 bg-gray-50 w-full h-full overflow-y-hidden rounded-lg mt-3">
        {chats ? (
          <div className="overflow-y-scroll h-full scrollbar-hide">
            {chats.map((chat: any) => (
              <div
                onClick={() => setSelectedChat(chat)}
                key={chat._id}
                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 transition-colors ${selectedChat === chat
                    ? "bg-whatsapp-teal text-white shadow-md"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
              >
                <p className="font-semibold">
                  {/* Logic: If it's a group, show ChatName. If 1-on-1, calculate the other user's name */}
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </p>
                {chat.latestMessage && (
                  <p className="text-xs mt-1 opacity-80 truncate">
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10">Loading Chats...</div>
        )}
      </div>
    </div>
  );
};

export default MyChats;