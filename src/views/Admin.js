import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [marcajesSeleccionados, setMarcajesSeleccionados] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuarios = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const lista = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsuarios(lista);
    };

    cargarUsuarios();
  }, []);

  const verMarcajes = async (usuario) => {
    const marcajesSnapshot = await getDocs(collection(db, "users", usuario.uid, "marcajes"));
    const listaMarcajes = marcajesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMarcajesSeleccionados(listaMarcajes);
    setUsuarioActual(usuario);
  };

  const eliminarMarcaje = async (marcajeId) => {
    if (!usuarioActual) return;
    await deleteDoc(doc(db, "users", usuarioActual.uid, "marcajes", marcajeId));
    setMarcajesSeleccionados(prev => prev.filter(m => m.id !== marcajeId));
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "40px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "40px",
        borderRadius: "15px",
        maxWidth: "700px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 style={{ color: "#111" }}>Panel de Administración</h2>

      <h3>Usuarios</h3>
      {usuarios.map((usuario) => (
        <div key={usuario.uid} style={{ marginBottom: "10px" }}>
          <strong>{usuario.email}</strong>
          <button
            onClick={() => verMarcajes(usuario)}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Ver Marcajes
          </button>
        </div>
      ))}

      {usuarioActual && (
        <div style={{ marginTop: "30px" }}>
          <h3>Marcajes de {usuarioActual.email}</h3>
          {marcajesSeleccionados.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {marcajesSeleccionados.map((marcaje) => (
                <li
                  key={marcaje.id}
                  style={{
                    backgroundColor: marcaje.tipo === "Entrada" ? "green" : "red",
                    color: "white",
                    margin: "5px auto",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "250px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {marcaje.tipo}: {marcaje.tiempo}
                  </span>
                  <button
                    onClick={() => eliminarMarcaje(marcaje.id)}
                    style={{
                      marginLeft: "10px",
                      padding: "5px 10px",
                      backgroundColor: "black",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay marcajes.</p>
          )}
        </div>
      )}

      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Volver al Home
      </button>
    </div>
  );
}

export default Admin;
