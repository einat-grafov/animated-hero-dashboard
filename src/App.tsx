import AkeylessDashboard from "./components/AkeylessDashboard";

export default function App() {
  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#eef0f5",
      padding: "40px 20px",
    }}>
      <div style={{ transform: "scale(0.9)", transformOrigin: "center center" }}>
        <AkeylessDashboard />
      </div>
    </div>
  );
}
