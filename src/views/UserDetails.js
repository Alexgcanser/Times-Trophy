import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function UserDetails() {
  const { uid } = useParams();
  const [marcajesPorDia, setMarcajesPorDia] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarcajes = async () => {
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

    fetchMarcajes();
  }, [uid]);

  const handleEliminar = async (marcajeId) => {
    await deleteDoc(doc(db, "users", uid, "marcajes", marcajeId));
    setMarcajesPorDia((prev) => {
      const nuevo = { ...prev };
      nuevo[diaSeleccionado] = nuevo[diaSeleccionado].filter((m) => m.id !== marcajeId);
      return nuevo;
    });
  };

  const handleEditar = async (marcajeId, nuevoTipo, nuevoTiempo) => {
    const ref = doc(db, "users", uid, "marcajes", marcajeId);
    await updateDoc(ref, { tipo: nuevoTipo, tiempo: nuevoTiempo });

    setMarcajesPorDia((prev) => {
      const actualizado = prev[diaSeleccionado].map((m) =>
        m.id === marcajeId ? { ...m, tipo: nuevoTipo, tiempo: nuevoTiempo } : m
      );
      return { ...prev, [diaSeleccionado]: actualizado };
    });
  };

  const handleAgregarMarcaje = async () => {
    const tipo = prompt("Tipo (Entrada/Salida):");
    const tiempo = prompt("Hora (HH:mm):");

    if (tipo && tiempo) {
      const [hora, minuto] = tiempo.split(":");
      const fecha = new Date(`${diaSeleccionado}T${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}:00`);

      const nuevoMarcajeRef = await addDoc(collection(db, "users", uid, "marcajes"), {
        tipo,
        tiempo,
        timestamp: fecha,
      });

      setMarcajesPorDia((prev) => ({
        ...prev,
        [diaSeleccionado]: [
          ...prev[diaSeleccionado],
          { id: nuevoMarcajeRef.id, tipo, tiempo, timestamp: fecha },
        ],
      }));
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Detalles del Usuario</h2>
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
            <p>No hay marcajes.</p>
          )}
        </>
      ) : (
        <>
          <h3>Marcajes del {diaSeleccionado}</h3>
          {marcajesPorDia[diaSeleccionado].map((m) => (
            <div key={m.id} style={{ marginBottom: "10px" }}>
              <strong>{m.tipo}</strong> - {m.tiempo}
              <br />
              <button onClick={() => handleEliminar(m.id)} style={{ marginRight: "10px" }}>
                Eliminar
              </button>
              <button
                onClick={() => {
                  const nuevoTipo = prompt("Nuevo tipo (Entrada/Salida):", m.tipo);
                  const nuevoTiempo = prompt("Nuevo tiempo (HH:mm):", m.tiempo);
                  if (nuevoTipo && nuevoTiempo) {
                    handleEditar(m.id, nuevoTipo, nuevoTiempo);
                  }
                }}
              >
                Editar
              </button>
            </div>
          ))}

          <button
            onClick={handleAgregarMarcaje}
            style={{
              marginTop: "20px",
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Añadir Marcaje
          </button>

          <button
            onClick={() => setDiaSeleccionado(null)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginLeft: "10px",
            }}
          >
            Volver a días
          </button>
        </>
      )}

      <button
        onClick={() => navigate("/admin")}
        style={{
          marginTop: "30px",
          backgroundColor: "red",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Volver al Panel
      </button>
    </div>
  );
}

export default UserDetails;

