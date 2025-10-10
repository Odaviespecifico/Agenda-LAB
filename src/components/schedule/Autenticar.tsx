import { Header } from "./Utils.js";
import { signInWithGoogle } from "../../firebase.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase.js";
import { getAuth } from "firebase/auth";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(getAuth().currentUser)
  })
  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
      setTimeout(() => {
        navigate("/agenda");
      });
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gray-900 border  border-gray-700 shadow-2xl rounded-2xl p-10 flex flex-col items-center w-[90%] max-w-md">
        
        {/* Logo */}
        <img
          src="./dw logo-text.svg"
          alt="DW Logo"
          className="w-64 h-auto mb-6"
        />

        <h1 className="text-3xl font-extrabold text-white mb-3">
          Agenda LAB
        </h1>
        <h2 className="text-lg text-gray-300 mb-8">
          Entre com sua conta CNA
        </h2>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-slate-700 rounded-lg text-slate-200 bg-gray-800 hover:bg-gray-700 hover:shadow-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img
              className="w-6 h-6"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              loading="lazy"
              alt="google logo"
            />
          )}
          <span className="font-medium">
            {loading ? "Entrando..." : "Login com Google"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function AuthException() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
      setTimeout(() => {
        navigate("/agenda");
      });
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-10 flex flex-col items-center w-[90%] max-w-md text-center">
        
        {/* Logo */}
        <img
          src="./dw logo-text.svg"
          alt="DW Logo"
          className="w-64 h-auto mb-6"
        />

        {/* Exception Message */}
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Você precisa entrar com seu Email CNA!
        </h1>
        <p className="text-gray-300 mb-8">
          Para acessar o sistema, utilize sua conta CNA.
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-slate-700 rounded-lg text-slate-200 bg-gray-800 hover:bg-gray-700 hover:shadow-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img
              className="w-6 h-6"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              loading="lazy"
              alt="google logo"
            />
          )}
          <span className="font-medium">
            {loading ? "Entrando..." : "Login com Google"}
          </span>
        </button>
      </div>
    </div>
  );
}