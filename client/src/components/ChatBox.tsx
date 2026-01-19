import React from 'react';
import { ChatState } from '../context/ChatProvider';
import SingleChat from './SingleChat';

const ChatBox = ({ fetchAgain, setFetchAgain }: any) => {
  const { selectedChat } = ChatState();

  return (
    <div 
      className={`${selectedChat ? "flex" : "hidden"} md:flex flex-col items-center p-3 bg-white w-full md:w-2/3 rounded-lg border border-gray-200 h-full`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;