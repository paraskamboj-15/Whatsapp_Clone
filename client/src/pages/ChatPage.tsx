// import React, { useState } from 'react';
// import { ChatState } from "../context/ChatProvider";
// import SideDrawer from "../components/SideDrawer";
// import MyChats from "../components/MyChats";
// import ChatBox from "../components/ChatBox";

// const ChatPage = () => {
//   const { user } = ChatState();
//   const [fetchAgain, setFetchAgain] = useState(false);

//   return (
//     <div style={{ width: "100%" }}>
//       {/* Only show components if user is logged in */}
//       {user && <SideDrawer />}
      
//       <div className="flex justify-between w-full h-[91.5vh] p-3 gap-3">
//         {user && <MyChats />}
//         {user && <ChatBox />}
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
import React, { useState } from 'react'; 
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false); 

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      
      <div className="flex justify-between w-full h-[91.5vh] p-3 gap-3">
        {/* Pass the switch to MyChats so it knows WHEN to refresh */}
        {user && <MyChats fetchAgain={fetchAgain} />}
        
        {/* Pass the switch to ChatBox so it can trigger the refresh */}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;