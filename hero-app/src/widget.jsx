import { createRoot } from "react-dom/client";
import AkeylessDashboard from "./components/AkeylessDashboard";
import "./index.css";

const mount = (el) => {
  const root = createRoot(el);
  root.render(<AkeylessDashboard />);
  return () => root.unmount();
};

// Auto-mount if container exists
const el = document.getElementById("akeyless-hero-widget");
if (el) mount(el);

// Expose for manual WordPress mounting
window.AkeylessHeroWidget = { mount };
