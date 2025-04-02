import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function AdminPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const listaUsuarios = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando usuarios...</p>;
  }

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
      <h2 style={{ marginBottom: "30px", color: "#111" }}>
        Panel de Administración
      </h2>

      {usuarios.map((usuario, index) => (
        <button
        key={index}
        onClick={() => navigate(`/user/${usuario.uid}`)}  // ← Aquí el fix
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
        {usuario.email}
      </button>
      ))}

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

export default AdminPanel;
