import React, { useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import UserListItem from './UserListItem';

const GroupChatModal = ({ children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  // 1. Search Users to add
  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      alert("Failed to load search results");
    }
  };

  // 2. Add user to group list
  const handleGroup = (userToAdd: any) => {
    if (selectedUsers.includes(userToAdd)) {
      alert("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // 3. Remove user from group list
  const handleDelete = (delUser: any) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  // 4. Submit to Backend
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      setIsOpen(false); // Close modal
      alert("New Group Chat Created!");
    } catch (error) {
      alert("Failed to Create Group");
    }
  };

  return (
    <>
      {/* The Trigger Button (passed as children) */}
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {/* The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Create Group Chat</h2>

            <div className="flex flex-col gap-4">
              <input 
                placeholder="Chat Name"
                className="border p-2 rounded mb-1 outline-none focus:border-whatsapp-teal"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              
              <input 
                placeholder="Add Users eg: John, Jane"
                className="border p-2 rounded mb-1 outline-none focus:border-whatsapp-teal"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* Selected Users Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <div key={u._id} className="bg-whatsapp-teal text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    {u.name}
                    <span 
                        className="cursor-pointer font-bold hover:text-red-200"
                        onClick={() => handleDelete(u)}
                    >
                        ×
                    </span>
                  </div>
                ))}
              </div>

              {/* Search Results */}
              {loading ? <div>Loading...</div> : (
                <div className="max-h-40 overflow-y-auto">
                    {searchResult?.slice(0, 4).map((user: any) => (
                        <UserListItem 
                            key={user._id} 
                            user={user} 
                            handleFunction={() => handleGroup(user)} 
                        />
                    ))}
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className="bg-whatsapp-green text-white font-bold py-2 rounded hover:bg-green-600 transition"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;