

import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import { getSender } from '../config/ChatLogics';
import './styles.css';
import io from "socket.io-client";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ProfileModal from "./ProfileModal";
import API_URL from "../config/api";

const ENDPOINT = API_URL;
var socket: any, selectedChatCompare: any;

const SingleChat = ({ fetchAgain, setFetchAgain }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState("offline");
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  // Helper: Format Date for "Last seen"
  const formatLastSeen = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
       return `yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // 1. Initial Socket Setup
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", (room: string) => setIsTyping(true));
    socket.on("stop typing", (room: string) => setIsTyping(false));

    socket.on("user status", (data: any) => {
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        if (partner && partner._id === data.userId) {
            setPartnerStatus(data.status);
            // Agar backend se proper lastSeen aaya hai toh use set karo
            if (data.status === "offline" && data.lastSeen) {
                setLastSeen(data.lastSeen);
            }
        }
    });

    socket.on("user online", (userId: string) => {
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        if (partner && partner._id === userId) {
            setPartnerStatus("online");
        }
    });

    socket.on("user offline", (userId: string) => {
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        if (partner && partner._id === userId) {
            setPartnerStatus("offline");
            setLastSeen(new Date().toISOString());
        }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // 2. Fetch Messages
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      alert("Failed to load messages");
      setLoading(false);
    }
  };

  // 3. Send Message (Updated to work on Enter OR Button Click)
  const sendMessage = async (event?: React.KeyboardEvent<HTMLInputElement>) => {
    if (event && event.key !== "Enter") return;

    if (newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
        };
        const messageToSend = newMessage;
        setNewMessage(""); // Clear input instantly

        const { data } = await axios.post(
          "/api/message",
          { content: messageToSend, chatId: selectedChat._id },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        alert("Failed to send message");
      }
    }
  };

  // 4. Handle Chat Change
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    
    if (selectedChat && !selectedChat.isGroupChat) {
        const partner = selectedChat.users.find((u: any) => u._id !== user._id);
        if (partner) {
            setPartnerStatus("offline"); 
            if (partner.lastSeen) {
               setLastSeen(partner.lastSeen);
            }
            socket.emit("check user status", partner._id);
        }
    }
  }, [selectedChat]);

  // 5. Receive Real-Time Messages
  useEffect(() => {
    const handleMessageReceived = (newMessageRecieved: any) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("message received", handleMessageReceived);
    return () => {
      socket.off("message received", handleMessageReceived);
    };
  });

  // 6. Typing Handler
  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
          <div className="flex items-center justify-between py-2 px-4 w-full bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
                <button className="md:hidden text-2xl text-gray-600" onClick={() => setSelectedChat("")}>
                  ⬅️
                </button>

                <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                        <img 
                           src={!selectedChat.isGroupChat 
                                ? selectedChat.users.find((u:any) => u._id !== user._id).pic 
                                : "https://cdn-icons-png.flaticon.com/512/166/166258.png"} 
                           alt="avatar"
                           className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <span className="text-gray-800 font-semibold text-base leading-tight">
                        {!selectedChat.isGroupChat ? (
                            <ProfileModal user={selectedChat.users.find((u:any) => u._id !== user._id)}>
                                <span className="cursor-pointer hover:underline">
                                    {getSender(user, selectedChat.users)}
                                </span>
                            </ProfileModal>
                        ) : ( selectedChat.chatName )}
                    </span>
                    
                    {!selectedChat.isGroupChat && (
                        <span className={`text-xs font-medium ${partnerStatus === "online" ? "text-green-500" : "text-gray-500"}`}>
                            {partnerStatus === "online" 
                                ? "Online" 
                                : lastSeen 
                                    ? `Last seen ${formatLastSeen(lastSeen)}` 
                                    : "Offline"}
                        </span>
                    )}
                    {selectedChat.isGroupChat && (
                         <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-xs">
                             {selectedChat.users.map((u:any) => u.name).join(", ")}
                         </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {selectedChat.isGroupChat && <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />}
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex flex-col flex-1 bg-[#e5ded8] w-full relative">
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 flex flex-col gap-2">
                {loading ? ( <div className="self-center mt-10">Loading messages...</div> ) : (
                  <>
                    {messages.map((m, i) => (
                      <div key={m._id} className={`flex flex-col max-w-[75%] px-3 py-1.5 rounded-lg text-sm shadow-sm ${m.sender._id === user._id ? "self-end bg-[#d9fdd3]" : "self-start bg-white"}`}>
                          <span>{m.content}</span>
                          <span className="text-[10px] text-gray-500 self-end mt-1">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                      </div>
                    ))}
                    {isTyping && (
                       <div className="self-start bg-white rounded-lg px-4 py-2 w-16 shadow-sm mt-2">
                         <div className="flex gap-1 justify-center">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                         </div>
                       </div>
                    )}
                  </>
                )}
            </div>

            {/* Input Box Area with Send Button */}
            <div className="shrink-0 p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
               <input 
                  type="text"
                  className="bg-gray-100 border border-gray-300 p-3 rounded-lg w-full outline-none focus:border-whatsapp-teal" 
                  placeholder="Type a message..." 
                  onChange={typingHandler} 
                  value={newMessage} 
                  onKeyDown={sendMessage} 
                />
                
                {/* NEW SEND BUTTON */}
                <button 
                  onClick={() => sendMessage()} 
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                    newMessage.trim() ? "bg-whatsapp-teal text-white hover:bg-teal-700 cursor-pointer shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {/* WhatsApp-like Paper Plane SVG */}
                  <svg viewBox="0 0 24 24" width="22" height="22" className="fill-current ml-1">
                    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                  </svg>
                </button>
            </div>

          </div>
        </div>
      ) : ( 
        <div className="flex flex-col items-center justify-center h-full text-center p-4 w-full">
             <img src="/whatsapp.svg" alt="Logo" className="w-20 h-20 opacity-30 mb-4 grayscale" />
             <h2 className="text-3xl text-gray-600 font-light">WhatsApp Web</h2>
             <p className="text-sm text-gray-500 mt-2">Send and receive messages without keeping your phone online.</p>
        </div> 
      )}
    </>
  );
};

export default SingleChat;