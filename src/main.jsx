import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import "normalize.css";
import "./index.css";
import App from "./App.jsx";
import bigCandy from "/big-candy.svg";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* bg image */}
    <div className="bg-img"></div>

    {/* big candy */}
    <img src={bigCandy} className="big-candy" />
    <App />
  </StrictMode>
);
