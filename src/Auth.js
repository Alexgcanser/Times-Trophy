import React, { useState } from "react";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Función para generar un PIN aleatorio de 4 dígitos
  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userPin = generatePin();

      // Guardar el PIN en Firestore
      await setDoc(doc(collection(db, "users"), user.uid), {
        email: user.email,
        pin: userPin,
      });

      setUser(user);
      setPin(userPin);
      setError("");
      console.log("✅ Usuario registrado con PIN:", userPin);
    } catch (error) {
      setError(error.message);
      console.error("❌ Error en el registro:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el PIN del usuario en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userPin = userDoc.exists() ? userDoc.data().pin : "No asignado";

      setUser(user);
      setPin(userPin);
      setError("");
      console.log("✅ Usuario autenticado. PIN:", userPin);
    } catch (error) {
      setError(error.message);
      console.error("❌ Error en el inicio de sesión:", error);
    }
  };

  return (
    <div>
      <h2>Autenticación con Firebase</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Registrarse</button>
      <button onClick={handleLogin}>Iniciar Sesión</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {user && (
        <p style={{ color: "green" }}>
          Bienvenido, {user.email} 🎉 <br />
          Tu PIN de fichaje es: <strong>{pin}</strong>
        </p>
      )}
    </div>
  );
}

export default Auth;

