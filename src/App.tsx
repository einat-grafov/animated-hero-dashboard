import { useEffect, useState } from "react";
import AkeylessDashboard from "./components/AkeylessDashboard";

function useResponsiveScale() {
  const [scale, setScale] = useState(0.9);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // Dashboard is ~1050px wide at scale 1
      if (w < 500) setScale(0.38);
      else if (w < 768) setScale(0.55);
      else if (w < 1024) setScale(0.7);
      else if (w < 1280) setScale(0.8);
      else setScale(0.9);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

export default function App() {
  const scale = useResponsiveScale();
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#eef0f5",
      padding: "20px",
      overflow: "hidden",
    }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        <AkeylessDashboard />
      </div>
    </div>
  );
}
