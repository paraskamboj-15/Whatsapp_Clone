# 💬 Real-Time WhatsApp Clone

A full-stack real-time messaging application built with the MERN stack and Socket.io.

## 🚀 Features

* **Real-time Messaging:** Instant chat using Socket.io (no page refresh).
* **Authentication:** Secure Login/Signup with JWT & Password Encryption.
* **Group Chats:** Create groups, add/remove members.
* **Typing Indicators:** See when users are typing in real-time.
* **Notifications:** Real-time badges for unread messages.
* **Image Uploads:** Profile picture uploads via Cloudinary.
* **Search:** Live user search to start conversations.

## 🛠️ Tech Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Real-Time:** Socket.io
* **Cloud Storage:** Cloudinary

## ⚙️ Installation & Run Locally

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/paraskamboj-15/Whatsapp_Clone.git](https://github.com/paraskamboj-15/Whatsapp_Clone.git)
    ```

2.  **Install Dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the `server` folder and add:
    ```env
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

4.  **Run the App:**
    ```bash
    # Run Server (from server folder)
    npm run dev

    # Run Client (from client folder)
    npm run dev
    ```

## 📸 Screenshots

<!-- *(You can add screenshots of your Login page and Chat window here later!)* -->