import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG assets from Figma
import iconSession from "../../assets/svg/icon-session.svg";
import iconBlocked from "../../assets/svg/icon-blocked.svg";
import iconActions from "../../assets/svg/icon-actions.svg";
import iconRisk from "../../assets/svg/icon-risk.svg";
import awsLogo from "../../assets/svg/aws-logo.svg";
import mssqlLogo from "../../assets/svg/mssql-logo.svg";
import gcpLogo from "../../assets/svg/gcp-logo.svg";
import windowsLogo from "../../assets/svg/windows-logo.svg";
import k8sLogo from "../../assets/svg/k8s-logo.svg";
import hubspotLogo from "../../assets/svg/hubspot-logo.svg";
import postgresSvg from "../../assets/svg/postgres-logo.svg";
import dubleUser from "../../assets/svg/duble-user.svg";
import groupMachine from "../../assets/svg/group-machine.svg";
import vector4 from "../../assets/svg/vector4.svg";
import figpie from "../../assets/svg/figpie.svg";
import ellipseGlow from "../../assets/svg/ellipse-glow.svg";
import passwordGauge from "../../assets/svg/password-gauge.svg";
import donutSecrets from "../../assets/svg/donut-secrets.svg";
import certChart from "../../assets/svg/cert-chart.svg";
import forensicTimeline from "../../assets/svg/forensic-timeline.svg";
import dotsIcon from "../../assets/svg/dots-icon.svg";
import refreshIcon from "../../assets/svg/refresh-icon.svg";
import searchIconSvg from "../../assets/svg/search-icon-correct.svg";
import k8sLogoCorrect from "../../assets/svg/k8s-logo-correct.svg";
import mysqlLogo from "../../assets/svg/mysql-logo.svg";

const ANIM_DELAY = 400;
const ANIM_DURATION = 7000;

function lerp(from, to, t) {
  return from + (to - from) * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function sliceProgress(progress, start, end) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return easeOut((progress - start) / (end - start));
}

const TABLE_ROWS = [
  { id: "AAM-HS-1776673121", user: "testuser@example.com", risk: 9,  target: "HubSpot",  logo: hubspotLogo,   status: "Active",   date: "Mar 17, 2026 17:58:41" },
  { id: "AAM-HS-1778673100", user: "testuser@example.com", risk: 54, target: "HubSpot",  logo: hubspotLogo,   status: "Blocked",  date: "Mar 17, 2026 17:58:20" },
  { id: "AAM-HS-1773673074", user: "testuser@example.com", risk: 17, target: "MYSQL",    logo: mysqlLogo,     status: "Active",   date: "Mar 17, 2026 17:57:54" },
  { id: "AAM-HS-1773678924", user: "testuser@example.com", risk: 25, target: "K8s",      logo: k8sLogoCorrect,status: "Inactive", date: "Mar 16, 2026 18:35:24" },
  { id: "AAM-HS-1773678905", user: "testuser@example.com", risk: 45, target: "Postgres", logo: postgresSvg,   status: "Blocked",  date: "Mar 16, 2026 18:17:49" },
];

const STATUS_COLORS = {
  Active:   { bg: "bg-emerald-100", text: "text-emerald-700" },
  Blocked:  { bg: "bg-red-100",     text: "text-red-600" },
  Inactive: { bg: "bg-gray-100",    text: "text-gray-500" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status];
  return (
    <span className={`inline-flex items-center px-[6px] py-[2px] rounded-[4px] text-[7px] font-semibold ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

function AnimatedNumber({ value, progress }) {
  const displayed = Math.round(lerp(0, value, progress));
  return <span>{displayed.toLocaleString()}</span>;
}

// Horizontal progress bar
function HBar({ value, max, color, progress }) {
  const pct = (value / max) * 100 * progress;
  return (
    <div className="h-[6px] rounded-full bg-gray-100 overflow-hidden w-full">
      <div
        className="h-full rounded-full transition-none"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Tooltip({ text, style, position = "top" }) {
  const bubbleStyle = {
    background: "#111",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 16px",
    fontSize: 11,
    fontWeight: 500,
    maxWidth: 220,
    textAlign: "center",
    lineHeight: 1.4,
    whiteSpace: "normal",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  };

  const isRight = position === "right";
  const isBottom = position === "bottom";

  const flexDir = isRight ? "row" : "column";
  const alignItems = "center";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 pointer-events-none"
      style={{ ...style, display: "flex", flexDirection: flexDir, alignItems }}
    >
      {isBottom && (
        <svg width="16" height="8" viewBox="0 0 16 8" style={{ display: "block", marginBottom: -1 }}>
          <path d="M0 8 L8 0 L16 8" fill="#111" />
        </svg>
      )}
      {isRight && (
        <svg width="8" height="16" viewBox="0 0 8 16" style={{ display: "block", marginRight: -1 }}>
          <path d="M8 0 L0 8 L8 16" fill="#111" />
        </svg>
      )}
      <div style={bubbleStyle}>{text}</div>
      {position === "top" && (
        <svg width="16" height="8" viewBox="0 0 16 8" style={{ display: "block", marginTop: -1 }}>
          <path d="M0 0 L8 8 L16 0" fill="#111" />
        </svg>
      )}
    </motion.div>
  );
}

export default function AkeylessDashboard() {
  const [progress, setProgress] = useState(0);
  const [agenticHovered, setAgenticHovered] = useState(false);
  const [kpiHoverProgress, setKpiHoverProgress] = useState(-1);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [forensicFlickerNode, setForensicFlickerNode] = useState(-1);
  const rafRef = useRef(null);
  const forensicFlickerRef = useRef(null);

  // Forensic flicker: sequentially blink each node once on hover (not looping)
  useEffect(() => {
    if (hoveredSection === "forensic") {
      const timers = [];
      // Node 0: blink at 200ms
      timers.push(setTimeout(() => setForensicFlickerNode(0), 200));
      timers.push(setTimeout(() => setForensicFlickerNode(-1), 350));
      // Node 1: blink at 550ms
      timers.push(setTimeout(() => setForensicFlickerNode(1), 550));
      timers.push(setTimeout(() => setForensicFlickerNode(-1), 700));
      // Node 2: blink at 900ms
      timers.push(setTimeout(() => setForensicFlickerNode(2), 900));
      timers.push(setTimeout(() => setForensicFlickerNode(-1), 1050));
      forensicFlickerRef.current = timers;
    } else {
      setForensicFlickerNode(-1);
      if (forensicFlickerRef.current) forensicFlickerRef.current.forEach(clearTimeout);
    }
    return () => { if (forensicFlickerRef.current) (Array.isArray(forensicFlickerRef.current) ? forensicFlickerRef.current.forEach(clearTimeout) : clearInterval(forensicFlickerRef.current)); };
  }, [hoveredSection]);

  useEffect(() => {
    let startTime = null;
    const delay = setTimeout(() => {
      const tick = (ts) => {
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / ANIM_DURATION, 1);
        setProgress(t);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, ANIM_DELAY);

    return () => {
      clearTimeout(delay);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // KPI hover re-count animation
  const kpiHoverRaf = useRef(null);
  useEffect(() => {
    if (!agenticHovered || progress < 1) return;
    let start = null;
    setKpiHoverProgress(0);
    const tick = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 800, 1);
      setKpiHoverProgress(easeOut(t));
      if (t < 1) kpiHoverRaf.current = requestAnimationFrame(tick);
    };
    kpiHoverRaf.current = requestAnimationFrame(tick);
    return () => { if (kpiHoverRaf.current) cancelAnimationFrame(kpiHoverRaf.current); };
  }, [agenticHovered]);

  // Section progress slices
  const p = {
    cards:      sliceProgress(progress, 0,    0.15),
    table:      sliceProgress(progress, 0.08, 0.45),
    forensic:   sliceProgress(progress, 0.15, 0.5),
    identity:   sliceProgress(progress, 0.25, 0.6),
    landscape:  sliceProgress(progress, 0.3,  0.65),
    vault:      sliceProgress(progress, 0.35, 0.7),
    riskbar:    sliceProgress(progress, 0.4,  0.7),
    certchart:  sliceProgress(progress, 0.45, 0.75),
    secrets:    sliceProgress(progress, 0.5,  0.8),
    encryption: sliceProgress(progress, 0.55, 0.85),
    password:   sliceProgress(progress, 0.6,  0.9),
  };

  const kpiProgress = kpiHoverProgress >= 0 ? kpiHoverProgress : p.cards;

  const FORENSIC_STAGE = progress < 0.3 ? 0 : progress < 0.55 ? 1 : 2;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 1057,
        height: 712,
        borderRadius: 22,
        background: "rgba(252,252,252,0.96)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 20px 80px rgba(0,0,0,0.15)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ─── TOP SECTION: Stat cards + table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute"
        style={{ left: 18, top: 18, width: 527, height: 292, cursor: "pointer" }}
        onMouseEnter={() => { setAgenticHovered(true); }}
        onMouseLeave={() => setAgenticHovered(false)}
      >
        <AnimatePresence>
          {agenticHovered && (
            <Tooltip
              text="Real-time monitoring of agentic AI sessions, blocked requests, and risk scores."
              position="bottom"
              style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        {/* Card container */}
        <div
          className="absolute inset-0 rounded-[11px] overflow-hidden"
          style={{
            background: "#fff",
            boxShadow: agenticHovered
              ? "0 8px 40px rgba(0,0,0,0.14)"
              : "0 4px 27px rgba(0,0,0,0.07)",
            border: agenticHovered ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          }}
        />


        {/* Stat cards row */}
        <div className="absolute flex gap-[6px]" style={{ left: 14, top: 14, width: 497, height: 49 }}>
          {[
            { icon: iconSession,  value: 14,  label: "Active Session",         color: "#05D9C2" },
            { icon: iconBlocked,  value: 7,   label: "Blocked Requests",       color: "#FD2B11" },
            { icon: iconActions,  value: 23,  label: "Total Actions",          color: "#05D9C2" },
            { icon: iconRisk,     value: 31,  label: "Average Risk Score",     color: "#F3982E", sub: "53 - 81.5" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="flex-1 rounded-[10px] p-[7px] flex flex-col gap-[3px]"
              style={{ background: "#fff", boxShadow: "0 4px 27px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start gap-[5px]">
                <img src={card.icon} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
                <div className="flex flex-col">
                  <span className="font-semibold text-[#111] leading-none" style={{ fontSize: 17 }}>
                    <AnimatedNumber value={card.value} progress={kpiProgress} />
                  </span>
                  <span className="text-[#111]" style={{ fontSize: 7 }}>{card.label}</span>
                  {card.sub && <span className="font-bold text-[#111]" style={{ fontSize: 6 }}>{card.sub}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table title + filter bar */}
        <div className="absolute flex items-center gap-[5px]" style={{ left: 14, top: 83, right: 14 }}>
          <span className="font-semibold text-[#0E0D1E] shrink-0" style={{ fontSize: 10 }}>Agentic Access Overview</span>

          {/* Filter icon button */}
          <div className="flex items-center justify-center rounded-[5px] shrink-0"
            style={{ width: 22, height: 22, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
            <img src={new URL('../../assets/svg/filter-icon.svg', import.meta.url).href} width="10" height="10" alt="filter" />
          </div>

          {/* Refresh icon button */}
          <div className="flex items-center justify-center rounded-[5px] shrink-0"
            style={{ width: 22, height: 22, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
            <img src={refreshIcon} alt="refresh" style={{ width: 14, height: 14 }} />
          </div>

          {/* DB tabs */}
          <div className="flex gap-[3px] items-center ml-auto">
            {[
              { label: "MySQL",      logo: mysqlLogo },
              { label: "Kubernetes", logo: k8sLogoCorrect },
              { label: "AWS",        logo: awsLogo },
              { label: "Postgres",   logo: postgresSvg, dropdown: true },
            ].map((tab) => (
              <div key={tab.label} className="flex items-center gap-[3px] rounded-[5px] px-[5px]"
                style={{ height: 22, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
                <img src={tab.logo} alt={tab.label} style={{ width: 12, height: 12, objectFit: "contain" }} />
                <span style={{ fontSize: 7, color: "#111" }}>{tab.label}</span>
                {tab.dropdown && (
                  <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                    <path d="M1 1l2.5 2.5L6 1" stroke="#727272" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}

            {/* Search */}
            <div className="flex items-center gap-[3px] rounded-[5px] px-[6px]"
              style={{ height: 22, width: 70, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
              <span style={{ fontSize: 6.5, color: "#B5B5B5", flex: 1 }}>Search</span>
              <img src={searchIconSvg} alt="search" style={{ width: 9, height: 9 }} />
            </div>
          </div>
        </div>

        {/* Table header */}
        <div className="absolute flex items-center" style={{ left: 14, top: 113, right: 14 }}>
          {[
            { label: "Agent Session ID", width: "22%" },
            { label: "User", width: "22%" },
            { label: "Risk Score", width: "10%" },
            { label: "Target Type", width: "14%" },
            { label: "Status", width: "10%" },
            { label: "Date", width: "20%" },
          ].map((h) => (
            <span key={h.label} className="font-semibold text-[#ADAEB0]" style={{ fontSize: 7, width: h.width, flexShrink: 0 }}>{h.label}</span>
          ))}
          <span style={{ width: 10, flexShrink: 0 }} />
        </div>

        {/* Table rows */}
        {TABLE_ROWS.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: p.table > i / 5 ? 1 : 0, x: p.table > i / 5 ? 0 : -8 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="absolute flex items-center"
            style={{ left: 14, top: 127 + i * 30, right: 14 }}
          >
            <span className="text-[#111] tracking-[-0.16px] truncate pr-[4px]" style={{ fontSize: 7.5, width: "22%", flexShrink: 0 }}>{row.id}</span>
            <span className="text-[#111] tracking-[-0.16px] truncate pr-[4px]" style={{ fontSize: 7.5, width: "22%", flexShrink: 0 }}>{row.user}</span>
            <span className="text-[#111] tracking-[-0.16px] font-medium" style={{ fontSize: 7.5, width: "10%", flexShrink: 0 }}>{row.risk}</span>
            <div className="flex items-center gap-[4px]" style={{ width: "14%", flexShrink: 0 }}>
              {row.logo && <img src={row.logo} alt="" style={{ width: 12, height: 12 }} />}
              <span className="text-[#111]" style={{ fontSize: 8 }}>{row.target}</span>
            </div>
            <div style={{ width: "10%", flexShrink: 0 }}>
              <StatusBadge status={row.status} />
            </div>
            <span className="text-[#111] tracking-[-0.16px]" style={{ fontSize: 7.5, width: "20%", flexShrink: 0 }}>{row.date}</span>
            <img src={dotsIcon} alt="" style={{ width: 10, height: 10, opacity: 0.5, flexShrink: 0 }} />
          </motion.div>
        ))}

      </motion.div>

      {/* ─── FORENSIC TRACEABILITY (top right) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute"
        style={{ left: 559, top: 18, width: 480, height: 292, cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("forensic")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "forensic" && (
            <Tooltip
              text="End-to-end session tracing with intercepted prompts, identity resolution, and policy enforcement."
              position="bottom"
              style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 rounded-[11px]"
          style={{ background: "#fff", boxShadow: hoveredSection === "forensic" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "forensic" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease" }} />

        <div className="absolute" style={{ left: 22, top: 12 }}>
          <p className="font-semibold text-[#111]" style={{ fontSize: 10 }}>Forensic Traceability</p>
          <p className="text-gray-400" style={{ fontSize: 7.5 }}>Incident Investigation: Session AAM-HS-177367110</p>
        </div>

        {/* Timeline line */}
        <div className="absolute" style={{ left: 30, top: 130, right: 30, height: 2, background: "#E8E9EF", borderRadius: 2 }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#05D9C2" }}
            animate={{ width: `${p.forensic * 100}%` }}
            transition={{ duration: 0 }}
          />
        </div>

        {/* Node 0: INTERCEPTED - card BELOW, timestamp ABOVE dot */}
        <span className="absolute text-gray-400" style={{ fontSize: 7, left: 68, top: 112, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>17:58:20.171</span>
        <div className="absolute rounded-full" style={{
          left: 60, top: 123, width: 16, height: 16, zIndex: 2,
          border: `2.5px solid ${FORENSIC_STAGE >= 0 ? "#05D9C2" : "#E8E9EF"}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.08s ease",
          opacity: forensicFlickerNode === 0 ? 0 : 1,
        }}>
          {FORENSIC_STAGE >= 0 && <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />}
        </div>
        <motion.div animate={{ opacity: p.forensic > 0.1 ? 1 : 0 }}
          className="absolute" style={{ left: 67.25, top: 139, width: 1.5, height: 14, background: "#05D9C2" }} />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: p.forensic > 0.1 ? 1 : 0, y: p.forensic > 0.1 ? 0 : 8 }}
          className="absolute rounded-[6px] p-[3px] pt-[2px]"
          style={{ left: 8, top: 153, width: 120,
            background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "opacity 0.08s ease", opacity: forensicFlickerNode === 0 ? 0 : 1 }}>
          <div className="inline-flex items-center px-[5px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#05D9C2", fontSize: 5.5 }}>
            <span className="font-bold text-white tracking-wide">INTERCEPTED</span>
          </div>
          <p className="font-semibold text-[#111] mb-[1px]" style={{ fontSize: 7.5 }}>Raw Prompt</p>
          <p className="text-gray-500" style={{ fontSize: 6, lineHeight: 1.3 }}>"What is the Walmart deal ARR?"</p>
        </motion.div>

        {/* Node 1: IDENTIFIED - card ABOVE, timestamp BELOW dot */}
        <div className="absolute rounded-full" style={{
          left: 200, top: 123, width: 16, height: 16, zIndex: 2,
          border: `2.5px solid ${FORENSIC_STAGE >= 1 ? "#05D9C2" : "#E8E9EF"}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.08s ease",
          opacity: forensicFlickerNode === 1 ? 0 : 1,
        }}>
          {FORENSIC_STAGE >= 1 && <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />}
        </div>
        <span className="absolute text-gray-400" style={{ fontSize: 7, left: 208, top: 142, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>17:58:20.171</span>
        <motion.div animate={{ opacity: p.forensic > 0.35 ? 1 : 0 }}
          className="absolute" style={{ left: 207.25, top: 109, width: 1.5, height: 14, background: "#05D9C2" }} />
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: p.forensic > 0.35 ? 1 : 0, y: p.forensic > 0.35 ? 0 : -8 }}
          className="absolute rounded-[6px] p-[3px] pt-[2px]"
          style={{ left: 148, bottom: 178, width: 120,
            background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "opacity 0.08s ease", opacity: forensicFlickerNode === 1 ? 0 : 1 }}>
          <div className="inline-flex items-center px-[5px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#05D9C2", fontSize: 5.5 }}>
            <span className="font-bold text-white tracking-wide">IDENTIFIED</span>
          </div>
          <p className="font-semibold text-[#111] mb-[1px]" style={{ fontSize: 7.5 }}>User</p>
          <p className="text-gray-500" style={{ fontSize: 6, lineHeight: 1.3 }}>'testuser@example.com' accessing HubSpot 'Walmart'.</p>
        </motion.div>

        {/* Node 2: BLOCKED - card BELOW, timestamp ABOVE dot */}
        <span className="absolute text-gray-400" style={{ fontSize: 7, left: 358, top: 112, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>17:58:20.176</span>
        <div className="absolute rounded-full" style={{
          left: 350, top: 123, width: 16, height: 16, zIndex: 2,
          border: `2.5px solid ${FORENSIC_STAGE >= 2 ? "#05D9C2" : "#E8E9EF"}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.08s ease",
          opacity: forensicFlickerNode === 2 ? 0 : 1,
        }}>
          {FORENSIC_STAGE >= 2 && <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />}
        </div>
        <motion.div animate={{ opacity: p.forensic > 0.65 ? 1 : 0 }}
          className="absolute" style={{ left: 357.25, top: 139, width: 1.5, height: 14, background: "#05D9C2" }} />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: p.forensic > 0.65 ? 1 : 0, y: p.forensic > 0.65 ? 0 : 8 }}
          className="absolute rounded-[6px] p-[3px] pt-[2px]"
          style={{ left: 293, top: 153, width: 140,
            background: forensicFlickerNode === 2 ? "rgba(253,43,17,0.06)" : "rgba(253,43,17,0.04)", border: forensicFlickerNode === 2 ? "1.5px solid rgba(253,43,17,0.4)" : "1px solid rgba(253,43,17,0.15)", boxShadow: forensicFlickerNode === 2 ? "0 0 12px rgba(253,43,17,0.2)" : "0 2px 12px rgba(0,0,0,0.06)", transition: "border 0.3s ease, box-shadow 0.3s ease" }}>
          <div className="inline-flex items-center px-[5px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#FD2B11", fontSize: 5.5 }}>
            <span className="font-bold text-white tracking-wide">BLOCKED</span>
          </div>
          <p className="mb-[3px]" style={{ fontSize: 6.5, lineHeight: 1.3 }}><span className="font-semibold text-[#111]">Access Denied:</span> <span className="text-gray-500">Command not allowed by policy.</span></p>
          <div className="rounded-[3px] p-[3px] mb-[2px]" style={{ background: "rgba(253,43,17,0.06)" }}>
            <p className="uppercase text-gray-400" style={{ fontSize: 4.5, lineHeight: 1.2, letterSpacing: "0.3px" }}>POLICY THAT BLOCKED</p>
            <p className="text-[#FD2B11] font-medium" style={{ fontSize: 6 }}>ForbiddenTerm</p>
          </div>
          <div className="rounded-[3px] p-[3px]" style={{ background: "rgba(253,43,17,0.06)" }}>
            <p className="uppercase text-gray-400" style={{ fontSize: 4.5, lineHeight: 1.2, letterSpacing: "0.3px" }}>MATCHED TERM</p>
            <p className="text-[#FD2B11] font-medium" style={{ fontSize: 6 }}>arr</p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          animate={{ opacity: p.forensic > 0.8 ? 1 : 0 }}
          className="absolute flex gap-[10px] items-center justify-end"
          style={{ right: 14, bottom: 10 }}
        >
          <button className="rounded-full border border-gray-300 px-[14px] py-[4px] text-[7px] text-gray-600 font-medium" style={{ background: "#fff" }}>Cancel</button>
          <button className="rounded-full px-[14px] py-[4px] text-[7px] text-white font-semibold"
            style={{ background: "#05D9C2" }}>Kill Switch</button>
          <button className="rounded-full px-[14px] py-[4px] text-[7px] font-medium"
            style={{ background: "#fff", border: "1px solid #FD2B11", color: "#FD2B11" }}>Revoke Lease</button>
        </motion.div>
      </motion.div>

      {/* ─── MIDDLE LEFT: Identity Authentication ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute rounded-[11px]"
        style={{ left: 18, top: 322, width: 332, height: 189,
          background: "#fff", boxShadow: hoveredSection === "identity" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "identity" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("identity")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "identity" && (
            <Tooltip
              text="Authentication method usage across cloud providers and platforms."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 14, fontSize: 10 }}>
          Identity Authentication Methods in Use
        </p>
        <div className="absolute flex flex-col gap-[18px]" style={{ left: 14, top: 42, right: 14 }}>
          {[
            { logo: awsLogo,     name: "AWS",     val: 200, max: 200, color: "#F3982E" },
            { logo: mssqlLogo,   name: "MSSQL",   val: 90,  max: 200, color: "#FF2B10" },
            { logo: gcpLogo,     name: "GCP",     val: 140, max: 200, color: "#05D9C2" },
            { logo: windowsLogo, name: "Windows", val: 60,  max: 200, color: "#5C7FC6" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-[8px]">
              <img src={item.logo} alt={item.name} style={{ width: 16, height: 16, flexShrink: 0, objectFit: "contain" }} />
              <span className="text-[#111] w-[44px] flex-shrink-0" style={{ fontSize: 8.5 }}>{item.name}</span>
              <div className="flex-1">
                <HBar value={item.val} max={item.max} color={item.color} progress={p.identity} />
              </div>
              <span className="text-[#111] w-[26px] text-right flex-shrink-0 font-medium" style={{ fontSize: 8.5 }}>
                <AnimatedNumber value={item.val} progress={p.identity} />
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── MIDDLE CENTER: Enterprise Identity Landscape ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute rounded-[11px]"
        style={{ left: 362, top: 322, width: 333, height: 89,
          background: "#fff", boxShadow: hoveredSection === "landscape" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)",
          border: hoveredSection === "landscape" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("landscape")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "landscape" && (
            <Tooltip
              text="Unified visibility across AI, human, and machine identities."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 12, fontSize: 10 }}>
          Enterprise Identity Landscape
        </p>
        <div className="absolute flex items-start gap-[24px]" style={{ left: 14, top: 34 }}>
          {[
            { icon: vector4,     label: "AI Agents",        value: 200, format: (v) => String(v) },
            { icon: dubleUser,   label: "Human Identity",   value: 8,   format: (v) => `${v}K` },
            { icon: groupMachine,label: "Machine Identity", value: 30,  format: (v) => `${v}K` },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-start gap-[2px]" style={{ width: 90 }}>
              <div className="flex items-center gap-[6px]">
                <img src={item.icon} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span className="font-bold text-[#111]" style={{ fontSize: 24, minWidth: 40 }}>
                  {item.format(Math.round(lerp(0, item.value, p.landscape)))}
                </span>
              </div>
              <span className="text-[#111]" style={{ fontSize: 7.5 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── MIDDLE CENTER: Identity Risk & Exposure Analysis ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="absolute rounded-[11px]"
        style={{ left: 362, top: 422, width: 333, height: 89,
          background: "#fff", boxShadow: hoveredSection === "risk" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "risk" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("risk")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "risk" && (
            <Tooltip
              text="Risk distribution across identities — from critical to low exposure levels."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 12, fontSize: 10 }}>
          Identity Risk &amp; Exposure Analysis
        </p>
        {/* Stacked bar */}
        <div className="absolute flex rounded-[4px] overflow-hidden" style={{ left: 14, top: 34, right: 14, height: 22 }}>
          {[
            { color: "#A70808", width: 5 * p.riskbar, label: "120", name: "Critical" },
            { color: "#C62828", width: 8 * p.riskbar, label: "450", name: "High" },
            { color: "#F3982E", width: 25 * p.riskbar,  label: "2200",name: "Medium" },
            { color: "#1ADDC7", width: 55 * p.riskbar,  label: "8000",name: "Low" },
          ].map((seg, i) => (
            <div key={i} className="flex items-center justify-center relative"
              style={{ flex: seg.width, backgroundColor: seg.color, minWidth: 0 }}>
              <span className="font-semibold text-white absolute" style={{ fontSize: 6.5 }}>{seg.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute flex items-center gap-[8px]" style={{ left: 14, top: 62 }}>
          {[
            { color: "#A70808", label: "Critical" },
            { color: "#C62828", label: "High" },
            { color: "#F3982E", label: "Medium" },
            { color: "#1ADDC7", label: "Low" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-[3px]">
              <div className="rounded-[2px]" style={{ width: 9, height: 9, background: l.color }} />
              <span style={{ fontSize: 7 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── MIDDLE RIGHT: External Vault & Secrets ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute rounded-[11px]"
        style={{ left: 706, top: 322, width: 333, height: 190,
          background: "#fff", boxShadow: hoveredSection === "vault" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "vault" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("vault")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "vault" && (
            <Tooltip
              text="Secrets synced from external vaults — AWS, Azure, HashiCorp, GCP, and K8s."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 22, top: 14, fontSize: 10 }}>
          External Vault &amp; Secrets Integrations
        </p>
        {/* Donut chart */}
        <div className="absolute" style={{ left: 18, top: 42, width: 120, height: 120 }}>
          <img src={figpie} alt="" style={{ width: "100%", height: "100%" }} />
          {/* Glass effect center */}
          <div className="absolute inset-[8%] rounded-full overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95) 0%, rgba(230,235,245,0.7) 50%, rgba(200,210,230,0.5) 100%)",
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 2px 8px rgba(255,255,255,0.8)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-semibold text-[#111]" style={{ fontSize: 25 }}>
              <AnimatedNumber value={89} progress={p.vault} />
            </span>
            <span className="text-[#111]" style={{ fontSize: 6.5 }}>Total Items</span>
          </div>
        </div>
        {/* Legend */}
        <div className="absolute flex flex-col gap-[10px]" style={{ left: 160, top: 52 }}>
          {[
            { color: "#F3982E", label: "AWS",            val: 32 },
            { color: "#5C7FC6", label: "Azure",          val: 19 },
            { color: "#111",    label: "Hashicorp Vault", val: 18 },
            { color: "#05D9C2", label: "GCP",            val: 10 },
            { color: "#275AC2", label: "K8s",            val: 10 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[6px]" style={{ width: 150 }}>
              <span className="flex-1 text-[#555]" style={{ fontSize: 8.5 }}>{item.label}</span>
              <div className="rounded-[3px] flex-shrink-0" style={{ width: 28, height: 12, background: item.color, borderRadius: 3 }} />
              <span className="text-[#111] font-medium" style={{ fontSize: 8.5, width: 16, textAlign: "right" }}>
                <AnimatedNumber value={item.val} progress={p.vault} />
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── BOTTOM ROW ─── */}

      {/* Certificate Lifecycle Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="absolute rounded-[11px]"
        style={{ left: 18, top: 523, width: 250, height: 170,
          background: "#fff", boxShadow: hoveredSection === "cert" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "cert" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("cert")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "cert" && (
            <Tooltip
              text="Certificate expiration tracking — from expired to 180-day renewal windows."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 12, fontSize: 10 }}>
          Certificate Lifecycle Health
        </p>
        <div className="absolute" style={{ left: 14, top: 30, right: 14, bottom: 14 }}>
          <div className="relative h-full flex items-end gap-[6px] pb-[16px]">
            {[
              { label: "Expired",    color: "#FD2B11", height: 35 },
              { label: "0-30 Days",  color: "#5C7FC6", height: 75 },
              { label: "60-90 Days", color: "#8B9FD4", height: 90 },
              { label: "90-180 Days",color: "#05D9C2", height: 110 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-[3px]">
                <motion.div
                  className="w-full rounded-t-[3px]"
                  style={{ backgroundColor: bar.color, height: bar.height * p.certchart }}
                />
                <span className="text-center text-[#111]" style={{ fontSize: 5.5 }}>{bar.label}</span>
              </div>
            ))}
          </div>
          {/* Y axis labels */}
          <div className="absolute top-0 left-[-2px] flex flex-col justify-between h-[calc(100%-20px)] items-end">
            {["1000","500","100","0"].map((v) => (
              <span key={v} className="text-[#111]" style={{ fontSize: 5.5 }}>{v}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dynamic Secrets Issued */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute rounded-[11px]"
        style={{ left: 280, top: 523, width: 250, height: 170,
          background: "#fff", boxShadow: hoveredSection === "secrets" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "secrets" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("secrets")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "secrets" && (
            <Tooltip
              text="Dynamic, short-lived secrets issued across AWS, GCP, databases, and AI services."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 12, fontSize: 10 }}>
          Dynamic Secrets Issued
        </p>
        {/* Donut */}
        <div className="absolute" style={{ left: 14, top: 28, width: 100, height: 100 }}>
          <img src={donutSecrets} alt="" style={{ width: "100%", height: "100%" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-semibold text-[#111]" style={{ fontSize: 18 }}>
              <AnimatedNumber value={12} progress={p.secrets} />K
            </span>
            <span className="text-[#111] text-center leading-tight" style={{ fontSize: 5.5 }}>Total Dynamic<br/>Secrets</span>
          </div>
        </div>
        {/* Legend */}
        <div className="absolute flex flex-col gap-[5px]" style={{ left: 122, top: 32 }}>
          {[
            { color: "#F3982E", label: "AWS",      val: 18 },
            { color: "#275AC2", label: "GCP",      val: 12 },
            { color: "#5C7FC6", label: "PostgreSQL",val: 9 },
            { color: "#8B9FD4", label: "MySQL",    val: 8 },
            { color: "#05D9C2", label: "OpenAI",   val: 7 },
            { color: "#111",    label: "Docker",   val: 6 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[4px]">
              <div className="rounded-[2px] flex-shrink-0" style={{ width: 7, height: 7, background: item.color }} />
              <span className="flex-1 text-[#111]" style={{ fontSize: 7 }}>{item.label}</span>
              <span className="text-[#111]" style={{ fontSize: 7 }}>
                <AnimatedNumber value={item.val} progress={p.secrets} />K
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Enterprise Encryption & Key Operations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="absolute rounded-[11px]"
        style={{ left: 542, top: 523, width: 250, height: 170,
          background: "#fff", boxShadow: hoveredSection === "encryption" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "encryption" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("encryption")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "encryption" && (
            <Tooltip
              text="Encryption transactions, tokenizers, and connected cloud accounts at a glance."
              position="top"
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 14, fontSize: 10 }}>
          Enterprise Encryption &amp; Key Operations
        </p>
        <div className="absolute flex flex-col gap-[14px]" style={{ left: 14, top: 38, right: 14 }}>
          {[
            { label: "Transactions",   barPct: 90, display: "2M" },
            { label: "Tokenizers",     barPct: 35, display: "50" },
            { label: "Cloud Accounts", barPct: 30, display: "45" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              <span className="text-[#111]" style={{ fontSize: 8 }}>{item.label}</span>
              <div className="flex items-center gap-[6px]">
                <div className="flex-1 h-[12px] rounded-[3px] bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-[3px]"
                    style={{ width: `${item.barPct * p.encryption}%`, backgroundColor: "#1ADDC7", transition: "none" }}
                  />
                </div>
                <span className="font-medium text-[#111] flex-shrink-0" style={{ fontSize: 8.5, minWidth: 18 }}>{item.display}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Password Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute rounded-[11px]"
        style={{ left: 804, top: 523, width: 235, height: 170,
          background: "#fff", boxShadow: hoveredSection === "password" ? "0 8px 40px rgba(0,0,0,0.14)" : "0 4px 27px rgba(0,0,0,0.07)", border: hoveredSection === "password" ? "1.5px solid rgba(5,217,194,0.4)" : "1.5px solid transparent", transition: "box-shadow 0.3s ease, border-color 0.3s ease", cursor: "pointer" }}
        onMouseEnter={() => setHoveredSection("password")}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AnimatePresence>
          {hoveredSection === "password" && (
            <Tooltip
              text="Overall password strength score based on complexity, reuse, and rotation policies."
              style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </AnimatePresence>
        <p className="absolute font-semibold text-[#111]" style={{ left: 14, top: 12, fontSize: 10 }}>
          Password Health
        </p>
        <div className="absolute flex flex-col items-center" style={{ left: 0, right: 0, top: 28 }}>
          <div className="relative" style={{ width: 190, height: 105 }}>
            <svg viewBox="0 0 190 105" width="190" height="105">
              <path
                d="M 18 97 A 77 77 0 0 1 172 97"
                fill="none"
                stroke="#EBEBEB"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <path
                d="M 18 97 A 77 77 0 0 1 172 97"
                fill="none"
                stroke="#1ADDC7"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={`${242 * 0.92 * p.password} 242`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ paddingBottom: 0 }}>
              <span className="font-semibold text-[#111] leading-none" style={{ fontSize: 38 }}>
                <AnimatedNumber value={92} progress={p.password} />
              </span>
              <span className="text-[#111]" style={{ fontSize: 8, marginTop: 2 }}>Out of 100</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 10%, rgba(5,217,194,0.04) 0%, transparent 60%)",
          zIndex: -1,
        }}
      />
    </div>
  );
}
