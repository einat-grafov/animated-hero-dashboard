import { useEffect, useState } from "react";
import AkeylessDashboard from "./components/AkeylessDashboard";

function useResponsiveScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Dashboard is 1057px wide, ~712px tall
      const scaleW = (w - 40) / 1057;
      const scaleH = (h - 40) / 712;
      setScale(Math.min(scaleW, scaleH, 1.4));
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
