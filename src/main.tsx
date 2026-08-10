import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";

document.addEventListener("contextmenu", (e) => {
  const isOverVideo = (e.target as HTMLElement).closest("video");
  if (isOverVideo) return;
  e.preventDefault();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
