import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

function Chat() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { chatId: routeChatId } = useParams();

  const ADMIN_UID = "ith9P0tyZpaMofFw6reXv53UsiF2";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      console.log("UID del usuario autenticado:", firebaseUser.uid);

      setUser(firebaseUser);
      setIsAdmin(firebaseUser.uid === ADMIN_UID);

      let finalChatId = routeChatId;
      if (!routeChatId) {
        const ids = [firebaseUser.uid, ADMIN_UID].sort();
        finalChatId = `${ids[0]}_${ids[1]}`;
      }

      setChatId(finalChatId);

      const chatDocRef = doc(db, "chats", finalChatId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists() && !routeChatId) {
        await setDoc(chatDocRef, {
          participants: [firebaseUser.uid, ADMIN_UID],
          lastMessage: "",
          timestamp: serverTimestamp(),
        });
      }

      const messagesRef = collection(db, "chats", finalChatId, "messages");
      const q = query(messagesRef, orderBy("timestamp"));

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      return () => unsubscribeMessages();
    });

    return () => unsubscribe();
  }, [navigate, routeChatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId || !user) return;

    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      text: message,
      sender: user.email,
      timestamp: serverTimestamp(),
    });

    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: message,
        timestamp: serverTimestamp(),
      },
      { merge: true }
    );

    setMessage("");
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: "30px",
        borderRadius: "15px",
        maxWidth: "600px",
        margin: "40px auto",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        color: "#000",
      }}
    >
      <h2 style={{ color: "#111" }}>Chat</h2>

      <div
        style={{
          backgroundColor: "#f1f1f1",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px", textAlign: "left" }}>
            <strong>{msg.sender}</strong>
            <p style={{ margin: "5px 0" }}>{msg.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "70%",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            fontWeight: "bold",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Enviar
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Volver al Home
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate("/admin-inbox")}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Ver Chats de Usuarios
          </button>
        )}
      </div>
    </div>
  );
}

export default Chat;

