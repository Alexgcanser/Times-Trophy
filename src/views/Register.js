import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userPin = generatePin();

      await setDoc(doc(collection(db, "users"), user.uid), {
        email: user.email,
        pin: userPin,
        password,
      });

      setPin(userPin);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        padding: "40px",
        borderRadius: "15px",
        maxWidth: "500px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* LOGO */}
      <img
        src="/LOGO.png"
        alt="Logo Times Tropy"
        style={{
          width: "200px",
          height: "200px",
          objectFit: "contain",
          marginBottom: "25px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
      <h2 style={{ color: "#111", fontWeight: "700" }}>Registro</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "250px" }}
      />
      <br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "250px" }}
      />
      <br />
      <button
        onClick={handleRegister}
        style={{ padding: "10px 20px", margin: "10px" }}
      >
        Registrarse
      </button>
      <button
        onClick={() => navigate("/login")}
        style={{ padding: "10px 20px", margin: "10px" }}
      >
        Ya tienes cuenta, inicia sesión
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pin && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            color: "#000",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            ¡Registro Exitoso!
          </h3>
          <p style={{ fontSize: "20px", marginBottom: "20px" }}>
            Tu clave de 4 dígitos es:
            <strong
              style={{ fontSize: "28px", color: "#008000", marginLeft: "10px" }}
            >
              {pin}
            </strong>
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              onClick={() => setPin(null)}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#e0e0e0",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
