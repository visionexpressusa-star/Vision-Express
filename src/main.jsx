import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/bootstrap.min.css";
import "./styles/admin.css";
import "./styles/app.css";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { AuthProvider } from "./lib/auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
