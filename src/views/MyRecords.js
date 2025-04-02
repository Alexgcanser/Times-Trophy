import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

function MyRecords() {
  const [user, setUser] = useState(null);
  const [marcajesPorDia, setMarcajesPorDia] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchMarcajes(firebaseUser.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchMarcajes = async (uid) => {
    const q = query(
      collection(db, "users", uid, "marcajes"),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(q);
    const agrupados = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha = new Date(data.timestamp.toDate());
      const dia = fecha.toISOString().split("T")[0];

      if (!agrupados[dia]) agrupados[dia] = [];
      agrupados[dia].push({ id: doc.id, ...data });
    });

    setMarcajesPorDia(agrupados);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Mis Marcajes</h2>
      {!diaSeleccionado ? (
        <>
          <h3>Días con fichajes</h3>
          {Object.keys(marcajesPorDia).length > 0 ? (
            Object.keys(marcajesPorDia).map((dia) => (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(dia)}
                style={{
                  display: "block",
                  margin: "10px auto",
                  padding: "10px 20px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {dia}
              </button>
            ))
          ) : (
            <p>No hay marcajes registrados.</p>
          )}
        </>
      ) : (
        <>
          <h3>Marcajes del {diaSeleccionado}</h3>
          {marcajesPorDia[diaSeleccionado].map((m) => (
            <div key={m.id} style={{ marginBottom: "10px" }}>
              <strong>{m.tipo}</strong> - {m.tiempo}
            </div>
          ))}
          <button
            onClick={() => setDiaSeleccionado(null)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Volver a días
          </button>
        </>
      )}

      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: "30px",
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
    </div>
  );
}

export default MyRecords;
