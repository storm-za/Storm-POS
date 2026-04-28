import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;

// Only hydrate when the server has rendered real element content
// (not just the placeholder HTML comment <!--ssr-outlet-->)
if (rootElement.firstElementChild) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
