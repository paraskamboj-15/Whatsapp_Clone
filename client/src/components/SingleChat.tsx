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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      
      // Mark as read immediately when opening
      await axios.put("/api/message/read", { chatId: selectedChat._id }, config);
    } catch (error) {
      alert("Failed to load messages");
      setLoading(false);
    }
  };

  const sendMessage = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
        setNewMessage("");
        const { data } = await axios.post("/api/message", { content: newMessage, chatId: selectedChat._id }, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) { alert("Failed to send message"); }
    }
  };

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

  const handleEdit = async (messageId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/message/${messageId}`, { content: editContent }, config);
      const updatedMessages = messages.map(m => m._id === messageId ? data : m);
      setMessages(updatedMessages);
      setEditingMessageId(null);
    } catch (error) { alert("Failed to edit message"); }
  };

  const handleDelete = async (messageId: string) => {
    if(!window.confirm("Delete this message?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/message/${messageId}`, config);
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (error) { alert("Failed to delete message"); }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageRecieved: any) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  return (
    <>
      {selectedChat ? (
        <>
          <div className="flex items-center justify-between pb-3 px-2 w-full border-b border-gray-200">
            <button className="md:hidden mr-2 text-2xl" onClick={() => setSelectedChat("")}>⬅️</button>
            <span className="text-xl font-semibold text-gray-800">
              {!selectedChat.isGroupChat ? (
                  <ProfileModal user={selectedChat.users.find((u:any) => u._id !== user._id)}>
                    <span className="cursor-pointer hover:underline">{getSender(user, selectedChat.users)}</span>
                  </ProfileModal>
              ) : ( selectedChat.chatName )}
            </span>
            {selectedChat.isGroupChat && <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />}
          </div>

          <div className="flex flex-col justify-between p-3 bg-gray-100 w-full h-full rounded-lg overflow-y-hidden mt-3">
            <div className="flex flex-col overflow-y-scroll scrollbar-hide mb-3 h-full">
              {loading ? ( <div className="self-center mt-10">Loading...</div> ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((m, i) => (
                    <div key={m._id} className={`relative group flex flex-col max-w-[75%] px-4 py-2 rounded-lg text-sm ${m.sender._id === user._id ? "self-end bg-whatsapp-green text-white rounded-br-none" : "self-start bg-white text-black border border-gray-200 rounded-bl-none"}`}>
                      {editingMessageId === m._id ? (
                          <div className="flex gap-2 items-center"><input className="text-black p-1 rounded w-full" value={editContent} onChange={(e) => setEditContent(e.target.value)} /><button onClick={() => handleEdit(m._id)} className="bg-white text-green-500 rounded px-1">✓</button><button onClick={() => setEditingMessageId(null)} className="bg-white text-red-500 rounded px-1">✕</button></div>
                      ) : (
                          <>
                            <span>{m.content}</span>
                            <div className="flex justify-between items-end gap-2 mt-1">
                                <span className={`text-[10px] ${m.sender._id === user._id ? "text-green-100" : "text-gray-400"}`}>
                                    {m.isEdited && <span className="italic mr-1">(edited)</span>}
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {m.sender._id === user._id && (
                                        <span className={`ml-1 font-bold ${m.readBy.length > 1 ? "text-blue-200" : ""}`}>{m.readBy.length > 1 ? "✓✓" : "✓"}</span>
                                    )}
                                </span>
                            </div>
                          </>
                      )}
                      {m.sender._id === user._id && editingMessageId !== m._id && (
                          <div className="absolute top-0 right-0 hidden group-hover:flex bg-white shadow-md rounded p-1 gap-1 -mt-2 mr-2 z-10">
                              <button onClick={() => { setEditingMessageId(m._id); setEditContent(m.content); }} className="text-blue-500 text-xs px-1">🖊️</button>
                              <button onClick={() => handleDelete(m._id)} className="text-red-500 text-xs px-1">🗑️</button>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isTyping && <div className="text-gray-400 text-xs ml-4 mt-2">Typing...</div>}
            </div>
            <input className="bg-white border border-gray-300 p-3 rounded-lg w-full outline-none focus:border-whatsapp-teal" placeholder="Type a message..." onChange={typingHandler} value={newMessage} onKeyDown={sendMessage} />
          </div>
        </>
      ) : ( <div className="flex items-center justify-center h-full"><p className="text-3xl pb-3 font-light text-gray-400">Click on a user to start chatting</p></div> )}
    </>
  );
};

export default SingleChat;