import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [recoveredPin, setRecoveredPin] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      let userFound = null;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.pin === pin) {
          userFound = userData;
        }
      });

      if (userFound) {
        await signInWithEmailAndPassword(auth, userFound.email, userFound.password);
        navigate("/home");
      } else {
        setError("Clave incorrecta. Intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  const handleRecoverPin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        forgotEmail,
        forgotPassword
      );
      const user = userCredential.user;

      const querySnapshot = await getDocs(collection(db, "users"));
      let pinEncontrado = null;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === user.email) {
          pinEncontrado = userData.pin;
        }
      });

      if (pinEncontrado) {
        setRecoveredPin(pinEncontrado);
        setError("");
      } else {
        setError("No se encontró ningún PIN asociado.");
      }
    } catch (error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "15px",
          maxWidth: "500px",
          margin: "auto",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        {/* LOGO */}
        <img
          src="/LOGO.png"
          alt="Logo Times Tropy"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            marginBottom: "25px",
          }}
        />

        <h2 style={{ color: "#111", fontWeight: "700" }}>Fichar con Clave</h2>
        <p style={{ color: "#222" }}>
          Ingresa tu clave de 4 dígitos para fichar.
        </p>

        <input
          type="text"
          placeholder="Clave de 4 dígitos"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{
            padding: "10px",
            margin: "10px",
            width: "250px",
            fontSize: "18px",
            textAlign: "center",
          }}
        />
        <br />

        <button
          onClick={handleLogin}
          style={{ padding: "10px 20px", margin: "10px", fontSize: "16px" }}
        >
          Fichar
        </button>

        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 20px", margin: "10px", fontSize: "16px" }}
        >
          Volver al Registro
        </button>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            maxWidth: "300px",
            margin: "20px auto",
          }}
        >
          <button
            onClick={() => setShowForgot(!showForgot)}
            style={{
              background: "none",
              border: "none",
              color: "#007BFF",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ¿Has olvidado tu clave para fichar?
          </button>
        </div>

        {showForgot && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Recuperar Clave</h3>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              style={{ padding: "10px", marginBottom: "10px", width: "90%" }}
            />
            <br />
            <input
              type="password"
              placeholder="Contraseña"
              value={forgotPassword}
              onChange={(e) => setForgotPassword(e.target.value)}
              style={{ padding: "10px", marginBottom: "10px", width: "90%" }}
            />
            <br />
            <button
              onClick={handleRecoverPin}
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              Enviar clave
            </button>

            {recoveredPin && (
              <p
                style={{ marginTop: "15px", color: "green", fontWeight: "bold" }}
              >
                Tu clave para fichar es: {recoveredPin}
              </p>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: "red", fontSize: "16px", marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
