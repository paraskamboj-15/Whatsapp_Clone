import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatState } from '../context/ChatProvider';
import { useNavigate } from 'react-router-dom';
import UserListItem from './UserListItem';
import { getSender } from '../config/ChatLogics';

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // To toggle the search drawer

useEffect(() => {
  if (showSearch) {
    fetchAllUsers();
  }
}, [showSearch]);

const fetchAllUsers = async () => {
  try {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    // Calling the API without a search query returns all users
    const { data } = await axios.get("/api/user", config);

    setLoading(false);
    setSearchResult(data);
  } catch (error) {
    alert("Error Failed to Load the Users");
    setLoading(false);
  }
};

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
  if (!search) {
    fetchAllUsers();
    return;
  }

  try {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.get(`/api/user?search=${search}`, config);

    setLoading(false);
    setSearchResult(data);
  } catch (error) {
    alert("Error Failed to Load the Search Results");
    setLoading(false);
  }
};

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat`, { userId }, config);

      // If the chat is new, add it to our existing list
      if (!chats.find((c: any) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setSelectedChat(data);
      setLoadingChat(false);
      setShowSearch(false); // Close the drawer
    } catch (error: any) {
      alert("Error fetching the chat: " + error.message);
      setLoadingChat(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white w-full p-2 border-b-4 border-whatsapp-green relative z-10">
        {/* Search Trigger */}
        <button 
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
          onClick={() => setShowSearch(!showSearch)}
        >
          <i className="fas fa-search"></i>
          <span className="hidden md:block font-bold">
            {showSearch ? "Close Search" : "Search User"}
          </span>
        </button>

        <h1 className="text-2xl font-light text-whatsapp-teal">WhatsApp Clone</h1>

<div className="flex items-center gap-4">

      {/* NOTIFICATION BELL */}
      <div className="relative cursor-pointer group">
        <span className="text-2xl text-gray-600 hover:text-whatsapp-teal">
          🔔
        </span>

        {/* Red Badge Count */}
        {notification.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notification.length}
          </span>
        )}

        {/* Dropdown Menu (Hover to see) */}
        <div className="absolute right-0 top-8 bg-white shadow-xl border border-gray-200 rounded-lg w-64 hidden group-hover:block z-50">
          {notification.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">
              No New Messages
            </div>
          )}
          {notification.map((notif: any) => (
            <div 
              key={notif._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100"
              onClick={() => {
                setSelectedChat(notif.chat);
                setNotification(notification.filter((n: any) => n !== notif));
              }}
            >
              {notif.chat.isGroupChat
                ? `New Message in ${notif.chat.chatName}`
                : `New Message from ${getSender(user, notif.chat.users)}`}
            </div>
          ))}
        </div>
      </div>
        {/* Profile */}
        {/* <div className="flex items-center gap-2"> */}
            <div className="font-bold text-gray-700">{user?.name}</div>
            <img src={user?.pic} alt={user?.name} className="w-8 h-8 rounded-full border border-gray-300"/>
            <button onClick={logoutHandler} className="ml-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Logout</button>
        </div>
      </div>

      {/* The Search Dropdown / Drawer Area */}
      {showSearch && (
        <div className="absolute left-0 top-16 bg-white w-72 h-screen shadow-2xl p-4 z-20 border-r border-gray-200 transition-all">
          <div className="flex pb-2">
            <input
              placeholder="Search by name or email"
              className="border border-gray-300 p-2 rounded w-full outline-none focus:border-whatsapp-teal mr-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={handleSearch}
              className="bg-whatsapp-green text-white px-3 rounded hover:bg-green-600"
            >
              Go
            </button>
          </div>
          
          {/* Results List */}
          {loading ? (
            <div className="text-center mt-4">Loading...</div>
          ) : (
            <div className="mt-4 overflow-y-auto h-[80%]">
              {searchResult?.map((user: any) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))}
            </div>
          )}
          {loadingChat && <div className="text-center mt-2 text-whatsapp-teal">Creating chat...</div>}
        </div>
      )}
    </>
  );
};

export default SideDrawer;