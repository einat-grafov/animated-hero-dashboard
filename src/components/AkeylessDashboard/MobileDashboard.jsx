import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG assets
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
import donutSecrets from "../../assets/svg/donut-secrets.svg";
import certChart from "../../assets/svg/cert-chart.svg";
import forensicTimeline from "../../assets/svg/forensic-timeline.svg";
import dotsIcon from "../../assets/svg/dots-icon.svg";
import refreshIcon from "../../assets/svg/refresh-icon.svg";
import searchIconSvg from "../../assets/svg/search-icon-correct.svg";
import k8sLogoCorrect from "../../assets/svg/k8s-logo-correct.svg";
import mysqlLogo from "../../assets/svg/mysql-logo.svg";
import filterIcon from "../../assets/svg/filter-icon.svg";

// ─── Helpers ───
function lerp(from, to, t) { return from + (to - from) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function AnimatedNumber({ value, progress }) {
  return <span>{Math.round(lerp(0, value, progress)).toLocaleString()}</span>;
}

function StatusBadge({ status }) {
  const colors = {
    Active:   { bg: "bg-emerald-100", text: "text-emerald-700" },
    Blocked:  { bg: "bg-red-100",     text: "text-red-600" },
    Inactive: { bg: "bg-gray-100",    text: "text-gray-500" },
  };
  const c = colors[status];
  return (
    <span className={`inline-flex items-center justify-center py-[2px] rounded-[4px] text-[11px] font-semibold ${c.bg} ${c.text}`} style={{ width: 64 }}>
      {status}
    </span>
  );
}

// ─── Animation hook: animates from 0→1, replays each time isActive becomes true ───
function useOnceAnimation(isActive, duration = 1200) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      let start = null;
      let cancelled = false;
      const tick = (ts) => {
        if (cancelled) return;
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        setProgress(easeOut(t));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        cancelled = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      setProgress(0);
    }
  }, [isActive, duration]);

  return progress;
}

// ─── TABLE DATA ───
const TABLE_ROWS = [
  { id: "AAM-HS-1776673121", user: "testuser@example.com", risk: 9,  target: "HubSpot",  logo: hubspotLogo,   status: "Active",   date: "Mar 17, 2026 17:58:41" },
  { id: "AAM-HS-1778673100", user: "testuser@example.com", risk: 54, target: "HubSpot",  logo: hubspotLogo,   status: "Blocked",  date: "Mar 17, 2026 17:58:20" },
  { id: "AAM-HS-1773673074", user: "testuser@example.com", risk: 17, target: "MYSQL",    logo: mysqlLogo,     status: "Active",   date: "Mar 17, 2026 17:57:54" },
  { id: "AAM-HS-1773678924", user: "testuser@example.com", risk: 25, target: "K8s",      logo: k8sLogoCorrect,status: "Inactive", date: "Mar 16, 2026 18:35:24" },
  { id: "AAM-HS-1773678905", user: "testuser@example.com", risk: 45, target: "Postgres", logo: postgresSvg,   status: "Blocked",  date: "Mar 16, 2026 18:17:49" },
];

// ═══════════════════════════════════════════════
// SECTION COMPONENTS — each is a full-screen slide
// ═══════════════════════════════════════════════

function AgenticSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full" style={{ padding: 20 }}>
      <p className="font-semibold text-[#0E0D1E]" style={{ fontSize: 16, marginBottom: 12 }}>
        Agentic Access Overview
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-[8px]" style={{ marginBottom: 14 }}>
        {[
          { icon: iconSession, value: 14, label: "Active Session", color: "#05D9C2" },
          { icon: iconBlocked, value: 7,  label: "Blocked Requests", color: "#FD2B11" },
          { icon: iconActions, value: 23, label: "Total Actions", color: "#05D9C2" },
          { icon: iconRisk,    value: 31, label: "Average Risk Score", color: "#F3982E", sub: "9 - 54" },
        ].map((card, i) => (
          <div key={i} className="rounded-[10px] p-[10px] flex items-start gap-[8px]"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <img src={card.icon} alt="" style={{ width: 24, height: 24, flexShrink: 0 }} />
            <div className="flex flex-col">
              <span className="font-semibold text-[#111]" style={{ fontSize: 22, lineHeight: 1 }}>
                <AnimatedNumber value={card.value} progress={p} />
              </span>
              <span className="text-[#111]" style={{ fontSize: 10 }}>{card.label}</span>
              {card.sub && <span className="font-bold text-[#111]" style={{ fontSize: 9 }}>{card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-[6px] flex-wrap" style={{ marginBottom: 10 }}>
        <div className="flex items-center justify-center rounded-[5px] shrink-0"
          style={{ width: 28, height: 28, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={filterIcon} width="12" height="12" alt="filter" />
        </div>
        <div className="flex items-center justify-center rounded-[5px] shrink-0"
          style={{ width: 28, height: 28, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={refreshIcon} alt="refresh" style={{ width: 16, height: 16 }} />
        </div>
        {[
          { label: "MySQL", logo: mysqlLogo },
          { label: "K8s",   logo: k8sLogoCorrect },
          { label: "AWS",   logo: awsLogo },
          { label: "Postgres", logo: postgresSvg },
        ].map((tab) => (
          <div key={tab.label} className="flex items-center gap-[4px] rounded-[5px] px-[6px]"
            style={{ height: 28, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
            <img src={tab.logo} alt={tab.label} style={{ width: 14, height: 14, objectFit: "contain" }} />
            <span style={{ fontSize: 10, color: "#111" }}>{tab.label}</span>
          </div>
        ))}
        <div className="flex items-center rounded-[5px] px-[6px] gap-[4px]"
          style={{ height: 28, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={searchIconSvg} alt="search" style={{ width: 14, height: 14, opacity: 0.5 }} />
          <span style={{ fontSize: 10, color: "#999" }}>Search</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-[8px]" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div className="flex items-center px-[8px] py-[6px]" style={{ borderBottom: "1px solid #EDEDF0" }}>
          <span className="font-semibold text-[#ADAEB0]" style={{ fontSize: 9, width: "28%", flexShrink: 0 }}>Session ID</span>
          <span className="font-semibold text-[#ADAEB0]" style={{ fontSize: 9, width: "32%", flexShrink: 0 }}>User</span>
          <span className="font-semibold text-[#ADAEB0]" style={{ fontSize: 9, width: "12%", flexShrink: 0 }}>Risk</span>
          <span className="font-semibold text-[#ADAEB0]" style={{ fontSize: 9, width: "28%", flexShrink: 0 }}>Target</span>
        </div>
        {TABLE_ROWS.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: p > i / 5 ? 1 : 0, x: p > i / 5 ? 0 : -10 }}
            className="flex flex-col px-[8px] py-[6px]"
            style={{ borderBottom: "1px solid #F5F5F7" }}
          >
            {/* Row 1: Session ID, User, Risk, Target */}
            <div className="flex items-center">
              <span className="text-[#111] truncate pr-[2px]" style={{ fontSize: 9, width: "28%", flexShrink: 0 }}>{row.id}</span>
              <span className="text-[#111] truncate pr-[2px]" style={{ fontSize: 9, width: "32%", flexShrink: 0 }}>{row.user}</span>
              <span className="text-[#111] font-medium" style={{ fontSize: 9, width: "12%", flexShrink: 0 }}>{row.risk}</span>
              <div className="flex items-center gap-[3px]" style={{ width: "28%", flexShrink: 0 }}>
                <img src={row.logo} alt="" style={{ width: 14, height: 14 }} />
                <span className="text-[#111]" style={{ fontSize: 9 }}>{row.target}</span>
              </div>
            </div>
            {/* Row 2: Status + Date */}
            <div className="flex items-center gap-[8px]" style={{ marginTop: 4 }}>
              <StatusBadge status={row.status} />
              <span className="text-[#888]" style={{ fontSize: 8 }}>{row.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ForensicSection({ isActive }) {
  const p = useOnceAnimation(isActive, 2000);

  return (
    <div className="flex flex-col h-full" style={{ padding: 20 }}>
      <p className="font-semibold text-[#111]" style={{ fontSize: 16, marginBottom: 4 }}>
        Forensic Traceability
      </p>
      <p className="text-gray-400" style={{ fontSize: 10, marginBottom: 20 }}>
        Incident Investigation: Session AAM-HS-177367110
      </p>

      {/* Vertical timeline for mobile */}
      <div className="flex-1 flex flex-col gap-[24px] relative" style={{ paddingLeft: 30 }}>
        {/* Vertical line */}
        <div className="absolute" style={{ left: 14, top: 8, bottom: 8, width: 2, background: "#E8E9EF" }}>
          <motion.div className="w-full rounded-full" style={{ background: "#05D9C2", height: `${p * 100}%` }} />
        </div>

        {/* Node 0: INTERCEPTED */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: p > 0.1 ? 1 : 0, y: p > 0.1 ? 0 : 10 }}
          className="relative">
          <div className="absolute rounded-full" style={{
            left: -24, top: 4, width: 16, height: 16, zIndex: 2,
            border: "2.5px solid #05D9C2", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 9, marginBottom: 4 }}>17:58:20.171</span>
          <div className="rounded-[8px] p-[10px]" style={{ background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="inline-flex items-center px-[8px] py-[2px] rounded-[4px] mb-[4px]" style={{ background: "#05D9C2" }}>
              <span className="font-bold text-white" style={{ fontSize: 8 }}>INTERCEPTED</span>
            </div>
            <p className="font-semibold text-[#111]" style={{ fontSize: 11 }}>Raw Prompt</p>
            <p className="text-gray-500" style={{ fontSize: 9, lineHeight: 1.4 }}>"What is the Walmart deal ARR?"</p>
          </div>
        </motion.div>

        {/* Node 1: IDENTIFIED */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: p > 0.4 ? 1 : 0, y: p > 0.4 ? 0 : 10 }}
          className="relative">
          <div className="absolute rounded-full" style={{
            left: -24, top: 4, width: 16, height: 16, zIndex: 2,
            border: "2.5px solid #05D9C2", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 9, marginBottom: 4 }}>17:58:20.171</span>
          <div className="rounded-[8px] p-[10px]" style={{ background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="inline-flex items-center px-[8px] py-[2px] rounded-[4px] mb-[4px]" style={{ background: "#05D9C2" }}>
              <span className="font-bold text-white" style={{ fontSize: 8 }}>IDENTIFIED</span>
            </div>
            <p className="font-semibold text-[#111]" style={{ fontSize: 11 }}>User</p>
            <p className="text-gray-500" style={{ fontSize: 9, lineHeight: 1.4 }}>'testuser@example.com' accessing HubSpot 'Walmart'.</p>
          </div>
        </motion.div>

        {/* Node 2: BLOCKED */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: p > 0.7 ? 1 : 0, y: p > 0.7 ? 0 : 10 }}
          className="relative">
          <div className="absolute rounded-full" style={{
            left: -24, top: 4, width: 16, height: 16, zIndex: 2,
            border: "2.5px solid #05D9C2", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div className="rounded-full" style={{ width: 8, height: 8, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 9, marginBottom: 4 }}>17:58:20.176</span>
          <div className="rounded-[8px] p-[10px]" style={{ background: "rgba(253,43,17,0.04)", border: "1px solid rgba(253,43,17,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="inline-flex items-center px-[8px] py-[2px] rounded-[4px] mb-[4px]" style={{ background: "#FD2B11" }}>
              <span className="font-bold text-white" style={{ fontSize: 8 }}>BLOCKED</span>
            </div>
            <p className="mb-[4px]" style={{ fontSize: 10, lineHeight: 1.4 }}>
              <span className="font-semibold text-[#111]">Access Denied:</span>{" "}
              <span className="text-gray-500">Command not allowed by policy.</span>
            </p>
            <div className="rounded-[4px] p-[6px] mb-[4px]" style={{ background: "rgba(253,43,17,0.06)", borderLeft: "2px solid #FD2B11" }}>
              <p className="uppercase text-gray-400" style={{ fontSize: 7, letterSpacing: "0.3px" }}>POLICY THAT BLOCKED</p>
              <p className="text-[#FD2B11] font-medium" style={{ fontSize: 9 }}>ForbiddenTerm</p>
            </div>
            <div className="rounded-[4px] p-[6px]" style={{ background: "rgba(253,43,17,0.06)", borderLeft: "2px solid #F3C623" }}>
              <p className="uppercase text-gray-400" style={{ fontSize: 7, letterSpacing: "0.3px" }}>MATCHED TERM</p>
              <p className="text-[#FD2B11] font-medium" style={{ fontSize: 9 }}>arr</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div animate={{ opacity: p > 0.9 ? 1 : 0 }} className="flex gap-[10px] justify-center" style={{ marginTop: 16 }}>
        <button className="rounded-full border border-gray-300 px-[18px] py-[6px] text-[10px] text-gray-600 font-medium" style={{ background: "#fff" }}>Cancel</button>
        <button className="rounded-full px-[18px] py-[6px] text-[10px] text-white font-semibold" style={{ background: "#05D9C2" }}>Kill Switch</button>
        <button className="rounded-full px-[18px] py-[6px] text-[10px] font-medium" style={{ background: "#fff", border: "1px solid #FD2B11", color: "#FD2B11" }}>Revoke Lease</button>
      </motion.div>
    </div>
  );
}

function InlineTooltip({ text }) {
  return (
    <div className="flex items-center rounded-[8px]" style={{
      padding: "8px 12px",
      background: "linear-gradient(135deg, rgba(5,217,194,0.08) 0%, rgba(92,127,198,0.08) 100%)",
      border: "1px solid rgba(5,217,194,0.2)",
    }}>
      <span style={{ fontSize: 12, color: "#444", lineHeight: 1.4, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function IdentityCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ padding: 14 }}>
      {/* Identity Authentication Methods in Use */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 13, marginBottom: 6 }}>
        Identity Authentication Methods in Use
      </p>
      <div className="flex flex-col gap-[6px]" style={{ marginBottom: 8 }}>
        {[
          { logo: awsLogo,     name: "AWS",     val: 200, max: 200, color: "#F3982E" },
          { logo: mssqlLogo,   name: "MSSQL",   val: 90,  max: 200, color: "#FF2B10" },
          { logo: gcpLogo,     name: "GCP",     val: 140, max: 200, color: "#05D9C2" },
          { logo: windowsLogo, name: "Windows", val: 60,  max: 200, color: "#5C7FC6" },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-[8px]">
            <img src={item.logo} alt={item.name} style={{ width: 20, height: 20, flexShrink: 0, objectFit: "contain" }} />
            <span className="text-[#111] flex-shrink-0" style={{ fontSize: 10, width: 48 }}>{item.name}</span>
            <div className="flex-1 h-[8px] rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(item.val / item.max) * 100 * p}%`, backgroundColor: item.color }} />
            </div>
            <span className="text-[#111] font-medium flex-shrink-0" style={{ fontSize: 10, width: 28, textAlign: "right" }}>
              <AnimatedNumber value={item.val} progress={p} />
            </span>
          </div>
        ))}
      </div>
      <InlineTooltip text="Unified authentication and access across cloud, workloads, and enterprise identities." />

      {/* Divider */}
      <div style={{ height: 1, background: "#E8E9EF", margin: "8px 0" }} />

      {/* Enterprise Identity Landscape */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 13, marginBottom: 6 }}>
        Enterprise Identity Landscape
      </p>
      <div className="flex items-start justify-center" style={{ marginBottom: 8 }}>
        {[
          { icon: vector4,      label: "AI Agents",        value: 200, format: (v) => String(v) },
          { icon: dubleUser,    label: "Human Identity",   value: 8,   format: (v) => `${v}K` },
          { icon: groupMachine, label: "Machine Identity", value: 30,  format: (v) => `${v}K` },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center" style={{ width: "33.33%" }}>
            <img src={item.icon} alt="" style={{ width: 26, height: 26, marginBottom: 4 }} />
            <span className="font-bold text-[#111]" style={{ fontSize: 28, lineHeight: 1, height: 28 }}>
              {item.format(Math.round(lerp(0, item.value, p)))}
            </span>
            <span className="text-[#111]" style={{ fontSize: 9, marginTop: 4 }}>{item.label}</span>
          </div>
        ))}
      </div>
      <InlineTooltip text="Unified visibility across AI, human, and machine identities." />

      {/* Divider */}
      <div style={{ height: 1, background: "#E8E9EF", margin: "8px 0" }} />

      {/* Identity Risk & Exposure Analysis */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 13, marginBottom: 6 }}>
        Identity Risk &amp; Exposure Analysis
      </p>
      <div className="relative rounded-[6px] overflow-hidden" style={{ height: 28, marginBottom: 8 }}>
        <div className="absolute inset-0 bg-gray-100" />
        <div className="absolute inset-0 flex" style={{ width: `${p * 100}%`, transition: "none" }}>
          {[
            { color: "#A70808", flex: 5,  label: "120" },
            { color: "#C62828", flex: 8,  label: "450" },
            { color: "#F3982E", flex: 25, label: "2200" },
            { color: "#1ADDC7", flex: 55, label: "8000" },
          ].map((seg, i) => (
            <div key={i} className="flex items-center justify-center relative"
              style={{ flex: seg.flex, backgroundColor: seg.color, minWidth: 0, overflow: "hidden" }}>
              <span className="font-semibold text-white absolute" style={{ fontSize: 8, whiteSpace: "nowrap" }}>{seg.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        {[
          { color: "#A70808", label: "Critical" },
          { color: "#C62828", label: "High" },
          { color: "#F3982E", label: "Medium" },
          { color: "#1ADDC7", label: "Low" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-[4px]">
            <div className="rounded-[2px]" style={{ width: 10, height: 10, background: l.color }} />
            <span style={{ fontSize: 9 }}>{l.label}</span>
          </div>
        ))}
      </div>
      <InlineTooltip text="AI-powered risk detection across identities and secrets." />
    </div>
  );
}

function VaultSecretsCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full" style={{ padding: 16 }}>
      {/* External Vault & Secrets Integrations */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 15, marginBottom: 12 }}>
        External Vault &amp; Secrets Integrations
      </p>
      <div className="flex items-center gap-[20px]" style={{ marginBottom: 12 }}>
        <div className="relative" style={{ width: 130, height: 130, flexShrink: 0 }}>
          <div className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from -90deg, #F3982E 0% 35.96%, #5C7FC6 35.96% 57.30%, #111111 57.30% 77.53%, #05D9C2 77.53% 88.76%, #275AC2 88.76% 100%)" }} />
          <div className="absolute inset-[10%] rounded-full overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95) 0%, rgba(230,235,245,0.7) 50%, rgba(200,210,230,0.5) 100%)", backdropFilter: "blur(8px)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-semibold text-[#111]" style={{ fontSize: 28 }}>
              <AnimatedNumber value={89} progress={p} />
            </span>
            <span className="text-[#111]" style={{ fontSize: 10 }}>Total Items</span>
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          {[
            { color: "#F3982E", label: "AWS", val: 32 },
            { color: "#5C7FC6", label: "Azure", val: 19 },
            { color: "#111",    label: "Hashicorp Vault", val: 18 },
            { color: "#05D9C2", label: "GCP", val: 10 },
            { color: "#275AC2", label: "K8s", val: 10 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[8px]">
              <div className="rounded-[2px] flex-shrink-0" style={{ width: 12, height: 12, background: item.color }} />
              <span className="flex-1 text-[#555]" style={{ fontSize: 12 }}>{item.label}</span>
              <span className="text-[#111] font-medium" style={{ fontSize: 12, width: 22, textAlign: "right" }}>
                <AnimatedNumber value={item.val} progress={p} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <InlineTooltip text="Centralized governance across distributed secrets vaults." />

      <div style={{ height: 1, background: "#E8E9EF", margin: "16px 0" }} />

      {/* Dynamic Secrets Issued */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 15, marginBottom: 12 }}>
        Dynamic Secrets Issued
      </p>
      <div className="flex items-center gap-[20px]" style={{ marginBottom: 12 }}>
        <div className="relative" style={{ width: 130, height: 130, flexShrink: 0 }}>
          <div className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from -90deg, #F3982E 0% 30%, #275AC2 30% 50%, #5C7FC6 50% 65%, #05D9C2 65% 78.333%, #111111 78.333% 90%, #4A8FF0 90% 100%)" }} />
          <div className="absolute inset-[10%] rounded-full overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.97) 0%, rgba(240,242,248,0.85) 60%, rgba(220,225,238,0.7) 100%)", backdropFilter: "blur(8px)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-semibold text-[#111]" style={{ fontSize: 24 }}>
              <AnimatedNumber value={60} progress={p} />K
            </span>
            <span className="text-[#111] text-center leading-tight" style={{ fontSize: 9 }}>Total Dynamic<br/>Secrets</span>
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          {[
            { color: "#F3982E", label: "AWS", val: 18 },
            { color: "#275AC2", label: "GCP", val: 12 },
            { color: "#5C7FC6", label: "PostgreSQL", val: 9 },
            { color: "#05D9C2", label: "MySQL", val: 8 },
            { color: "#111",    label: "OpenAI", val: 7 },
            { color: "#4A8FF0", label: "Docker", val: 6 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[8px]">
              <div className="rounded-[2px] flex-shrink-0" style={{ width: 12, height: 12, background: item.color }} />
              <span className="flex-1 text-[#111]" style={{ fontSize: 12 }}>{item.label}</span>
              <span className="text-[#111] font-medium" style={{ fontSize: 12, width: 24, textAlign: "right" }}>
                <AnimatedNumber value={item.val} progress={p} />K
              </span>
            </div>
          ))}
        </div>
      </div>
      <InlineTooltip text="Just-in-time credentials replacing static access keys." />
    </div>
  );
}


function CertSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1200);

  return (
    <div className="flex flex-col h-full" style={{ padding: 20 }}>
      <p className="font-semibold text-[#111]" style={{ fontSize: 16, marginBottom: 16 }}>
        Certificate Lifecycle Health
      </p>
      <div className="flex-1 relative" style={{ minHeight: 200 }}>
        <div className="absolute left-0 top-0 flex flex-col justify-between items-end" style={{ height: "calc(100% - 30px)", width: 30 }}>
          {["1000","750","500","250","0"].map((v) => (
            <span key={v} className="text-[#888]" style={{ fontSize: 9 }}>{v}</span>
          ))}
        </div>
        <div className="absolute flex items-end justify-around" style={{ left: 36, top: 0, right: 0, bottom: 30 }}>
          {[
            { label: "Expired",     gradient: "linear-gradient(180deg, #FD2B11 0%, #E8837A 100%)", heightPct: 23 },
            { label: "0-30 Days",   gradient: "linear-gradient(180deg, #F3982E 0%, #F5BC73 100%)", heightPct: 58 },
            { label: "60-90 Days",  gradient: "linear-gradient(180deg, #5C7FC6 0%, #8BA5D8 100%)", heightPct: 82 },
            { label: "90-180 Days", gradient: "linear-gradient(180deg, #05D9C2 0%, #5DE8D6 100%)", heightPct: 100 },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center justify-end gap-[6px]" style={{ height: "100%", flex: 1 }}>
              <div className="rounded-t-[4px]" style={{ background: bar.gradient, height: `${bar.heightPct * p}%`, width: "60%", maxWidth: 50 }} />
              <span className="text-[#555] whitespace-nowrap" style={{ fontSize: 8 }}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EncryptionPasswordCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1200);

  return (
    <div className="flex flex-col h-full" style={{ padding: 16 }}>
      {/* Enterprise Encryption & Key Operations */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 15, marginBottom: 14 }}>
        Enterprise Encryption &amp; Key Operations
      </p>
      <div className="flex flex-col gap-[16px]" style={{ marginBottom: 12 }}>
        {[
          { label: "Transactions",   barPct: 90, value: 2, suffix: "M" },
          { label: "Tokenizers",     barPct: 35, value: 50, suffix: "" },
          { label: "Cloud Accounts", barPct: 30, value: 45, suffix: "" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-[4px]">
            <span className="text-[#111]" style={{ fontSize: 12 }}>{item.label}</span>
            <div className="flex items-center gap-[8px]">
              <div className="flex-1 h-[14px] rounded-[4px] bg-gray-100 overflow-hidden">
                <div className="h-full rounded-[4px]" style={{ width: `${item.barPct * p}%`, backgroundColor: "#1ADDC7" }} />
              </div>
              <span className="font-medium text-[#111] flex-shrink-0" style={{ fontSize: 12, minWidth: 24 }}>
                <AnimatedNumber value={item.value} progress={p} />{item.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>
      <InlineTooltip text="Centralized encryption and key management across cloud platforms." />

      <div style={{ height: 1, background: "#E8E9EF", margin: "16px 0" }} />

      {/* Password Health */}
      <p className="font-semibold text-[#111]" style={{ fontSize: 15, marginBottom: 12 }}>
        Password Health
      </p>
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: 200, height: 120 }}>
          <svg viewBox="0 0 220 130" width="200" height="120">
            <path d="M 22 120 A 90 90 0 0 1 198 120" fill="none" stroke="#EBEBEB" strokeWidth="16" strokeLinecap="round" />
            <path d="M 22 120 A 90 90 0 0 1 198 120" fill="none" stroke="#1ADDC7" strokeWidth="16" strokeLinecap="round"
              strokeDasharray={`${283 * 0.92 * p} 283`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ paddingBottom: 6 }}>
            <span className="font-semibold text-[#111] leading-none" style={{ fontSize: 40 }}>
              <AnimatedNumber value={92} progress={p} />
            </span>
            <span className="text-[#111]" style={{ fontSize: 11, marginTop: 8 }}>Out of 100</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <InlineTooltip text="Real-time evaluation of password and credential security posture." />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN CAROUSEL COMPONENT
// ═══════════════════════════════════════════════

const SECTIONS = [
  { Component: AgenticSection,              description: ["Track every agent session from prompt to action."] },
  { Component: ForensicSection,             description: ["See exactly why agent actions were blocked by policy."] },
  { Component: IdentityCombinedSection,     description: [
    "Unified authentication and access across cloud, workloads, and enterprise identities.",
    "Unified visibility across AI, human, and machine identities.",
    "AI-powered risk detection across identities and secrets.",
  ]},
  { Component: VaultSecretsCombinedSection, description: [
    "Centralized governance across distributed secrets vaults.",
    "Just-in-time credentials replacing static access keys.",
  ]},
  { Component: CertSection,                description: ["Prevent outages with automated certificate lifecycle monitoring."] },
  { Component: EncryptionPasswordCombinedSection, description: [
    "Centralized encryption and key management across cloud platforms.",
    "Real-time evaluation of password and credential security posture.",
  ]},
];

export default function MobileDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const touchStart = useRef(null);
  const touchDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback((idx) => {
    setActiveIndex(Math.max(0, Math.min(idx, SECTIONS.length - 1)));
  }, []);

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
    setDragOffset(touchDelta.current);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }
    touchStart.current = null;
  };

  // Also support mouse drag for desktop preview
  const mouseStart = useRef(null);
  const mouseDelta = useRef(0);

  const handleMouseDown = (e) => {
    mouseStart.current = e.clientX;
    mouseDelta.current = 0;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (mouseStart.current === null) return;
    mouseDelta.current = e.clientX - mouseStart.current;
    setDragOffset(mouseDelta.current);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset(0);
    if (Math.abs(mouseDelta.current) > 50) {
      if (mouseDelta.current < 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }
    mouseStart.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        width: "100%",
        height: "75vh",
        borderRadius: 16,
        background: "rgba(252,252,252,0.96)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
        fontFamily: "'Poppins', sans-serif",
        touchAction: "pan-y",
        userSelect: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
    >
      {/* Slides container */}
      <div
        className="absolute"
        style={{
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          bottom: 80,
          width: `${SECTIONS.length * 100}%`,
          transform: `translateX(calc(-${activeIndex * (100 / SECTIONS.length)}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {SECTIONS.map(({ Component }, i) => (
          <div key={i} style={{ width: `${100 / SECTIONS.length}%`, height: "100%", flexShrink: 0, overflow: "hidden" }}>
            <Component isActive={i === activeIndex} />
          </div>
        ))}
      </div>

      {/* Fixed description bar at bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center"
        style={{
          background: "linear-gradient(180deg, rgba(252,252,252,0) 0%, rgba(252,252,252,0.95) 30%)",
          padding: "16px 20px 14px",
        }}
      >
        {/* Only show bottom tooltip for non-identity slides (identity has inline tooltips) */}
        {SECTIONS[activeIndex].description.length === 1 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center rounded-[10px]"
              style={{
                marginBottom: 12,
                maxWidth: 340,
                padding: "8px 14px",
                background: "linear-gradient(135deg, rgba(5,217,194,0.08) 0%, rgba(92,127,198,0.08) 100%)",
                border: "1px solid rgba(5,217,194,0.2)",
              }}
            >
              <p className="text-center" style={{
                fontSize: 12,
                lineHeight: 1.4,
                color: "#444",
                fontWeight: 500,
              }}>
                {SECTIONS[activeIndex].description[0]}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Dot indicators */}
        <div className="flex gap-[8px]">
          {SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                background: i === activeIndex ? "#05D9C2" : "#D1D5DB",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
