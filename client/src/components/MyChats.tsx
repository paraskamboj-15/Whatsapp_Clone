import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './GroupChatModal';

const MyChats = ({ fetchAgain }: any) => {
  const [loggedUser, setLoggedUser] = useState();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");

  // NOTE: We need `setUser` to update the global user state with new favorites
  const { selectedChat, setSelectedChat, user, setUser, chats, setChats } = ChatState();

  // Initialize from context state
  const [favoriteChats, setFavoriteChats] = useState<string[]>([]);

  useEffect(() => {
    // If user has favorites in DB, set them to state
    if (user && user.favorites) {
      setFavoriteChats(user.favorites);
    }
  }, [user]);

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
      console.error("Failed to Load the chats");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/user", config);
      setAvailableUsers(data);
    } catch (error) {
      console.error("Failed to load available users");
    }
  };

  const accessChat = async (userId: string) => {
    try {
      const config = {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c: any) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
    } catch (error: any) {
      alert("Error fetching the chat: " + error.message);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    // 1. Optimistic Update (UI updates instantly)
    const isFav = favoriteChats.includes(chatId);
    const newFavorites = isFav
      ? favoriteChats.filter(id => id !== chatId)
      : [...favoriteChats, chatId];

    setFavoriteChats(newFavorites);

    // Update global user object and localStorage so it doesn't break on reload
    const updatedUser = { ...user, favorites: newFavorites };
    setUser(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    // 2. Call the Database
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('/api/user/favorites', { chatId }, config);
    } catch (error) {
      // Revert if API fails
      console.error("Failed to save favorite to database");
      setFavoriteChats(favoriteChats);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo") as string));
    if (user) {
      fetchChats();
      fetchAvailableUsers();
    }
  }, [user, fetchAgain]);

  const favoriteChatList = chats ? chats.filter((c: any) => favoriteChats.includes(c._id)) : [];

  return (
    <div className={`flex flex-col p-3 bg-white w-full md:w-1/3 rounded-lg border border-gray-200 h-full ${selectedChat ? "hidden md:flex" : "flex"}`}>

      <div className="flex justify-between items-center px-3 pb-3">
        <h2 className="text-2xl font-bold text-gray-700">Chats</h2>
        <GroupChatModal>
          <button className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded transition">
            <span>New Group +</span>
          </button>
        </GroupChatModal>
      </div>

      <div className="flex border-b border-gray-200 mb-2 px-2">
        <button
          onClick={() => setActiveTab("recent")}
          className={`flex-1 py-2 text-sm text-center font-medium transition-colors ${activeTab === "recent" ? "border-b-2 border-whatsapp-teal text-whatsapp-teal" : "text-gray-500 hover:text-gray-700"}`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 text-sm text-center font-medium transition-colors ${activeTab === "users" ? "border-b-2 border-whatsapp-teal text-whatsapp-teal" : "text-gray-500 hover:text-gray-700"}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 py-2 text-sm text-center font-medium transition-colors ${activeTab === "favorites" ? "border-b-2 border-whatsapp-teal text-whatsapp-teal" : "text-gray-500 hover:text-gray-700"}`}
        >
          Favorites
        </button>
      </div>

      <div className="flex flex-col p-2 bg-gray-50 w-full h-full overflow-y-auto scrollbar-hide rounded-lg">

        {/* RECENT CHATS */}
        {activeTab === "recent" && (
          <div>
            {chats ? (
              chats.map((chat: any) => (
                <div
                  onClick={() => setSelectedChat(chat)}
                  key={chat._id}
                  className={`cursor-pointer px-3 py-2 rounded-lg mb-2 transition-colors flex justify-between items-center ${selectedChat === chat
                    ? "bg-whatsapp-teal text-white shadow-md"
                    : "bg-white border border-gray-100 text-black hover:bg-gray-100"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-semibold truncate">
                      {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                    </p>
                    {chat.latestMessage && (
                      <p className="text-xs mt-1 opacity-80 truncate">
                        <b>{chat.latestMessage.sender.name}: </b>
                        {chat.latestMessage.content}
                      </p>
                    )}
                  </div>
                  <button onClick={(e) => toggleFavorite(e, chat._id)} className="text-lg opacity-70 hover:opacity-100 hover:scale-110 transition-transform">
                    {favoriteChats.includes(chat._id) ? "⭐" : "☆"}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center mt-4 text-sm text-gray-500">Loading Chats...</div>
            )}
          </div>
        )}

        {/* AVAILABLE USERS */}
        {activeTab === "users" && (
          <div>
            {availableUsers.map((u: any) => (
              <div
                key={u._id}
                onClick={() => accessChat(u._id)}
                className="cursor-pointer px-3 py-2 rounded-lg mb-2 bg-white border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-3 shadow-sm"
              >
                <img src={u.pic} alt={u.name} className="w-10 h-10 rounded-full border border-gray-200" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
            ))}
            {availableUsers.length === 0 && (
              <div className="text-center mt-4 text-sm text-gray-500">No users found.</div>
            )}
          </div>
        )}

        {/* FAVORITE CHATS */}
        {activeTab === "favorites" && (
          <div>
            {favoriteChatList.length > 0 ? (
              favoriteChatList.map((chat: any) => (
                <div
                  onClick={() => setSelectedChat(chat)}
                  key={chat._id}
                  className={`cursor-pointer px-3 py-2 rounded-lg mb-2 transition-colors flex justify-between items-center ${selectedChat === chat
                    ? "bg-whatsapp-teal text-white shadow-md"
                    : "bg-white border border-gray-100 text-black hover:bg-gray-100"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-semibold truncate">
                      {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                    </p>
                  </div>
                  <button onClick={(e) => toggleFavorite(e, chat._id)} className="text-lg hover:scale-110 transition-transform">
                    ⭐
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center mt-8 text-sm text-gray-500 flex flex-col items-center">
                <span className="text-4xl mb-2">⭐</span>
                <p>No favorite chats yet.</p>
                <p className="text-xs mt-1">Go to "Recent" and click the star icon to add one.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyChats;