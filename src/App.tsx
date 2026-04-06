import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AkeylessDashboard from "./components/AkeylessDashboard";
import MobileDashboard from "./components/AkeylessDashboard/MobileDashboard";

function useResponsiveScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
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

function DesktopPage() {
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

function MobilePage() {
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      background: "#eef0f5",
      overflow: "hidden",
    }}>
      <MobileDashboard />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesktopPage />} />
        <Route path="/mobile" element={<MobilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
