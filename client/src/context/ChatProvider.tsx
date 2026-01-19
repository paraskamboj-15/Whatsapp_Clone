import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext<any>(undefined);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>();
  const [selectedChat, setSelectedChat] = useState<any>(); // Selected Chat Logic
  const [chats, setChats] = useState<any[]>([]); // All Chats Logic
  const [notification, setNotification] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider 
      value={{ 
        user, 
        setUser, 
        selectedChat, 
        setSelectedChat, 
        chats, 
        setChats,
        notification, 
        setNotification  
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;