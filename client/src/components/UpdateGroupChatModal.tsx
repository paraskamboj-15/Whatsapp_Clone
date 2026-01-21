import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import UserListItem from "./UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameloading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRemove = async (user1: any) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      alert("Only admins can remove someone!"); return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupremove`, { chatId: selectedChat._id, userId: user1._id }, config);
      
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) { setLoading(false); alert("Error Occurred!"); }
  };

  const handleAddUser = async (user1: any) => {
    if (selectedChat.users.find((u: any) => u._id === user1._id)) { alert("User Already in group!"); return; }
    if (selectedChat.groupAdmin._id !== user._id) { alert("Only admins can add someone!"); return; }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupadd`, { chatId: selectedChat._id, userId: user1._id }, config);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) { setLoading(false); alert("Error Occurred!"); }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameloading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/rename`, { chatId: selectedChat._id, chatName: groupChatName }, config);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameloading(false);
    } catch (error) { setRenameloading(false); alert("Error Renaming Group"); }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-gray-600 hover:text-black"><i className="fas fa-eye"></i> ⚙️</button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
             <button onClick={() => setIsOpen(false)} className="absolute top-2 right-4 text-2xl">&times;</button>
             <h2 className="text-2xl font-bold mb-4 text-center">{selectedChat.chatName}</h2>
             <div className="flex flex-wrap gap-2 mb-4">
               {selectedChat.users.map((u: any) => (
                 <div key={u._id} className="bg-whatsapp-teal text-white px-2 py-1 rounded-full text-sm">
                   {u.name}
                   <span className="ml-2 cursor-pointer font-bold hover:text-red-200" onClick={() => handleRemove(u)}>×</span>
                 </div>
               ))}
             </div>
             <div className="flex gap-2 mb-4">
               <input value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} placeholder="Chat Name" className="border p-2 rounded w-full" />
               <button onClick={handleRename} className="bg-whatsapp-green text-white px-4 rounded">{renameloading ? "..." : "Update"}</button>
             </div>
             <input placeholder="Add User to group" onChange={(e) => handleSearch(e.target.value)} className="border p-2 rounded w-full mb-2" />
             <div className="max-h-32 overflow-y-auto">
                {loading ? "Loading..." : searchResult?.slice(0, 4).map((user: any) => (
                  <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                ))}
             </div>
             <button onClick={() => handleRemove(user)} className="bg-red-500 text-white w-full py-2 rounded mt-4 font-bold hover:bg-red-600">Leave Group</button>
          </div>
        </div>
      )}
    </>
  );
};
export default UpdateGroupChatModal;