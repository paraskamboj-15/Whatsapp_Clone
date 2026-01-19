import React, { useState } from 'react';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="container max-w-xl mx-auto mt-10 p-4">
      {/* Header Box */}
      <div className="flex justify-center bg-white w-full p-4 mb-4 rounded-lg border border-gray-200 shadow-sm text-center">
        <h1 className="text-4xl font-light text-whatsapp-teal">WhatsApp Clone</h1>
      </div>

      {/* Main Box with Tabs */}
      <div className="bg-white w-full p-6 rounded-lg border border-gray-200 shadow-sm">
        
        {/* Tab Buttons */}
        <div className="flex mb-6 gap-2">
          <button
            className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
              activeTab === "login"
                ? "bg-whatsapp-green text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
              activeTab === "signup"
                ? "bg-whatsapp-green text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "login" ? <Login /> : <Signup />}
        
      </div>
    </div>
  );
};

export default HomePage;