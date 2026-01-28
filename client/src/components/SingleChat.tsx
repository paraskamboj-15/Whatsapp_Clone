// import React, { useEffect, useState } from 'react';
// import { ChatState } from '../context/ChatProvider';
// import axios from 'axios';
// import { getSender } from '../config/ChatLogics';
// import './styles.css';
// import io from "socket.io-client";
// import API_URL from "../config/api";

// // Define the endpoint (Server URL)
// const ENDPOINT = API_URL;
// var socket: any, selectedChatCompare: any;

// const SingleChat = ({ fetchAgain, setFetchAgain }: any) => {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [newMessage, setNewMessage] = useState("");
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [typing, setTyping] = useState(false); // Am I typing?
//   const [isTyping, setIsTyping] = useState(false); // Is the other person typing?

//   const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

//   // 1. Initialize Socket Connection (Runs once when app loads)
//   useEffect(() => {
//     socket = io(ENDPOINT);
//     socket.emit("setup", user);
//     socket.on("connected", () => setSocketConnected(true));
//     // Listen for typing events
//     socket.on("typing", (room: string) => {
//       if (selectedChatCompare && selectedChatCompare._id === room) {
//         setIsTyping(true);
//       }
//     })
//     socket.on("stop typing", (room: string) => {
//       if (selectedChatCompare && selectedChatCompare._id === room) {
//         setIsTyping(false);
//       }
//     });
//   }, []);

//   // 2. Fetch Messages & Join Room
//   const fetchMessages = async () => {
//     if (!selectedChat) return;

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${user.token}` },
//       };

//       setLoading(true);
//       const { data } = await axios.get(
//         `/api/message/${selectedChat._id}`,
//         config
//       );

//       setMessages(data);
//       setLoading(false);

//       // Tell the server we joined this specific chat room
//       socket.emit("join chat", selectedChat._id);

//     } catch (error) {
//       alert("Failed to load messages");
//       setLoading(false);
//     }
//   };

//   // 3. Send Message
//   const sendMessage = async (event: React.KeyboardEvent) => {
//     if (event.key === "Enter" && newMessage) {
//       try {
//         const config = {
//           headers: {
//             "Content-type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//         };

//         const messageToSend = newMessage;
//         setNewMessage("");

//         const { data } = await axios.post(
//           "/api/message",
//           {
//             content: messageToSend,
//             chatId: selectedChat._id,
//           },
//           config
//         );

//         // Emit signal to server: "I sent a message!"
//         socket.emit("new message", data);

//         setMessages([...messages, data]);
//       } catch (error) {
//         alert("Failed to send message");
//       }
//     }
//   };

//   // 4. Handle "Chat Changed"
//   useEffect(() => {
//     fetchMessages();
//     selectedChatCompare = selectedChat; // Keep track of which chat is open
//   }, [selectedChat]);

//   // 5. Listen for Incoming Messages
//   useEffect(() => {
//     const handleMessageReceived = (newMessageRecieved: any) => {
//       if (
//         !selectedChatCompare ||
//         selectedChatCompare._id !== newMessageRecieved.chat._id
//       ) {
//         //If notification doesn't already include this message, add it
//         if (!notification.includes(newMessageRecieved)) {
//           setNotification([newMessageRecieved, ...notification]);
//           // Optional: Update title to grab attention
//           setFetchAgain(!fetchAgain); // Refresh chat list (if you have this prop)
//         }
//       } else {
//         setMessages((prev) => [...prev, newMessageRecieved]);
//       }
//     };

//     socket.on("message received", handleMessageReceived);

//     // CLEANUP: This line removes the listener before running the effect again
//     return () => {
//       socket.off("message received", handleMessageReceived);
//     };
//   });

//   // Helper to format time
//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewMessage(e.target.value);

//     // If socket isn't connected, don't do anything
//     if (!socketConnected) return;

//     if (!typing) {
//       setTyping(true);
//       socket.emit("typing", selectedChat._id);
//     }

//     // Debounce Logic: Stop showing "typing" if user stops for 5 seconds
//     let lastTypingTime = new Date().getTime();
//     var timerLength = 5000;

//     setTimeout(() => {
//       var timeNow = new Date().getTime();
//       var timeDiff = timeNow - lastTypingTime;

//       if (timeDiff >= timerLength && typing) {
//         socket.emit("stop typing", selectedChat._id);
//         setTyping(false);
//       }
//     }, timerLength);
//   };

//   return (
//     <>
//       {selectedChat ? (
//         <>
//           {/* Header */}
//           <div className="flex items-center justify-between pb-3 px-2 w-full border-b border-gray-200">
//             <button
//               className="md:hidden mr-2 text-2xl"
//               onClick={() => setSelectedChat("")}
//             >
//               ⬅️
//             </button>

//             <span className="text-xl font-semibold text-gray-800">
//               {!selectedChat.isGroupChat ? getSender(user, selectedChat.users) : selectedChat.chatName}
//             </span>
//             <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
//           </div>

//           {/* Messages Body */}
//           <div className="flex flex-col justify-between p-3 bg-gray-100 w-full h-full rounded-lg overflow-y-hidden mt-3">
//             <div className="flex flex-col overflow-y-scroll scrollbar-hide mb-3 h-full">
//               {loading ? (
//                 <div className="self-center mt-10">Loading messages...</div>
//               ) : (
//                 <div className="flex flex-col gap-2">
//                   {messages.map((m, i) => (
//                     <div
//                       key={m._id}
//                       className={`flex flex-col max-w-[75%] px-4 py-2 rounded-lg text-sm ${m.sender._id === user._id
//                         ? "self-end bg-whatsapp-green text-white rounded-br-none"
//                         : "self-start bg-white text-black border border-gray-200 rounded-bl-none"
//                         }`}
//                     >
//                       <span>{m.content}</span>
//                       <span className={`text-[10px] self-end mt-1 ${m.sender._id === user._id ? "text-green-100" : "text-gray-400"}`}>
//                         {formatTime(m.createdAt)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {isTyping && (
//                 <div className="self-start bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 mb-2 w-16">
//                   <div className="flex gap-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <input
//               type="text"
//               className="bg-white border border-gray-300 p-3 rounded-lg w-full outline-none focus:border-whatsapp-teal"
//               placeholder="Type a message and hit Enter..."
//               onChange={typingHandler}
//               value={newMessage}
//               onKeyDown={sendMessage}
//             />
//           </div>
//         </>
//       ) : (
//         <div className="flex items-center justify-center h-full">
//           <p className="text-3xl pb-3 font-light text-gray-400">
//             Click on a user to start chatting
//           </p>
//         </div>
//       )}
//     </>
//   );
// };

// export default SingleChat;


import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import { getSender } from '../config/ChatLogics';
import './styles.css';
import io from "socket.io-client";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ProfileModal from "./ProfileModal";
import API_URL from "../config/api"; // Ensure this import path is correct

const ENDPOINT = API_URL;
var socket: any, selectedChatCompare: any;

const SingleChat = ({ fetchAgain, setFetchAgain }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
    const [partnerStatus, setPartnerStatus] = useState("offline");
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  // Helper: Format Date for "Last seen"
  const formatLastSeen = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
       return `yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Otherwise show date
    return date.toLocaleDateString();
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    // 1. Listen for explicit status checks
    socket.on("user status", (data: any) => {
        // Only update if this data belongs to the user we are chatting with
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        
        if (partner && partner._id === data.userId) {
            setPartnerStatus(data.status);
            setLastSeen(data.lastSeen);
        }
    });

    // 2. Real-time: Partner comes Online
    socket.on("user online", (userId: string) => {
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        if (partner && partner._id === userId) {
            setPartnerStatus("online");
        }
    });

    // 3. Real-time: Partner goes Offline
    socket.on("user offline", (userId: string) => {
        if (!selectedChatCompare || selectedChatCompare.isGroupChat) return;
        const partner = selectedChatCompare.users.find((u: any) => u._id !== user._id);
        if (partner && partner._id === userId) {
            setPartnerStatus("offline");
            setLastSeen(new Date().toISOString()); // Just went offline now
        }
    });
  }, []);

  // ... (fetchMessages and sendMessage functions remain the same) ...
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

  // ... (sendMessage and typing logic remain the same) ...

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    
    // RESET & CHECK STATUS
    if (selectedChat && !selectedChat.isGroupChat) {
        const partner = selectedChat.users.find((u: any) => u._id !== user._id);
        if (partner) {
            setPartnerStatus("offline"); // Default until server replies
            setLastSeen(null);
            socket.emit("check user status", partner._id);
        }
    }
  }, [selectedChat]);

  // ... (socket message listener remains the same) ...

  return (
    <>
      {selectedChat ? (
        <>
          {/* PROFESSIONAL HEADER UI */}
          <div className="flex items-center justify-between py-2 px-4 w-full bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="flex items-center gap-3">
                {/* Back Button (Mobile) */}
                <button className="md:hidden text-2xl text-gray-600" onClick={() => setSelectedChat("")}>
                  ⬅️
                </button>

                {/* Avatar */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                        {/* You can add actual user image here if available */}
                        <img 
                           src={!selectedChat.isGroupChat 
                                ? selectedChat.users.find((u:any) => u._id !== user._id).pic 
                                : "https://cdn-icons-png.flaticon.com/512/166/166258.png"} 
                           alt="avatar"
                           className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Name & Status Column */}
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
                    
                    {/* Status Indicator */}
                    {!selectedChat.isGroupChat && (
                        <span className={`text-xs font-medium ${partnerStatus === "online" ? "text-green-500" : "text-gray-500"}`}>
                            {partnerStatus === "online" ? "Online" : `Last seen ${formatLastSeen(lastSeen || "")}`}
                        </span>
                    )}
                    {selectedChat.isGroupChat && (
                         <span className="text-xs text-gray-500">
                             {selectedChat.users.map((u:any) => u.name).join(", ")}
                         </span>
                    )}
                </div>
            </div>
            
            {/* Right Side Icons (Optional for Pro look) */}
            <div className="flex items-center gap-4">
                {selectedChat.isGroupChat && <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />}
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex flex-col justify-between p-3 bg-[#e5ded8] w-full h-full overflow-y-hidden">
             {/* Note: changed bg color to WhatsApp-like beige #e5ded8 */}
            <div className="flex flex-col overflow-y-scroll scrollbar-hide mb-3 h-full">
               {/* ... (Existing Message Mapping Logic) ... */}
               {/* Ensure you keep the existing logic here for rendering messages */}
                {loading ? ( <div className="self-center mt-10">Loading...</div> ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((m, i) => (
                    // ... your existing message render logic ...
                    // Just purely copying previous logic for brevity
                    <div key={m._id} className={`flex flex-col max-w-[75%] px-3 py-1 rounded-lg text-sm shadow-sm ${m.sender._id === user._id ? "self-end bg-[#d9fdd3]" : "self-start bg-white"}`}>
                        <span>{m.content}</span>
                        <span className="text-[10px] text-gray-500 self-end">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            {/* ... (Existing Input Logic) ... */}
             <input className="bg-white border border-gray-300 p-3 rounded-lg w-full outline-none" placeholder="Type a message..." onChange={(e) => setNewMessage(e.target.value)} value={newMessage} onKeyDown={(e) => { if(e.key==="Enter") sendMessage(e as any) }} />
          </div>
        </>
      ) : ( 
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
             <img src="/whatsapp.svg" alt="Logo" className="w-20 h-20 opacity-30 mb-4 grayscale" />
             <h2 className="text-3xl text-gray-600 font-light">WhatsApp Web</h2>
             <p className="text-sm text-gray-500 mt-2">Send and receive messages without keeping your phone online.</p>
        </div> 
      )}
    </>
  );
};

export default SingleChat;