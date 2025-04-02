import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

function AdminInbox() {
  const [userChats, setUserChats] = useState([]);
  const navigate = useNavigate();

  const ADMIN_UID = "XMBdtqg9f8SwLYrFMxy47fpnV8f1"; // Tu UID de admin

  useEffect(() => {
    const fetchChats = async () => {
      const chatsCollection = await getDocs(collection(db, "chats"));
      const chatList = [];

      for (const docSnap of chatsCollection.docs) {
        const chatData = docSnap.data();
        const participants = chatData.participants;

        // Obtener el UID que NO sea del admin
        const userUID = participants.find((uid) => uid !== ADMIN_UID);

        // Obtener el email desde Firestore
        let userEmail = "Usuario desconocido";
        if (userUID) {
          const userDoc = await getDoc(doc(db, "users", userUID));
          if (userDoc.exists()) {
            userEmail = userDoc.data().email;
          }
        }

        chatList.push({
          chatId: docSnap.id,
          userEmail,
        });
      }

      setUserChats(chatList);
    };

    fetchChats();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "40px",
        borderRadius: "15px",
        maxWidth: "600px",
        margin: "40px auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "30px", color: "#111" }}>Bandeja de Entrada</h2>
      {userChats.length > 0 ? (
        userChats.map((chat, index) => (
          <button
            key={index}
            onClick={() => navigate(`/chat/${chat.chatId}`)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "15px",
              padding: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
            }}
          >
            Chat con: {chat.userEmail}
          </button>
        ))
      ) : (
        <p>No hay chats activos.</p>
      )}

      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Volver al Home
      </button>
      
    </div>
  );
}

export default AdminInbox;




