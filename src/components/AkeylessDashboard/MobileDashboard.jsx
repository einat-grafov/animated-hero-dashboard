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
const TABLE_ROWS_ALL = [
  { id: "AAM-HS-1776673121", user: "testuser@example.com", risk: 9,  target: "HubSpot",  logo: hubspotLogo,   status: "Active",   date: "Mar 17, 2026 17:58:41" },
  { id: "AAM-HS-1778673100", user: "testuser@example.com", risk: 54, target: "HubSpot",  logo: hubspotLogo,   status: "Blocked",  date: "Mar 17, 2026 17:58:20" },
  { id: "AAM-HS-1773673074", user: "testuser@example.com", risk: 17, target: "MYSQL",    logo: mysqlLogo,     status: "Active",   date: "Mar 17, 2026 17:57:54" },
  { id: "AAM-HS-1773678924", user: "testuser@example.com", risk: 25, target: "K8s",      logo: k8sLogoCorrect,status: "Inactive", date: "Mar 16, 2026 18:35:24" },
  { id: "AAM-HS-1773678905", user: "testuser@example.com", risk: 45, target: "Postgres", logo: postgresSvg,   status: "Blocked",  date: "Mar 16, 2026 18:17:49" },
];
const TABLE_ROWS = TABLE_ROWS_ALL.slice(0, 4);

// ═══════════════════════════════════════════════
// SECTION COMPONENTS — each is a full-screen slide
// ═══════════════════════════════════════════════

function AgenticSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full" style={{ padding: 12 }}>
      <p className="font-semibold text-[#0E0D1E]" style={{ fontSize: 14, marginBottom: 6 }}>
        Agentic Access Overview
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-[6px]" style={{ marginBottom: 8 }}>
        {[
          { icon: iconSession, value: 14, label: "Active Session", color: "#05D9C2" },
          { icon: iconBlocked, value: 7,  label: "Blocked Requests", color: "#FD2B11" },
          { icon: iconActions, value: 23, label: "Total Actions", color: "#05D9C2" },
          { icon: iconRisk,    value: 31, label: "Average Risk Score", color: "#F3982E", sub: "9 - 54" },
        ].map((card, i) => (
          <div key={i} className="rounded-[8px] p-[8px] flex items-start gap-[6px]"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <img src={card.icon} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
            <div className="flex flex-col">
              <span className="font-semibold text-[#111]" style={{ fontSize: 18, lineHeight: 1 }}>
                <AnimatedNumber value={card.value} progress={p} />
              </span>
              <span className="text-[#111]" style={{ fontSize: 9 }}>{card.label}</span>
              {card.sub && <span className="font-bold text-[#111]" style={{ fontSize: 8 }}>{card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-[4px] flex-wrap" style={{ marginBottom: 6 }}>
        <div className="flex items-center justify-center rounded-[5px] shrink-0"
          style={{ width: 24, height: 24, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={filterIcon} width="10" height="10" alt="filter" />
        </div>
        <div className="flex items-center justify-center rounded-[5px] shrink-0"
          style={{ width: 24, height: 24, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={refreshIcon} alt="refresh" style={{ width: 14, height: 14 }} />
        </div>
        {[
          { label: "MySQL", logo: mysqlLogo },
          { label: "K8s",   logo: k8sLogoCorrect },
          { label: "AWS",   logo: awsLogo },
          { label: "Postgres", logo: postgresSvg },
        ].map((tab) => (
          <div key={tab.label} className="flex items-center gap-[3px] rounded-[5px] px-[5px]"
            style={{ height: 24, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
            <img src={tab.logo} alt={tab.label} style={{ width: 12, height: 12, objectFit: "contain" }} />
            <span style={{ fontSize: 9, color: "#111" }}>{tab.label}</span>
          </div>
        ))}
        <div className="flex items-center rounded-[5px] px-[5px] gap-[3px]"
          style={{ height: 24, background: "rgba(42,56,63,0.05)", border: "1px solid #EBECF3" }}>
          <img src={searchIconSvg} alt="search" style={{ width: 12, height: 12, opacity: 0.5 }} />
          <span style={{ fontSize: 9, color: "#999" }}>Search</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col rounded-[8px]" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", minHeight: 0 }}>
        {/* Header */}
        <div className="flex items-center px-[6px] py-[5px]" style={{ borderBottom: "1px solid #EDEDF0" }}>
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
            className="flex flex-col px-[6px] flex-1 justify-center"
            style={{ borderBottom: "1px solid #F5F5F7" }}
          >
            <div className="flex items-center">
              <span className="text-[#111] truncate pr-[2px]" style={{ fontSize: 9, width: "28%", flexShrink: 0 }}>{row.id}</span>
              <span className="text-[#111] truncate pr-[2px]" style={{ fontSize: 9, width: "32%", flexShrink: 0 }}>{row.user}</span>
              <span className="text-[#111] font-medium" style={{ fontSize: 9, width: "12%", flexShrink: 0 }}>{row.risk}</span>
              <div className="flex items-center gap-[3px]" style={{ width: "28%", flexShrink: 0 }}>
                <img src={row.logo} alt="" style={{ width: 14, height: 14 }} />
                <span className="text-[#111]" style={{ fontSize: 9 }}>{row.target}</span>
              </div>
            </div>
            <div className="flex items-center gap-[6px]" style={{ marginTop: 2 }}>
              <StatusBadge status={row.status} />
              <span className="text-[#888]" style={{ fontSize: 8 }}>{row.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 6 }}>
        <InlineTooltip text="Track every agent session from prompt to action." />
      </div>
    </div>
  );
}

function ForensicSection({ isActive }) {
  const p = useOnceAnimation(isActive, 2000);

  return (
    <div className="flex flex-col h-full" style={{ padding: 12 }}>
      <p className="font-semibold text-[#111]" style={{ fontSize: 14, marginBottom: 2 }}>
        Forensic Traceability
      </p>
      <p className="text-gray-400" style={{ fontSize: 9, marginBottom: 10 }}>
        Incident Investigation: Session AAM-HS-177367110
      </p>

      <div className="flex-1 flex flex-col gap-[14px] relative" style={{ paddingLeft: 26 }}>
        <div className="absolute" style={{ left: 12, top: 6, bottom: 6, width: 2, background: "#E8E9EF" }}>
          <motion.div className="w-full rounded-full" style={{ background: "#05D9C2", height: `${p * 100}%` }} />
        </div>

        {/* INTERCEPTED */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: p > 0.1 ? 1 : 0, y: p > 0.1 ? 0 : 8 }} className="relative">
          <div className="absolute rounded-full" style={{ left: -20, top: 3, width: 14, height: 14, zIndex: 2, border: "2px solid #05D9C2", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="rounded-full" style={{ width: 6, height: 6, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 8, marginBottom: 2 }}>17:58:20.171</span>
          <div className="rounded-[6px] p-[8px]" style={{ background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="inline-flex items-center px-[6px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#05D9C2" }}>
              <span className="font-bold text-white" style={{ fontSize: 7 }}>INTERCEPTED</span>
            </div>
            <p className="font-semibold text-[#111]" style={{ fontSize: 10 }}>Raw Prompt</p>
            <p className="text-gray-500" style={{ fontSize: 8, lineHeight: 1.3 }}>"What is the ACME deal ARR?"</p>
          </div>
        </motion.div>

        {/* IDENTIFIED */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: p > 0.4 ? 1 : 0, y: p > 0.4 ? 0 : 8 }} className="relative">
          <div className="absolute rounded-full" style={{ left: -20, top: 3, width: 14, height: 14, zIndex: 2, border: "2px solid #05D9C2", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="rounded-full" style={{ width: 6, height: 6, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 8, marginBottom: 2 }}>17:58:20.171</span>
          <div className="rounded-[6px] p-[8px]" style={{ background: "#fff", border: "1px solid #E8E9EF", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="inline-flex items-center px-[6px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#05D9C2" }}>
              <span className="font-bold text-white" style={{ fontSize: 7 }}>IDENTIFIED</span>
            </div>
            <p className="font-semibold text-[#111]" style={{ fontSize: 10 }}>User</p>
            <p className="text-gray-500" style={{ fontSize: 8, lineHeight: 1.3 }}>'testuser@example.com' accessing HubSpot 'ACME'.</p>
          </div>
        </motion.div>

        {/* BLOCKED */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: p > 0.7 ? 1 : 0, y: p > 0.7 ? 0 : 8 }} className="relative">
          <div className="absolute rounded-full" style={{ left: -20, top: 3, width: 14, height: 14, zIndex: 2, border: "2px solid #05D9C2", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="rounded-full" style={{ width: 6, height: 6, background: "#05D9C2" }} />
          </div>
          <span className="text-gray-400 block" style={{ fontSize: 8, marginBottom: 2 }}>17:58:20.176</span>
          <div className="rounded-[6px] p-[8px]" style={{ background: "rgba(253,43,17,0.04)", border: "1px solid rgba(253,43,17,0.15)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="inline-flex items-center px-[6px] py-[1px] rounded-[3px] mb-[3px]" style={{ background: "#FD2B11" }}>
              <span className="font-bold text-white" style={{ fontSize: 7 }}>BLOCKED</span>
            </div>
            <p className="mb-[2px]" style={{ fontSize: 9, lineHeight: 1.3 }}>
              <span className="font-semibold text-[#111]">Access Denied:</span>{" "}
              <span className="text-gray-500">Command not allowed by policy.</span>
            </p>
            <div className="rounded-[3px] p-[4px] mb-[3px]" style={{ background: "rgba(253,43,17,0.06)", borderLeft: "2px solid #FD2B11" }}>
              <p className="uppercase text-gray-400" style={{ fontSize: 6, letterSpacing: "0.3px" }}>POLICY THAT BLOCKED</p>
              <p className="text-[#FD2B11] font-medium" style={{ fontSize: 8 }}>ForbiddenTerm</p>
            </div>
            <div className="rounded-[3px] p-[4px]" style={{ background: "rgba(253,43,17,0.06)", borderLeft: "2px solid #F3C623" }}>
              <p className="uppercase text-gray-400" style={{ fontSize: 6, letterSpacing: "0.3px" }}>MATCHED TERM</p>
              <p className="text-[#FD2B11] font-medium" style={{ fontSize: 8 }}>arr</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div animate={{ opacity: p > 0.9 ? 1 : 0 }} className="flex gap-[8px] justify-center" style={{ marginTop: 10 }}>
        <button className="rounded-full border border-gray-300 px-[14px] py-[4px] text-[9px] text-gray-600 font-medium" style={{ background: "#fff" }}>Cancel</button>
        <button className="rounded-full px-[14px] py-[4px] text-[9px] text-white font-semibold" style={{ background: "#E53E3E" }}>Kill Switch</button>
        <button className="rounded-full px-[14px] py-[4px] text-[9px] font-medium" style={{ background: "#fff", border: "1px solid #FD2B11", color: "#FD2B11" }}>Revoke Lease</button>
      </motion.div>
      <div style={{ marginTop: 8 }}>
        <InlineTooltip text="See exactly why agent actions were blocked by policy." />
      </div>
    </div>
  );
}

function InlineTooltip({ text }) {
  return (
    <div className="flex items-center rounded-[6px]" style={{
      padding: "5px 10px",
      background: "linear-gradient(135deg, rgba(5,217,194,0.08) 0%, rgba(92,127,198,0.08) 100%)",
      border: "1px solid rgba(5,217,194,0.2)",
    }}>
      <span style={{ fontSize: 10, color: "#444", lineHeight: 1.3, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function IdentityCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full justify-between" style={{ padding: 10 }}>
      {/* Identity Authentication Methods in Use */}
      <div>
        <p className="font-semibold text-[#111]" style={{ fontSize: 12, marginBottom: 5 }}>
          Identity Authentication Methods in Use
        </p>
        <div className="flex flex-col gap-[4px]" style={{ marginBottom: 5 }}>
          {[
            { logo: awsLogo,     name: "AWS",     val: 200, max: 200, color: "#F3982E" },
            { logo: mssqlLogo,   name: "MSSQL",   val: 90,  max: 200, color: "#FF2B10" },
            { logo: gcpLogo,     name: "GCP",     val: 140, max: 200, color: "#05D9C2" },
            { logo: windowsLogo, name: "Windows", val: 60,  max: 200, color: "#5C7FC6" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-[6px]">
              <img src={item.logo} alt={item.name} style={{ width: 16, height: 16, flexShrink: 0, objectFit: "contain" }} />
              <span className="text-[#111] flex-shrink-0" style={{ fontSize: 9, width: 42 }}>{item.name}</span>
              <div className="flex-1 h-[6px] rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(item.val / item.max) * 100 * p}%`, backgroundColor: item.color }} />
              </div>
              <span className="text-[#111] font-medium flex-shrink-0" style={{ fontSize: 9, width: 24, textAlign: "right" }}>
                <AnimatedNumber value={item.val} progress={p} />
              </span>
            </div>
          ))}
        </div>
        <InlineTooltip text="Unified authentication and access across cloud, workloads, and enterprise identities." />
      </div>

      <div style={{ height: 1, borderRadius: 999, background: "#E8E9EF" }} />

      {/* Enterprise Identity Landscape */}
      <div>
        <p className="font-semibold text-[#111]" style={{ fontSize: 12, marginBottom: 5 }}>
          Enterprise Identity Landscape
        </p>
        <div className="flex items-start justify-center" style={{ marginBottom: 5 }}>
          {[
            { icon: vector4,      label: "AI Agents",        value: 200, format: (v) => String(v) },
            { icon: dubleUser,    label: "Human Identity",   value: 8,   format: (v) => `${v}K` },
            { icon: groupMachine, label: "Machine Identity", value: 30,  format: (v) => `${v}K` },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center" style={{ width: "33.33%" }}>
              <img src={item.icon} alt="" style={{ width: 22, height: 22, marginBottom: 2 }} />
              <span className="font-bold text-[#111]" style={{ fontSize: 22, lineHeight: 1, height: 22 }}>
                {item.format(Math.round(lerp(0, item.value, p)))}
              </span>
              <span className="text-[#111]" style={{ fontSize: 8, marginTop: 2 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <InlineTooltip text="Unified visibility across AI, human, and machine identities." />
      </div>

      <div style={{ height: 1, borderRadius: 999, background: "#E8E9EF" }} />

      {/* Identity Risk & Exposure Analysis */}
      <div>
        <p className="font-semibold text-[#111]" style={{ fontSize: 12, marginBottom: 5 }}>
          Identity Risk &amp; Exposure Analysis
        </p>
        <div style={{ marginBottom: 5 }}>
          <div className="flex rounded-[6px] overflow-hidden" style={{ height: 14, background: "#F3F4F6", border: "1px solid #E8E9EF" }}>
            {[
              { color: "#A70808", width: 5 * p },
              { color: "#C62828", width: 8 * p },
              { color: "#F3982E", width: 25 * p },
              { color: "#1ADDC7", width: 55 * p },
            ].map((seg, i) => (
              <div key={i} style={{ flex: seg.width, backgroundColor: seg.color, minWidth: p > 0.2 && i < 2 ? 14 : 0 }} />
            ))}
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 4, padding: "0 2px" }}>
            {["120", "450", "2200", "8000"].map((label) => (
              <span key={label} className="font-semibold text-[#111]" style={{ fontSize: 8 }}>{label}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
          {[
            { color: "#A70808", label: "Critical" },
            { color: "#C62828", label: "High" },
            { color: "#F3982E", label: "Medium" },
            { color: "#1ADDC7", label: "Low" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-[3px]">
              <div className="rounded-[2px]" style={{ width: 8, height: 8, background: l.color }} />
              <span style={{ fontSize: 8 }}>{l.label}</span>
            </div>
          ))}
        </div>
        <InlineTooltip text="AI-powered risk detection across identities and secrets." />
      </div>
    </div>
  );
}

function VaultSecretsCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1500);

  return (
    <div className="flex flex-col h-full justify-between" style={{ padding: 10 }}>
      <div>
        <p className="font-semibold text-[#111]" style={{ fontSize: 13, marginBottom: 6 }}>
          External Vault &amp; Secrets Integrations
        </p>
        <div className="flex items-center gap-[12px]" style={{ marginBottom: 6 }}>
          <div className="relative" style={{ width: 100, height: 100, flexShrink: 0 }}>
            <div className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from -90deg, #F3982E 0% 35.96%, #5C7FC6 35.96% 57.30%, #111111 57.30% 77.53%, #05D9C2 77.53% 88.76%, #275AC2 88.76% 100%)" }} />
            <div className="absolute inset-[12%] rounded-full overflow-hidden"
              style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95) 0%, rgba(230,235,245,0.7) 50%, rgba(200,210,230,0.5) 100%)", backdropFilter: "blur(8px)" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-semibold text-[#111]" style={{ fontSize: 22 }}>
                <AnimatedNumber value={89} progress={p} />
              </span>
              <span className="text-[#111]" style={{ fontSize: 8 }}>Total Items</span>
            </div>
          </div>
          <div className="flex flex-col gap-[4px]">
            {[
              { color: "#F3982E", label: "AWS", val: 32 },
              { color: "#5C7FC6", label: "Azure", val: 19 },
              { color: "#111",    label: "Hashicorp Vault", val: 18 },
              { color: "#05D9C2", label: "GCP", val: 10 },
              { color: "#275AC2", label: "K8s", val: 10 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-[6px]">
                <div className="rounded-[2px] flex-shrink-0" style={{ width: 10, height: 10, background: item.color }} />
                <span className="text-[#555]" style={{ fontSize: 10, width: 90 }}>{item.label}</span>
                <span className="text-[#111] font-medium flex-shrink-0" style={{ fontSize: 10, width: 24, textAlign: "right" }}>
                  <AnimatedNumber value={item.val} progress={p} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <InlineTooltip text="Centralized governance across distributed secrets vaults." />
      </div>

      <div style={{ height: 1, background: "#E8E9EF" }} />

      <div>
        <p className="font-semibold text-[#111]" style={{ fontSize: 13, marginBottom: 6 }}>
          Dynamic Secrets Issued
        </p>
        <div className="flex items-center gap-[12px]" style={{ marginBottom: 6 }}>
          <div className="relative" style={{ width: 100, height: 100, flexShrink: 0 }}>
            <div className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from -90deg, #F3982E 0% 30%, #275AC2 30% 50%, #5C7FC6 50% 65%, #05D9C2 65% 78.333%, #111111 78.333% 90%, #4A8FF0 90% 100%)" }} />
            <div className="absolute inset-[12%] rounded-full overflow-hidden"
              style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.97) 0%, rgba(240,242,248,0.85) 60%, rgba(220,225,238,0.7) 100%)", backdropFilter: "blur(8px)" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-semibold text-[#111]" style={{ fontSize: 20 }}>
                <AnimatedNumber value={60} progress={p} />K
              </span>
              <span className="text-[#111] text-center leading-tight" style={{ fontSize: 8 }}>Total Dynamic<br/>Secrets</span>
            </div>
          </div>
          <div className="flex flex-col gap-[4px]">
            {[
              { color: "#F3982E", label: "AWS", val: 18 },
              { color: "#275AC2", label: "GCP", val: 12 },
              { color: "#5C7FC6", label: "PostgreSQL", val: 9 },
              { color: "#05D9C2", label: "MySQL", val: 8 },
              { color: "#111",    label: "OpenAI", val: 7 },
              { color: "#4A8FF0", label: "Docker", val: 6 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-[6px]">
                <div className="rounded-[2px] flex-shrink-0" style={{ width: 10, height: 10, background: item.color }} />
                <span className="text-[#111]" style={{ fontSize: 10, width: 90 }}>{item.label}</span>
                <span className="text-[#111] font-medium flex-shrink-0" style={{ fontSize: 10, width: 24, textAlign: "right" }}>
                  <AnimatedNumber value={item.val} progress={p} />K
                </span>
              </div>
            ))}
          </div>
        </div>
        <InlineTooltip text="Just-in-time credentials replacing static access keys." />
      </div>
    </div>
  );
}


function CertSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1200);

  return (
    <div className="flex flex-col h-full" style={{ padding: 12 }}>
      <p className="font-semibold text-[#111]" style={{ fontSize: 14, marginBottom: 8 }}>
        Certificate Lifecycle Health
      </p>
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div className="absolute left-0 top-0 flex flex-col justify-between items-end" style={{ height: "calc(100% - 24px)", width: 28 }}>
          {["1000","750","500","250","0"].map((v) => (
            <span key={v} className="text-[#888]" style={{ fontSize: 8 }}>{v}</span>
          ))}
        </div>
        <div className="absolute flex items-end justify-around" style={{ left: 34, top: 0, right: 0, bottom: 24 }}>
          {[
            { label: "Expired",     gradient: "linear-gradient(180deg, #FD2B11 0%, #E8837A 100%)", heightPct: 23 },
            { label: "0-30 Days",   gradient: "linear-gradient(180deg, #F3982E 0%, #F5BC73 100%)", heightPct: 58 },
            { label: "60-90 Days",  gradient: "linear-gradient(180deg, #5C7FC6 0%, #8BA5D8 100%)", heightPct: 82 },
            { label: "90-180 Days", gradient: "linear-gradient(180deg, #05D9C2 0%, #5DE8D6 100%)", heightPct: 100 },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center justify-end gap-[4px]" style={{ height: "100%", flex: 1 }}>
              <div className="rounded-t-[4px]" style={{ background: bar.gradient, height: `${bar.heightPct * p}%`, width: "60%", maxWidth: 44 }} />
              <span className="text-[#555] whitespace-nowrap" style={{ fontSize: 7 }}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <InlineTooltip text="Prevent outages with automated certificate lifecycle monitoring." />
      </div>
    </div>
  );
}

function EncryptionPasswordCombinedSection({ isActive }) {
  const p = useOnceAnimation(isActive, 1200);

  return (
    <div className="flex flex-col h-full justify-evenly" style={{ padding: 10 }}>
      <p className="font-semibold text-[#111]" style={{ fontSize: 13 }}>
        Enterprise Encryption &amp; Key Operations
      </p>

      <div className="flex flex-col gap-[8px]">
        {[
          { label: "Transactions",   barPct: 90, value: 2, suffix: "M" },
          { label: "Tokenizers",     barPct: 35, value: 50, suffix: "" },
          { label: "Cloud Accounts", barPct: 30, value: 45, suffix: "" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-[2px]">
            <span className="text-[#111]" style={{ fontSize: 10 }}>{item.label}</span>
            <div className="flex items-center gap-[6px]">
              <div className="flex-1 h-[10px] rounded-[3px] bg-gray-100 overflow-hidden">
                <div className="h-full rounded-[3px]" style={{ width: `${item.barPct * p}%`, backgroundColor: "#1ADDC7" }} />
              </div>
              <span className="font-medium text-[#111] flex-shrink-0" style={{ fontSize: 10, minWidth: 22 }}>
                <AnimatedNumber value={item.value} progress={p} />{item.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      <InlineTooltip text="Centralized encryption and key management across cloud platforms." />

      <div style={{ height: 1, background: "#E8E9EF" }} />

      <p className="font-semibold text-[#111]" style={{ fontSize: 13 }}>
        Password Health
      </p>

      <div className="flex flex-col items-center justify-center">
        <div className="relative" style={{ width: 160, height: 88 }}>
          <svg viewBox="0 0 190 105" width="160" height="88">
            <path d="M 18 97 A 77 77 0 0 1 172 97" fill="none" stroke="#EBEBEB" strokeWidth="13" strokeLinecap="round" />
            <path d="M 18 97 A 77 77 0 0 1 172 97" fill="none" stroke="#1ADDC7" strokeWidth="13" strokeLinecap="round"
              strokeDasharray={`${242 * 0.92 * p} 242`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ paddingBottom: 0 }}>
            <span className="font-semibold text-[#111] leading-none" style={{ fontSize: 30 }}>
              <AnimatedNumber value={92} progress={p} />
            </span>
            <span className="text-[#111]" style={{ fontSize: 7, marginTop: 1 }}>Out of 100</span>
          </div>
        </div>
      </div>

      <InlineTooltip text="Real-time evaluation of password and credential security posture." />
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
        height: 500,
        borderRadius: 16,
        background: "#fff",
        border: "1px solid #E8E9EF",
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
          bottom: 32,
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

      {/* Fixed dot indicators at very bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
        style={{ height: 32 }}
      >
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
