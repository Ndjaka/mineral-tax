import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add class to body to hide static SEO content and show React app
document.body.classList.add("js-loaded");

createRoot(document.getElementById("root")!).render(<App />);
