import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
// @ts-ignore — types ship with framer-motion
import { LazyMotion, domAnimation } from "framer-motion";
import AkeylessDashboard from "./components/AkeylessDashboard";
import MobileDashboard from "./components/AkeylessDashboard/MobileDashboard";

// Import CSS as a string (not injected into document.head).
// @ts-ignore — Vite ?inline query returns a string
import styles from "./akeyless-hero.css?inline";

const BREAKPOINT = 640;
const NATIVE_W = 1057;
const NATIVE_H = 712;
const MAX_SCALE = 1.4;

function DesktopView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(w / NATIVE_W, MAX_SCALE));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: NATIVE_H * scale,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <AkeylessDashboard />
      </div>
    </div>
  );
}

function MobileView() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <MobileDashboard />
    </div>
  );
}

function ResponsiveRoot() {
  const getIsMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia(`(max-width: ${BREAKPOINT}px)`).matches;
  const [isMobile, setIsMobile] = useState(getIsMobile);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile ? <MobileView /> : <DesktopView />;
}

// ─── Shadow DOM mount ───
// Attaches a closed shadow root, injects the widget's CSS into it,
// and mounts React inside. This creates a hard CSS boundary:
// - Host page CSS cannot leak IN (buttons, text, etc. stay untouched)
// - Widget CSS cannot leak OUT (no global style pollution)
const mount = (el: HTMLElement) => {
  const shadow = el.attachShadow({ mode: "open" });

  // Inject scoped styles into the shadow root (not document.head)
  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // Also load Poppins font at document level (fonts are document-scoped)
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2"][href*="Poppins"]')) {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(fontLink);
  }

  // Create React mount point inside shadow
  const mountDiv = document.createElement("div");
  shadow.appendChild(mountDiv);

  const root = createRoot(mountDiv);
  // LazyMotion + domAnimation wraps the tree once so the slim `m.div` components
  // inside the dashboard work without bundling the full framer-motion runtime.
  root.render(
    <LazyMotion features={domAnimation}>
      <ResponsiveRoot />
    </LazyMotion>
  );
  return () => root.unmount();
};

const el = document.getElementById("akeyless-hero");
if (el) mount(el);

(window as any).AkeylessHero = { mount };
