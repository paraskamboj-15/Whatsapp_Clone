import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ChatProvider from './context/ChatProvider' 
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider> 
        <App />
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>,
)