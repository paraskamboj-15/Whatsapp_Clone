// // // import React, { useState } from 'react';
// // // import Login from '../components/Authentication/Login';
// // // import Signup from '../components/Authentication/Signup';

// // // const HomePage = () => {
// // //   const [activeTab, setActiveTab] = useState("login");

// // //   return (
// // //     <div className="container max-w-xl mx-auto mt-10 p-4">
// // //       {/* Header Box */}
// // //       <div className="flex justify-center bg-white w-full p-4 mb-4 rounded-lg border border-gray-200 shadow-sm text-center">
// // //         <h1 className="text-4xl font-light text-whatsapp-teal">WhatsApp Clone</h1>
// // //       </div>

// // //       {/* Main Box with Tabs */}
// // //       <div className="bg-white w-full p-6 rounded-lg border border-gray-200 shadow-sm">
        
// // //         {/* Tab Buttons */}
// // //         <div className="flex mb-6 gap-2">
// // //           <button
// // //             className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
// // //               activeTab === "login"
// // //                 ? "bg-whatsapp-green text-white shadow-md"
// // //                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
// // //             }`}
// // //             onClick={() => setActiveTab("login")}
// // //           >
// // //             Login
// // //           </button>
// // //           <button
// // //             className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
// // //               activeTab === "signup"
// // //                 ? "bg-whatsapp-green text-white shadow-md"
// // //                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
// // //             }`}
// // //             onClick={() => setActiveTab("signup")}
// // //           >
// // //             Sign Up
// // //           </button>
// // //         </div>

// // //         {/* Content Area */}
// // //         {activeTab === "login" ? <Login /> : <Signup />}
        
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default HomePage;


// // import React, { useState } from 'react';
// // import Login from '../components/Authentication/Login';
// // import Signup from '../components/Authentication/Signup';

// // const HomePage = () => {
// //   const [activeTab, setActiveTab] = useState("login");

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-teal via-green-400 to-whatsapp-green p-4">
      
// //       {/* Main Card */}
// //       <div className="w-full max-w-md backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/40 p-8 transition-all duration-300">
        
// //         {/* Logo + Heading */}
// //         <div className="text-center mb-8">
// //           <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg">
// //             <span className="text-white text-2xl font-bold">W</span>
// //           </div>
// //           <h1 className="text-3xl font-semibold text-gray-800">
// //             Welcome to WhatsApp Clone
// //           </h1>
// //           <p className="text-gray-500 text-sm mt-2">
// //             Connect instantly. Chat securely.
// //           </p>
// //         </div>

// //         {/* Tab Buttons */}
// //         <div className="flex mb-6 bg-gray-100 p-1 rounded-full">
// //           <button
// //             className={`w-1/2 py-2 rounded-full font-semibold transition-all duration-300 ${
// //               activeTab === "login"
// //                 ? "bg-whatsapp-green text-white shadow-md"
// //                 : "text-gray-600"
// //             }`}
// //             onClick={() => setActiveTab("login")}
// //           >
// //             Login
// //           </button>
// //           <button
// //             className={`w-1/2 py-2 rounded-full font-semibold transition-all duration-300 ${
// //               activeTab === "signup"
// //                 ? "bg-whatsapp-green text-white shadow-md"
// //                 : "text-gray-600"
// //             }`}
// //             onClick={() => setActiveTab("signup")}
// //           >
// //             Sign Up
// //           </button>
// //         </div>

// //         {/* Content */}
// //         <div className="transition-all duration-300">
// //           {activeTab === "login" ? <Login /> : <Signup />}
// //         </div>

// //       </div>
// //     </div>
// //   );
// // };

// // export default HomePage;



// import React, { useState } from "react";
// import Login from "../components/Authentication/Login";
// import Signup from "../components/Authentication/Signup";

// const HomePage = () => {
//   const [activeTab, setActiveTab] = useState("login");
//   const [actionLoading, setActionLoading] = useState(false);

//   // This will simulate upload-style interaction
//   const triggerAction = async () => {
//     if (actionLoading) return;

//     setActionLoading(true);

//     // simulate network delay
//     await new Promise((res) => setTimeout(res, 1500));

//     setActionLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-teal via-green-400 to-whatsapp-green p-4">

//       <div className="w-full max-w-md backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/40 p-8 transition-all duration-300">

//         {/* Logo + Heading */}
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg">
//             <span className="text-white text-2xl font-bold">W</span>
//           </div>
//           <h1 className="text-3xl font-semibold text-gray-800">
//             Welcome to WhatsApp Clone
//           </h1>
//           <p className="text-gray-500 text-sm mt-2">
//             Connect instantly. Chat securely.
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex mb-6 bg-gray-100 p-1 rounded-full">
//           <button
//             className={`w-1/2 py-2 rounded-full font-semibold transition-all duration-300 ${
//               activeTab === "login"
//                 ? "bg-whatsapp-green text-white shadow-md"
//                 : "text-gray-600"
//             }`}
//             onClick={() => setActiveTab("login")}
//           >
//             Login
//           </button>
//           <button
//             className={`w-1/2 py-2 rounded-full font-semibold transition-all duration-300 ${
//               activeTab === "signup"
//                 ? "bg-whatsapp-green text-white shadow-md"
//                 : "text-gray-600"
//             }`}
//             onClick={() => setActiveTab("signup")}
//           >
//             Sign Up
//           </button>
//         </div>

//         {/* Upload-style Action Feedback Bar */}
//         {actionLoading && (
//           <div className="mb-4">
//             <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
//               <div className="h-full bg-whatsapp-green animate-pulse w-full" />
//             </div>
//             <p className="text-xs text-gray-500 mt-2 text-center">
//               Processing request...
//             </p>
//           </div>
//         )}

//         {/* Form Area */}
//         <div
//           onClick={triggerAction}
//           className={`transition-all duration-300 ${
//             actionLoading ? "pointer-events-none opacity-70" : ""
//           }`}
//         >
//           {activeTab === "login" ? <Login /> : <Signup />}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default HomePage;



import React, { useState } from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-teal via-green-400 to-whatsapp-green p-4">

      <div className="w-full max-w-md backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/40 p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105">
            <span className="text-white text-2xl font-bold select-none">W</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome to WhatsApp Clone
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Connect instantly. Chat securely.
          </p>
        </div>

        {/* Tabs */}
        <div className="relative mb-6">
          <div className="flex bg-gray-100 p-1 rounded-full relative">

            {/* Sliding Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-whatsapp-green transition-all duration-300 ease-in-out ${
                activeTab === "login" ? "left-1" : "left-1/2"
              }`}
            />

            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`relative z-10 w-1/2 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none ${
                activeTab === "login" ? "text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`relative z-10 w-1/2 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none ${
                activeTab === "signup" ? "text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Content with Fade */}
        <div key={activeTab} className="transition-opacity duration-300 ease-in-out">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
