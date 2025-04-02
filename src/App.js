import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./views/Register";
import Login from "./views/Login";
import Home from "./views/Home";
import VantaBackground from "./components/VantaBackground";
import Chat from "./views/Chat";
import AdminInbox from "./views/AdminInbox";
import AdminPanel from "./views/AdminPanel";
import UserDetails from "./views/UserDetails";
import MyRecords from "./views/MyRecords";

function App() {
  return (
    <VantaBackground>
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin-inbox" element={<AdminInbox />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/user/:uid" element={<UserDetails />} />
          <Route path="/my-records" element={<MyRecords />} />
        </Routes>
      </Router>
    </VantaBackground>
  );
}

export default App;

