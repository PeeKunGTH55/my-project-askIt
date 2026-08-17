import "../styles/globals.css";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Toaster />
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Header />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
