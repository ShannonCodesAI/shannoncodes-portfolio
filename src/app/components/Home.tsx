"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface TerminalLine {
  prompt?: string;
  cmd?: string;
  comment?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = ["About", "Expertise", "Services", "Work With Me", "Connect"];

const TERMINAL_LINES: TerminalLine[] = [
  { prompt: "shannon@secure", cmd: "whoami" },
  { comment: "# Autonomous Agent Developer" },
  { prompt: "shannon@secure", cmd: "cat /etc/specialization" },
  { comment: "# Cybersecurity Engineering \u00b7 Reverse Engineering" },
  { prompt: "shannon@secure", cmd: "./deploy --mode=secure" },
];

const EXPERTISE_CARDS = [
  {
    abbr: "AI",
    title: "Automation & Agentic AI",
    desc: "Self-sustaining agents and orchestration layers that plan, act, and iterate on complex goals with minimal human intervention.",
    tags: ["LangChain", "AutoGen", "CrewAI", "Custom Agent Loops", "LLM Orchestration"],
    tools: "Python \u00b7 Go \u00b7 Rust",
  },
  {
    abbr: "SEC",
    title: "Cybersecurity & Defense",
    desc: "Defensive engineering from the ground up: threat modeling, secure infrastructure, and pipelines that detect threats before they bite.",
    tags: ["Threat Modeling", "DevSecOps", "Network Auditing", "Penetration Testing", "IAM"],
    tools: "Wireshark \u00b7 Docker \u00b7 Kubernetes \u00b7 SIEM",
  },
  {
    abbr: "RE",
    title: "Reverse Engineering",
    desc: "Static and dynamic analysis of binaries and protocols to understand exactly what software really does \u2014 and how to defend it.",
    tags: ["IDA Pro", "Ghidra", "x64dbg", "Radare2", "Protocol Analysis"],
    tools: "Assembly x86/x64/ARM \u00b7 C/C++",
  },
];

const SERVICE_CARDS = [
  {
    icon: ">",
    title: "Autonomous AI Agents",
    desc: "Goal-driven agents that plan, use tools, and execute multi-step workflows \u2014 engineered to be reliable, observable, and safe.",
  },
  {
    icon: ">",
    title: "Threat-Detection Pipelines",
    desc: "Monitoring and detection systems that surface anomalies early, with hardened infrastructure and secure-by-default configs.",
  },
  {
    icon: ">",
    title: "Binary & Malware Analysis",
    desc: "Deep-dive analysis of suspicious binaries and protocols to determine behavior, intent, and risk.",
  },
  {
    icon: ">",
    title: "Secure System Design",
    desc: "Architecture reviews, threat modeling, and DevSecOps practices baked in from day one.",
  },
  {
    icon: ">",
    title: "Open-Source Collaboration",
    desc: "Contributions, reviews, and joint builds with fellow developers and researchers.",
  },
  {
    icon: ">",
    title: "Consulting & Code Review",
    desc: "Hands-on security and quality reviews of your codebase, agents, or infrastructure.",
  },
];

const TOPIC_OPTIONS = [
  "Build an AI Agent",
  "Security & Hardening",
  "Reverse Engineering",
  "Penetration Testing",
  "Collaboration",
  "General",
];

const STATS = [
  { value: 3, suffix: "", label: "Core Domains" },
  { value: 12, suffix: "", label: "Languages & Tools" },
  { value: 100, suffix: "%", label: "Secure by Design" },
];

const PRINCIPLES = [
  { num: "01", text: "Secure by design. Security isn\u2019t a feature, it\u2019s the foundation." },
  { num: "02", text: "Resilient by automation. Systems that adapt and self-heal." },
  { num: "03", text: "Learn by breaking. Reverse-engineering is the ultimate teacher." },
];

/* ================================================================== */
/*  THREE.JS PARTICLE SCENE (280 particles + connecting lines)         */
/* ================================================================== */
const PARTICLE_COUNT = 280;
const CONNECT_DIST = 2.2;
const MAX_LINES = 3000;
const COLORS = [
  new THREE.Color(56 / 255, 189 / 255, 248 / 255),   // cyan
  new THREE.Color(167 / 255, 139 / 255, 250 / 255),  // purple
  new THREE.Color(52 / 255, 211 / 255, 0.6),          // green
];

function ParticleScene() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null);

  const { positions, colors, basePositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const base = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 18;
      pos[i3 + 1] = (Math.random() - 0.5) * 14;
      pos[i3 + 2] = (Math.random() - 0.5) * 10;
      base[i3] = pos[i3];
      base[i3 + 1] = pos[i3 + 1];
      base[i3 + 2] = pos[i3 + 2];
      const c = COLORS[Math.floor(Math.random() * 3)];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return { positions: pos, colors: col, basePositions: base };
  }, []);

  const linePositions = useMemo(() => new Float32Array(MAX_LINES * 6), []);
  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [linePositions]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      mouse.current.x = ce.detail?.x ?? 0;
      mouse.current.y = ce.detail?.y ?? 0;
    };
    window.addEventListener("particle-mouse", handler);
    return () => window.removeEventListener("particle-mouse", handler);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const posArr = pointsRef.current?.geometry.attributes.position
      .array as Float32Array;
    if (!posArr) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArr[i3] = basePositions[i3] + Math.sin(t * 0.3 + i * 0.5) * 0.15;
      posArr[i3 + 1] =
        basePositions[i3 + 1] + Math.cos(t * 0.2 + i * 0.3) * 0.12;
      posArr[i3 + 2] =
        basePositions[i3 + 2] + Math.sin(t * 0.15 + i * 0.7) * 0.1;
    }
    pointsRef.current!.geometry.attributes.position.needsUpdate = true;

    // Build connecting lines
    let lineIdx = 0;
    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES; i++) {
      for (
        let j = i + 1;
        j < PARTICLE_COUNT && lineIdx < MAX_LINES;
        j++
      ) {
        const i3 = i * 3;
        const j3 = j * 3;
        const dx = posArr[i3] - posArr[j3];
        const dy = posArr[i3 + 1] - posArr[j3 + 1];
        const dz = posArr[i3 + 2] - posArr[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST) {
          const l6 = lineIdx * 6;
          linePositions[l6] = posArr[i3];
          linePositions[l6 + 1] = posArr[i3 + 1];
          linePositions[l6 + 2] = posArr[i3 + 2];
          linePositions[l6 + 3] = posArr[j3];
          linePositions[l6 + 4] = posArr[j3 + 1];
          linePositions[l6 + 5] = posArr[j3 + 2];
          lineIdx++;
        }
      }
    }
    lineGeometry.setDrawRange(0, lineIdx * 2);
    (
      lineGeometry.attributes.position as THREE.BufferAttribute
    ).needsUpdate = true;

    // Mouse-following rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04 + mouse.current.x * 0.3;
      groupRef.current.rotation.x = mouse.current.y * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments
        ref={linesRef}
        geometry={lineGeometry}
      >
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* ================================================================== */
/*  MATRIX RAIN (2D Canvas)                                            */
/* ================================================================== */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars =
      "01\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e6\u30e8\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f2\u30f3";
    const colSpacing = 13;
    let columns: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const numCols = Math.ceil(canvas!.width / colSpacing);
      columns = Array.from({ length: numCols }, () =>
        Math.floor(Math.random() * canvas!.height)
      );
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.fillStyle = "rgba(3, 5, 16, 0.06)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx!.font = "13px \u2018JetBrains Mono\u2019, monospace";

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const isBright = Math.random() < 0.05;
        ctx!.fillStyle = isBright
          ? "rgba(56, 189, 248, 0.25)"
          : `rgba(56, 189, 248, ${0.08 + 0.07 * Math.random()})`;
        ctx!.fillText(char, i * colSpacing, columns[i]);

        columns[i] += colSpacing;
        if (columns[i] > canvas!.height && Math.random() > 0.975) {
          columns[i] = 0;
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.5 }}
      aria-hidden="true"
    />
  );
}

/* ================================================================== */
/*  ANIMATED COUNTER                                                   */
/* ================================================================== */
function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();
          function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setCount(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ================================================================== */
/*  NEON CURSOR                                                        */
/* ================================================================== */
function NeonCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("button, a, input, textarea, select, .interactive")) {
        dotRef.current?.classList.add("hovering");
        ringRef.current?.classList.add("hovering");
      }
    };
    const onOut = () => {
      dotRef.current?.classList.remove("hovering");
      ringRef.current?.classList.remove("hovering");
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    let raf: number;
    function loop() {
      ringPos.current.x +=
        (pos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y +=
        (pos.current.y - ringPos.current.y) * 0.15;
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top = `${pos.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="neon-cursor-dot" />
      <div ref={ringRef} className="neon-cursor-ring" />
    </>
  );
}

/* ================================================================== */
/*  TILT CARD HOOK                                                     */
/* ================================================================== */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    el.style.transform = `perspective(1000px) rotateX(${-(dy / halfH) * 8}deg) rotateY(${(dx / halfW) * 8}deg) scale3d(1.02, 1.02, 1.02)`;
    el.style.setProperty("--mouse-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--mouse-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);
  return { ref, onMove, onLeave };
}

/* ================================================================== */
/*  MAIN HOME COMPONENT                                                */
/* ================================================================== */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const underlineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* particle-mouse dispatch */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      window.dispatchEvent(
        new CustomEvent("particle-mouse", {
          detail: {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
          },
        })
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* nav underline handlers */
  const onNavEnter = useCallback((idx: number) => {
    underlineRefs.current[idx] &&
      (underlineRefs.current[idx]!.style.width = "100%");
  }, []);
  const onNavLeave = useCallback((idx: number) => {
    underlineRefs.current[idx] &&
      (underlineRefs.current[idx]!.style.width = "0");
  }, []);

  /* glitch enhancement */
  useEffect(() => {
    const interval = setInterval(() => {
      document.querySelectorAll(".glitch").forEach((el) => {
        const off1 = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
        const off2 = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
        (el as HTMLElement).style.setProperty("--glitch-offset-1", `${off1}px`);
        (el as HTMLElement).style.setProperty("--glitch-offset-2", `${off2}px`);
        setTimeout(() => {
          (el as HTMLElement).style.setProperty("--glitch-offset-1", "0px");
          (el as HTMLElement).style.setProperty("--glitch-offset-2", "0px");
        }, 200 + Math.random() * 300);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* compose email */
  const composeEmail = () => {
    const subject = encodeURIComponent(
      selectedTopic || "General Inquiry"
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:sysmaint1@proton.me?subject=${subject}&body=${body}`;
  };

  /* scroll to section */
  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---- RENDER ---- */
  return (
    <>
      {/* THREE.JS BACKGROUND */}
      <div
        className="fixed inset-0 z-0"
        style={{ zIndex: 0 }}
      >
        <Canvas
          camera={{ position: [0, 0, 9], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
        >
          <ParticleScene />
        </Canvas>
      </div>

      {/* MATRIX RAIN */}
      <MatrixRain />

      {/* GRID + SCANLINE OVERLAYS */}
      <div className="grid-overlay" aria-hidden="true" />
      <div className="scanline-overlay" aria-hidden="true" />

      {/* NEON CURSOR */}
      <NeonCursor />

      {/* MAIN CONTENT WRAPPER */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* ============ HEADER ============ */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-7 py-4 transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(3, 5, 16, 0.92)"
              : "rgba(3, 5, 16, 0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderColor: "var(--border)",
            borderBottom: scrolled ? "1px solid var(--border)" : "none",
          }}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <button
            className="interactive"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
            }}
          >
            <span style={{ color: "var(--accent)" }}>&lt;</span>
            ShannonCodesAI
            <span style={{ color: "var(--accent)" }}>/&gt;</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item}
                className="interactive relative text-sm font-medium"
                onClick={() => scrollTo(item.toLowerCase().replace(/ /g, "-"))}
                onMouseEnter={() => onNavEnter(i)}
                onMouseLeave={() => onNavLeave(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  font: "inherit",
                  padding: "4px 0",
                }}
              >
                {item}
                <span
                  ref={(el) => { underlineRefs.current[i] = el; }}
                  className="absolute bottom-[-2px] left-0 h-[2px] transition-all duration-300"
                  style={{
                    background: "var(--accent)",
                    width: 0,
                  }}
                />
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden interactive"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: "var(--text)",
                borderRadius: 2,
                transition: "all 0.3s",
                transform: mobileOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: "var(--text)",
                borderRadius: 2,
                transition: "all 0.3s",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: "var(--text)",
                borderRadius: 2,
                transition: "all 0.3s",
                transform: mobileOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          </button>
        </motion.header>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="md:hidden fixed top-[72px] left-0 right-0 z-[99] flex flex-col gap-1 p-5"
              style={{
                background: "rgba(3, 5, 16, 0.96)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid var(--border)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  className="interactive text-left text-sm font-medium py-3 px-4 rounded-lg"
                  onClick={() =>
                    scrollTo(item.toLowerCase().replace(/ /g, "-"))
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-dim)",
                    font: "inherit",
                    width: "100%",
                  }}
                >
                  {item}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <main className="flex-1">
          {/* ============ HERO SECTION ============ */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p
                className="font-mono text-sm mb-6"
                style={{ color: "var(--text-mono)" }}
              >
                // secure by design, resilient by automation
              </p>
            </motion.div>

            {/* Name with glitch */}
            <motion.h1
              className="glitch text-5xl md:text-7xl font-bold mb-6"
              data-text="I'm Shannon Madden."
              style={{ letterSpacing: "-0.03em" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              I&apos;m Shannon Madden.
            </motion.h1>

            {/* Title */}
            <motion.p
              className="text-lg md:text-xl mb-4"
              style={{
                color: "var(--accent-2)",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Autonomous Agent Developer · Cybersecurity Engineer
              · Reverse-Engineering Specialist
            </motion.p>

            {/* Bio */}
            <motion.p
              className="max-w-2xl mx-auto text-base mb-10"
              style={{ color: "var(--text-dim)", lineHeight: 1.75 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              I build autonomous AI agents by day, analyze binaries and
              harden infrastructure by night. From self-sustaining agent loops
              to deep-level defensive security — I turn ambitious ideas into
              resilient, secure systems.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <button
                className="neon-btn neon-btn-primary interactive"
                onClick={() => scrollTo("work-with-me")}
              >
                Start a Project
              </button>
              <button
                className="neon-btn neon-btn-ghost interactive"
                onClick={() => scrollTo("expertise")}
              >
                Explore Expertise
              </button>
            </motion.div>

            {/* Terminal */}
            <motion.div
              className="w-full max-w-xl"
              style={{
                background: "rgba(3, 5, 16, 0.7)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                backdropFilter: "blur(10px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#fb7185",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#fbbf24",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--accent-3)",
                    display: "inline-block",
                  }}
                />
                <span
                  className="ml-3 font-mono text-xs"
                  style={{ color: "var(--text-dim)" }}
                >
                  shannon@portfolio:~
                </span>
              </div>
              {/* Terminal body */}
              <div className="p-4">
                {TERMINAL_LINES.map((line, i) => (
                  <TerminalLineRow key={i} line={line} index={i} />
                ))}
                <span className="cursor-blink" />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-12 justify-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-4xl font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    <AnimatedCounter
                      target={s.value}
                      suffix={s.suffix}
                    />
                  </div>
                  <div
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* ============ ABOUT SECTION ============ */}
          <section id="about" className="py-24">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="section-title">
                  <span className="section-index">01</span>
                  About Me
                </h2>
                <p
                  className="mb-8"
                  style={{
                    color: "var(--text-dim)",
                    maxWidth: 660,
                    lineHeight: 1.8,
                  }}
                >
                  I bridge the gap between autonomous AI automation and
                  deep-level defensive security. Whether engineering agents that
                  plan and execute complex tasks, or tearing down binaries to
                  understand exactly how they behave, my approach is the same:
                  secure code by design, resilient architecture by automation.
                </p>
                <p
                  className="mb-10"
                  style={{
                    color: "var(--text-dim)",
                    maxWidth: 660,
                    lineHeight: 1.8,
                  }}
                >
                  I&apos;m always open to code reviews, security discussions,
                  open-source collaboration, or just talking about the future of
                  tech. If you have a task, a threat model, or an ambitious
                  idea — let&apos;s build something incredible together.
                </p>
              </motion.div>

              {/* Principles */}
              <motion.div
                className="grid gap-5 mt-8"
                style={{ maxWidth: 660 }}
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                {PRINCIPLES.map((p) => (
                  <div
                    key={p.num}
                    className="flex gap-4 items-start"
                  >
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "var(--accent)", flexShrink: 0 }}
                    >
                      {p.num}
                    </span>
                    <p
                      style={{
                        color: "var(--text-dim)",
                        lineHeight: 1.7,
                      }}
                    >
                      {p.text}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Card - SM */}
              <motion.div
                className="mt-14"
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div
                  className="glow-border"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "28px 32px",
                    maxWidth: 400,
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="font-mono text-2xl font-bold"
                      style={{
                        color: "var(--accent)",
                        width: 48,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 12,
                        background: "rgba(56, 189, 248, 0.08)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      SM
                    </div>
                    <div>
                      <div className="font-bold">Shannon Madden</div>
                      <div
                        className="font-mono text-sm"
                        style={{ color: "var(--text-dim)" }}
                      >
                        @ShannonCodesAI
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 font-mono text-sm">
                    <div className="flex gap-3">
                      <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                        Primary
                      </span>
                      <span style={{ color: "var(--text-mono)" }}>
                        Autonomous Agent Development
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                        Security
                      </span>
                      <span style={{ color: "var(--text-mono)" }}>
                        Threat Modeling / DevSecOps
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                        Deep-Dive
                      </span>
                      <span style={{ color: "var(--text-mono)" }}>
                        Malware Analysis / RE
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                        Status
                      </span>
                      <span>
                        <span className="pulse-dot" />
                        <span style={{ color: "var(--accent-3)", fontWeight: 600 }}>
                          open
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ============ EXPERTISE SECTION ============ */}
          <section id="expertise" className="py-24">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="section-title">
                  <span className="section-index">02</span>
                  Expertise
                </h2>
                <p className="section-lead">
                  Three domains, one mission: building systems that are smart,
                  secure, and built to last.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {EXPERTISE_CARDS.map((card, i) => (
                  <ExpertiseCard key={card.abbr} card={card} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ============ SERVICES SECTION ============ */}
          <section id="services" className="py-24">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="section-title">
                  <span className="section-index">03</span>
                  What I Build
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {SERVICE_CARDS.map((svc, i) => (
                  <motion.div
                    key={svc.title}
                    className="glow-border"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "28px",
                    }}
                    initial={{
                      opacity: 0,
                      translateY: 40,
                      scale: 0.97,
                    }}
                    whileInView={{
                      opacity: 1,
                      translateY: 0,
                      scale: 1,
                    }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                    }}
                  >
                    <div
                      className="font-mono text-2xl mb-3"
                      style={{ color: "var(--accent)" }}
                    >
                      {svc.icon}
                    </div>
                    <h3
                      className="font-bold text-lg mb-2"
                      style={{ color: "var(--text)" }}
                    >
                      {svc.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--text-dim)",
                        lineHeight: 1.7,
                      }}
                    >
                      {svc.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ============ CONTACT SECTION ============ */}
          <section id="work-with-me" className="py-24">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="section-title">
                  <span className="section-index">04</span>
                  Work With Me
                </h2>
                <p className="section-lead">
                  Have a task, a project, or a security question? Pick a topic
                  that matches your needs. Your message is composed in your own
                  email client and sent straight to my inbox — nothing is stored
                  on this site.
                </p>
              </motion.div>

              {/* Topic chips */}
              <motion.div
                className="flex flex-wrap gap-3 mb-8"
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                {TOPIC_OPTIONS.map((topic) => (
                  <button
                    key={topic}
                    className={`topic-chip interactive ${
                      selectedTopic === topic ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === topic ? "" : topic
                      )
                    }
                    style={{
                      background: "none",
                      font: "inherit",
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </motion.div>

              {/* Form */}
              <motion.div
                className="glow-border"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "32px",
                  maxWidth: 560,
                }}
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="flex flex-col gap-5">
                  {/* Name */}
                  <div>
                    <label
                      className="font-mono text-xs block mb-2"
                      style={{ color: "var(--text-dim)" }}
                    >
                      Your Name
                    </label>
                    <input
                      className={`cyber-input interactive ${
                        formErrors.name ? "invalid" : ""
                      }`}
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setFormErrors({ ...formErrors, name: false });
                      }}
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label
                      className="font-mono text-xs block mb-2"
                      style={{ color: "var(--text-dim)" }}
                    >
                      Your Email
                    </label>
                    <input
                      className={`cyber-input interactive ${
                        formErrors.email ? "invalid" : ""
                      }`}
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormErrors({ ...formErrors, email: false });
                      }}
                    />
                  </div>
                  {/* Topic display */}
                  <div>
                    <label
                      className="font-mono text-xs block mb-2"
                      style={{ color: "var(--text-dim)" }}
                    >
                      Selected Topic
                    </label>
                    <div
                      className="cyber-input"
                      style={{
                        color: selectedTopic
                          ? "var(--text-mono)"
                          : "#8b9ab880",
                        cursor: "default",
                      }}
                    >
                      {selectedTopic || "Select a topic above..."}
                    </div>
                  </div>
                  {/* Message */}
                  <div>
                    <label
                      className="font-mono text-xs block mb-2"
                      style={{ color: "var(--text-dim)" }}
                    >
                      Message / Task Details
                    </label>
                    <textarea
                      className={`cyber-input interactive ${
                        formErrors.message ? "invalid" : ""
                      }`}
                      placeholder="Tell me about the task, project, or question you have in mind..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          message: e.target.value,
                        });
                        setFormErrors({ ...formErrors, message: false });
                      }}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  {/* Submit */}
                  <button
                    className="neon-btn neon-btn-primary interactive w-full justify-center"
                    onClick={() => {
                      const errors: Record<string, boolean> = {};
                      if (!formData.name.trim()) errors.name = true;
                      if (!formData.email.trim()) errors.email = true;
                      if (!formData.message.trim()) errors.message = true;
                      setFormErrors(errors);
                      if (Object.keys(errors).length === 0) {
                        composeEmail();
                      }
                    }}
                  >
                    Compose Email
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Your email client will open with everything prefilled.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ============ CONNECT SECTION ============ */}
          <section id="connect" className="py-24">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="section-title">
                  <span className="section-index">05</span>
                  Let&apos;s Connect
                </h2>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-6 justify-center mt-10"
                initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
                whileInView={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/shannon-madden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-border interactive flex flex-col items-center gap-3 p-8"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    minWidth: 180,
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="font-mono text-sm font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    in
                  </div>
                  <div
                    className="font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    LinkedIn
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Professional network
                  </div>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/ShannonCodesAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-border interactive flex flex-col items-center gap-3 p-8"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    minWidth: 180,
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="font-mono text-sm font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    GH
                  </div>
                  <div
                    className="font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    GitHub
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-dim)" }}
                  >
                    @ShannonCodesAI
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:sysmaint1@proton.me"
                  className="glow-border interactive flex flex-col items-center gap-3 p-8"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    minWidth: 180,
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="font-mono text-sm font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    @
                  </div>
                  <div
                    className="font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Email
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-dim)" }}
                  >
                    sysmaint1@proton.me
                  </div>
                </a>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ============ FOOTER ============ */}
        <footer
          className="relative border-t py-12 mt-auto"
          style={{
            borderColor: "var(--border)",
            background: "rgba(3, 5, 16, 0.7)",
          }}
        >
          <div className="section-container text-center">
            <p
              className="font-mono text-sm mb-3"
              style={{ color: "var(--text-mono)" }}
            >
              // &quot;The best way to predict the future is to program it
              securely.&quot;
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--text-dim)" }}
            >
              © 2026 Shannon Madden. Built securely, by design.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ================================================================== */
/*  SUB-COMPONENTS                                                     */
/* ================================================================== */

/* Terminal line with staggered reveal */
function TerminalLineRow({
  line,
  index,
}: {
  line: TerminalLine;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1600 + index * 400);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={ref}
      className={`terminal-line ${visible ? "visible" : ""}`}
    >
      {line.prompt && (
        <>
          <span className="terminal-prompt">
            {line.prompt}
          </span>
          <span style={{ color: "var(--text-dim)", margin: "0 4px" }}>
            :~$
          </span>
          <span className="terminal-cmd">{line.cmd}</span>
        </>
      )}
      {line.comment && (
        <span className="terminal-comment">{line.comment}</span>
      )}
    </div>
  );
}

/* Expertise card with tilt */
function ExpertiseCard({
  card,
  index,
}: {
  card: (typeof EXPERTISE_CARDS)[number];
  index: number;
}) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <motion.div
      className="tilt-card-wrapper"
      initial={{ opacity: 0, translateY: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, translateY: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        ref={ref}
        className="tilt-card glow-border"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="card-shine" />
        {/* Abbreviation */}
        <div
          className="font-mono text-sm font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          {card.abbr}
        </div>
        <h3
          className="font-bold text-lg mb-3"
          style={{ color: "var(--text)" }}
        >
          {card.title}
        </h3>
        <p
          className="text-sm mb-5"
          style={{ color: "var(--text-dim)", lineHeight: 1.7 }}
        >
          {card.desc}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {card.tags.map((tag) => (
            <span key={tag} className="skill-tag">
              {tag}
            </span>
          ))}
        </div>
        {/* Tools */}
        <div
          className="font-mono text-xs"
          style={{ color: "var(--text-dim)" }}
        >
          {card.tools}
        </div>
      </div>
    </motion.div>
  );
}
