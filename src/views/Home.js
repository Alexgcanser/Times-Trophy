import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";

function Home() {
  const [email, setEmail] = useState("");
  const [fichajes, setFichajes] = useState([]);
  const [ultimoFichaje, setUltimoFichaje] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.isAdmin || false);
        }
        await cargarFichajes(user.uid);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const cargarFichajes = async (uid) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const marcajesRef = collection(db, "users", uid, "marcajes");
      const q = query(marcajesRef, orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);

      const fichajesHoy = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const fichajeDate =
          data.timestamp.toDate?.() ?? new Date(data.timestamp);
        const esHoy = fichajeDate.toDateString() === today.toDateString();
        if (esHoy) {
          fichajesHoy.push({ tipo: data.tipo, tiempo: data.tiempo });
        }
      });

      setFichajes(fichajesHoy);
      setUltimoFichaje(fichajesHoy[fichajesHoy.length - 1] || null);
    } catch (e) {
      console.error("Error al cargar marcajes:", e);
    }
  };

  const registrarFichaje = async (tipo) => {
    const now = new Date();
    const hora = now.getHours();
    const minuto = now.getMinutes();
    const tiempo = `${hora}:${minuto < 10 ? "0" + minuto : minuto}`;

    if (tipo === "Entrada" && ultimoFichaje?.tipo === "Entrada") {
      setError(
        "¡Ya has fichado entrada! No puedes registrar otra sin una salida."
      );
      return;
    }

    if (
      tipo === "Salida" &&
      (!ultimoFichaje || ultimoFichaje.tipo === "Salida")
    ) {
      setError(
        "¡No puedes registrar una salida sin haber fichado entrada primero!"
      );
      return;
    }

    try {
      await addDoc(collection(db, "users", userId, "marcajes"), {
        tipo,
        tiempo,
        timestamp: new Date(),
      });

      const nuevoFichaje = { tipo, tiempo };
      setFichajes([...fichajes, nuevoFichaje]);
      setUltimoFichaje(nuevoFichaje);
      setError("");
    } catch (error) {
      console.error("Error al registrar fichaje:", error);
      setError("Error al registrar fichaje.");
    }
  };

  const cerrarSesion = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  const currentMonth = new Date();
  const today = new Date().getDate();

  const getCalendarDays = () => {
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    return Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
  };

  if (loading) {
    return <p style={{ textAlign: "center", fontSize: "18px" }}>Cargando...</p>;
  }

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "40px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "40px",
        borderRadius: "15px",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 style={{ color: "#111" }}>Bienvenido, {email}</h2>

      <h3 style={{ color: "#333" }}>Fichar</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => registrarFichaje("Entrada")}
          style={{
            width: "120px",
            height: "50px",
            backgroundColor: "green",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Entrada
        </button>
        <button
          onClick={() => registrarFichaje("Salida")}
          style={{
            width: "120px",
            height: "50px",
            backgroundColor: "red",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Salida
        </button>
      </div>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <h3 style={{ marginTop: "30px", color: "#333" }}>Mis Marcajes Hoy</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        {fichajes.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {fichajes.map((fichaje, index) => (
              <li
                key={index}
                style={{
                  fontSize: "18px",
                  margin: "5px 0",
                  padding: "10px",
                  borderRadius: "5px",
                  color: "black",
                  backgroundColor: fichaje.tipo === "Entrada" ? "green" : "red",
                  width: "200px",
                  textAlign: "center",
                }}
              >
                {fichaje.tipo}: {fichaje.tiempo}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aún no hay marcajes hoy.</p>
        )}
      </div>

      <h3 style={{ marginTop: "30px", color: "#333" }}>Calendario</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
          maxWidth: "350px",
          margin: "auto",
        }}
      >
        {getCalendarDays().map((day, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              border: "1px solid black",
              textAlign: "center",
              backgroundColor: day === today ? "green" : "white",
              color: day === today ? "white" : "black",
              fontWeight: day === today ? "bold" : "normal",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* BOTONES FINALES */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          marginTop: "30px",
        }}
      >
        {isAdmin && (
          <>
            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Panel de Administrador
            </button>

            <button
              onClick={() => navigate("/admin-inbox")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ver Chats de Usuarios
            </button>
          </>
        )}

        {!isAdmin && (
          <button
            onClick={() => navigate("/my-records")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Ver Mis Marcajes
          </button>
        )}

        <button
          onClick={() => navigate("/chat")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c63ff",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Hablar con Admin
        </button>

        <button
          onClick={cerrarSesion}
          style={{
            padding: "10px 20px",
            backgroundColor: "red",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
