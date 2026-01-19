import React from 'react';

const UserListItem = ({ user, handleFunction }: any) => {
  return (
    <div
      onClick={handleFunction}
      className="cursor-pointer bg-gray-200 hover:bg-whatsapp-teal hover:text-white w-full flex items-center text-black px-3 py-2 mb-2 rounded-lg transition-colors"
    >
      <img
        className="mr-2 w-8 h-8 rounded-full cursor-pointer"
        alt={user.name}
        src={user.pic}
      />
      <div>
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs">
          <b>Email : </b>
          {user.email}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;