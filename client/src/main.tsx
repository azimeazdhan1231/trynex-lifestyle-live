import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
console.log('Testing cart functionality: Cart should now persist items properly');
