"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  { prompt: "shannon@portfolio", cmd: "whoami" },
  { comment: "# autonomous agent developer" },
  { prompt: "shannon@portfolio", cmd: "cat skills.txt" },
  { comment: "# cybersecurity · reverse engineering · ai" },
  { prompt: "shannon@portfolio", cmd: "cat philosophy.txt" },
  { comment: "# secure by design, resilient by automation" },
];

const EXPERTISE_CARDS = [
  {
    abbr: "AI",
    title: "Automation & Agentic AI",
    desc: "Self-sustaining agents and orchestration layers that plan, act, and iterate on complex goals with minimal human intervention.",
    tags: ["LangChain", "AutoGen", "CrewAI", "Custom Agent Loops", "LLM Orchestration"],
    tools: "Python · Go · Rust",
    gradient: "linear-gradient(135deg, var(--accent), rgba(56, 189, 248, 0.3))",
  },
  {
    abbr: "SEC",
    title: "Cybersecurity & Defense",
    desc: "Defensive engineering from the ground up: threat modeling, secure infrastructure, and pipelines that detect threats before they bite.",
    tags: ["Threat Modeling", "DevSecOps", "Network Auditing", "Penetration Testing", "IAM"],
    tools: "Wireshark · Docker · Kubernetes · SIEM",
    gradient: "linear-gradient(135deg, var(--accent-2), rgba(167, 139, 250, 0.3))",
  },
  {
    abbr: "RE",
    title: "Reverse Engineering",
    desc: "Static and dynamic analysis of binaries and protocols to understand exactly what software really does — and how to defend it.",
    tags: ["IDA Pro", "Ghidra", "x64dbg", "Radare2", "Protocol Analysis"],
    tools: "Assembly x86/x64/ARM · C/C++",
    gradient: "linear-gradient(135deg, var(--accent-3), rgba(52, 211, 153, 0.3))",
  },
];

const SERVICES = [
  { title: "Autonomous AI Agents", desc: "Goal-driven agents that plan, use tools, and execute multi-step workflows — engineered to be reliable, observable, and safe." },
  { title: "Threat-Detection Pipelines", desc: "Monitoring and detection systems that surface anomalies early, with hardened infrastructure and secure-by-default configs." },
  { title: "Binary & Malware Analysis", desc: "Deep-dive analysis of suspicious binaries and protocols to determine behavior, intent, and risk." },
  { title: "Secure System Design", desc: "Architecture reviews, threat modeling, and DevSecOps practices baked in from day one." },
  { title: "Open-Source Collaboration", desc: "Contributions, reviews, and joint builds with fellow developers and researchers." },
  { title: "Consulting & Code Review", desc: "Hands-on security and quality reviews of your codebase, agents, or infrastructure." },
];

const TOPICS = ["Build an AI Agent", "Security & Hardening", "Reverse Engineering", "Penetration Testing", "Collaboration", "General"];

const CONNECT_LINKS = [
  { label: "LinkedIn", sub: "Professional network", abbr: "in", color: "var(--accent)", href: "https://www.linkedin.com/in/shannon-madden-b82468426/" },
  { label: "GitHub", sub: "@ShannonCodesAI", abbr: "GH", color: "var(--accent-2)", href: "https://github.com/ShannonCodesAI" },
  { label: "Email", sub: "sysmaint1@proton.me", abbr: "@", color: "var(--accent-3)", href: "mailto:sysmaint1@proton.me?subject=Let's%20connect" },
];

const STATS = [
  { value: 3, suffix: "", label: "Core Domains" },
  { value: 20, suffix: "+", label: "Languages & Tools" },
  { value: 100, suffix: "%", label: "Secure by Design" },
];

/* ------------------------------------------------------------------ */
/*  Helper: animate counter                                           */
/* ------------------------------------------------------------------ */
function animateCounter(el: HTMLElement, target: number, suffix = "") {
  const duration = 1500;
  const start = performance.now();
  const step = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  /* ---- state ---- */
  const [headerVisible, setHeaderVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [terminalVisibleCount, setTerminalVisibleCount] = useState(0);
  const [heroMounted, setHeroMounted] = useState(false);

  /* ---- refs ---- */
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const statsAnimated = useRef(false);

  /* ---- neon cursor ---- */
  useEffect(() => {
    const dot = cursorDot.current;
    const ring = cursorRing.current;
    if (!dot || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest(".interactive, a, button, input, textarea")) {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      } else {
        dot.classList.remove("hovering");
        ring.classList.remove("hovering");
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    animate();
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  /* ---- header show/hide on scroll ---- */
  useEffect(() => {
    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setHeaderVisible(y > 300);
      lastScroll = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- hero entrance animation ---- */
  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  /* ---- scroll reveal (IntersectionObserver) ---- */
  useEffect(() => {
    // Wait for hero to be visible first, then observe below-fold elements
    const t = setTimeout(() => {
      const els = document.querySelectorAll("[data-reveal]");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("revealed");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08 }
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  /* ---- stats counter ---- */
  useEffect(() => {
    const container = document.getElementById("stats-row");
    if (!container) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated.current) {
          statsAnimated.current = true;
          container.querySelectorAll("[data-count]").forEach((el) => {
            const target = Number(el.getAttribute("data-count"));
            const suffix = el.getAttribute("data-suffix") || "";
            animateCounter(el as HTMLElement, target, suffix);
          });
        }
      },
      { threshold: 0.3 }
    );
    io.observe(container);
    return () => io.disconnect();
  }, []);

  /* ---- terminal typing ---- */
  useEffect(() => {
    if (terminalVisibleCount >= TERMINAL_LINES.length) return;
    const timer = setTimeout(() => {
      setTerminalVisibleCount((c) => c + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [terminalVisibleCount]);

  /* ---- particle canvas ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.a})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ---- tilt card effect ---- */
  const handleTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const resetTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  }, []);

  /* ---- navigation scroll ---- */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase().replace(/ /g, "-"));
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  /* ---- form: compose mailto ---- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(selectedTopic || "Project Inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:sysmaint1@proton.me?subject=${subject}&body=${body}`;
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <>
      {/* ---------- overlays ---------- */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.5 }} aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />
      <div className="scanline-overlay" aria-hidden="true" />
      <div ref={cursorDot} className="neon-cursor-dot" />
      <div ref={cursorRing} className="neon-cursor-ring" />

      {/* ---------- header ---------- */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-7 py-4 transition-all duration-300"
        style={{
          background: "rgba(3, 5, 16, 0.6)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border)",
          borderBottom: "1px solid var(--border)",
          transform: headerVisible ? "translateY(0)" : "translateY(-80px)",
        }}
      >
        <button
          className="interactive text-base font-semibold tracking-wide"
          style={{ color: "var(--text)", background: "none", border: "none", fontFamily: "var(--font-main)" }}
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span style={{ color: "var(--accent)" }}>&lt;</span>
          ShannonCodesAI
          <span style={{ color: "var(--accent)" }}>/&gt;</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className="interactive relative text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--text-dim)", background: "none", border: "none", fontFamily: "var(--font-main)", padding: "4px 0" }}
              onClick={() => scrollTo(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="Toggle navigation"
          style={{ background: "none", border: "none" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="block w-[26px] h-[2px] rounded-sm" style={{ background: "var(--text)" }} />
          <span className="block w-[26px] h-[2px] rounded-sm" style={{ background: "var(--text)" }} />
          <span className="block w-[26px] h-[2px] rounded-sm" style={{ background: "var(--text)" }} />
        </button>
      </header>

      {/* ---------- mobile menu ---------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-6 md:hidden" style={{ background: "rgba(3,5,16,0.95)", backdropFilter: "blur(20px)" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className="interactive text-xl font-semibold"
              style={{ color: "var(--text)", background: "none", border: "none", fontFamily: "var(--font-main)" }}
              onClick={() => scrollTo(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1">
        {/* ==================== HERO ==================== */}
        <section className="relative min-h-screen flex items-center" style={{ paddingTop: 100, paddingBottom: 60 }}>
          <div className="section-container w-full">
            <div className="max-w-3xl">
              <p
                className={`mb-5 hero-fade ${heroMounted ? "hero-visible" : ""}`}
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-mono)", fontSize: "0.88rem", letterSpacing: "0.05em", transitionDelay: "0.1s" }}
              >
                // secure by design, resilient by automation
              </p>

              <h1
                className={`hero-fade ${heroMounted ? "hero-visible" : ""}`}
                style={{ fontSize: "clamp(2.2rem, 5.2vw, 3.8rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 12, letterSpacing: "-0.03em", transitionDelay: "0.25s" }}
              >
                <span className="glitch" data-text="I'm Shannon Madden.">
                  I&apos;m Shannon Madden.
                </span>
              </h1>

              <p
                className={`hero-fade ${heroMounted ? "hero-visible" : ""}`}
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600, fontSize: "clamp(1rem, 2.2vw, 1.35rem)", lineHeight: 1.6, marginBottom: 24, transitionDelay: "0.4s" }}
              >
                Autonomous Agent Developer · Cybersecurity Engineer · Reverse-Engineering Specialist
              </p>

              <p className={`hero-fade ${heroMounted ? "hero-visible" : ""}`} style={{ color: "var(--text-dim)", fontSize: "1.1rem", maxWidth: 640, marginBottom: 32, lineHeight: 1.7, transitionDelay: "0.55s" }}>
                I build <strong style={{ color: "var(--text)" }}>autonomous AI agents</strong> by day, analyze binaries and harden infrastructure by night. From self-sustaining agent loops to deep-level defensive security — I turn ambitious ideas into{" "}
                <strong style={{ color: "var(--text)" }}>resilient, secure systems</strong>.
              </p>

              <div className={`flex flex-wrap gap-4 mb-10 hero-fade ${heroMounted ? "hero-visible" : ""}`} style={{ transitionDelay: "0.7s" }}>
                <button className="interactive neon-btn neon-btn-primary" onClick={() => scrollTo("Work With Me")}>
                  Start a Project
                </button>
                <button className="interactive neon-btn neon-btn-ghost" onClick={() => scrollTo("Expertise")}>
                  Explore Expertise
                </button>
              </div>

              {/* Terminal */}
              <div className={`hero-fade ${heroMounted ? "hero-visible" : ""}`} style={{ transitionDelay: "0.85s" }}>
                <div className="rounded-xl border p-5 mb-8" style={{ background: "rgba(3, 5, 16, 0.7)", borderColor: "var(--border)", fontFamily: "var(--font-mono)", backdropFilter: "blur(10px)" }}>
                  <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: "#fb7185" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-3)" }} />
                    <span className="ml-3 text-xs" style={{ color: "var(--text-dim)" }}>shannon@portfolio:~</span>
                  </div>
                  <div>
                    {TERMINAL_LINES.map((line, i) => (
                      <div key={i} className={`terminal-line ${i < terminalVisibleCount ? "visible" : ""}`}>
                        {line.prompt && <span className="terminal-prompt">{line.prompt}:~$ </span>}
                        {line.cmd && <span className="terminal-cmd">{line.cmd}</span>}
                        {line.comment && <span className="terminal-comment"> {line.comment}</span>}
                        {i === TERMINAL_LINES.length - 1 && i < terminalVisibleCount && (
                          <span className="cursor-blink" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div id="stats-row" className={`flex flex-wrap gap-12 mt-8 hero-fade ${heroMounted ? "hero-visible" : ""}`} style={{ transitionDelay: "1s" }}>
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.7rem", fontWeight: 700, color: "var(--accent)" }} data-count={s.value} data-suffix={s.suffix}>
                      0{s.suffix}
                    </span>
                    <span style={{ color: "var(--text-dim)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== ABOUT ==================== */}
        <section id="about" className="relative py-28">
          <div className="section-container">
            <div data-reveal>
              <h2 className="section-title">
                <span className="section-index">01</span> About Me
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start mt-10">
              <div className="lg:col-span-3">
                <div data-reveal>
                  <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: "1.05rem", lineHeight: 1.75 }}>
                    I bridge the gap between{" "}
                    <strong style={{ color: "var(--text)" }}>autonomous AI automation</strong> and{" "}
                    <strong style={{ color: "var(--text)" }}>deep-level defensive security</strong>. Whether engineering agents that plan and execute complex tasks, or tearing down binaries to understand exactly how they behave, my approach is the same:{" "}
                    <em style={{ color: "var(--accent)", fontStyle: "normal", fontWeight: 500 }}>
                      secure code by design, resilient architecture by automation.
                    </em>
                  </p>
                </div>
                <div data-reveal>
                  <p style={{ color: "var(--text-dim)", marginBottom: 28, fontSize: "1.05rem", lineHeight: 1.75 }}>
                    I&apos;m always open to code reviews, security discussions, open-source collaboration, or just talking about the future of tech. If you have a task, a threat model, or an ambitious idea — let&apos;s build something incredible together.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {[
                    { num: "01", bold: "Secure by design.", dim: "Security isn't a feature, it's the foundation." },
                    { num: "02", bold: "Resilient by automation.", dim: "Systems that adapt and self-heal." },
                    { num: "03", bold: "Learn by breaking.", dim: "Reverse-engineering is the ultimate teacher." },
                  ].map((item) => (
                    <div key={item.num} data-reveal>
                      <div className="flex gap-4 items-start">
                        <span className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-mono" style={{ color: "var(--accent)", border: "1px solid var(--border-strong)", fontFamily: "var(--font-mono)" }}>
                          {item.num}
                        </span>
                        <span>
                          <strong style={{ color: "var(--text)" }}>{item.bold}</strong>{" "}
                          <span style={{ color: "var(--text-dim)" }}>{item.dim}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile card */}
              <div className="lg:col-span-2">
                <div data-reveal>
                  <div className="tilt-card-wrapper">
                    <div className="tilt-card relative rounded-2xl" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                      <div className="card-shine" />
                      <div className="relative p-7 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))", color: "#030510", fontFamily: "var(--font-mono)", boxShadow: "var(--glow-purple)" }}>
                            SM
                          </div>
                          <div>
                            <p className="font-semibold text-lg">Shannon Madden</p>
                            <p className="font-mono text-sm" style={{ color: "var(--text-mono)" }}>@ShannonCodesAI</p>
                          </div>
                        </div>
                        <dl className="flex flex-col gap-1">
                          {[
                            ["Primary", "Autonomous Agent Development"],
                            ["Security", "Threat Modeling / DevSecOps"],
                            ["Deep-Dive", "Malware Analysis / RE"],
                          ].map(([dt, dd]) => (
                            <div key={dt} className="flex justify-between items-center py-2.5 px-1" style={{ borderBottom: "1px solid rgba(56, 189, 248, 0.06)" }}>
                              <dt className="text-sm" style={{ color: "var(--text-dim)" }}>{dt}</dt>
                              <dd className="text-sm font-medium text-right flex items-center gap-2"><span>{dd}</span></dd>
                            </div>
                          ))}
                          <div className="flex justify-between items-center py-2.5 px-1" style={{ borderBottom: "1px solid rgba(56, 189, 248, 0.06)" }}>
                            <dt className="text-sm" style={{ color: "var(--text-dim)" }}>Status</dt>
                            <dd className="text-sm font-medium text-right flex items-center gap-2">
                              <span className="pulse-dot" />
                              <span style={{ color: "var(--accent-3)", textTransform: "capitalize" }}>open</span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== EXPERTISE ==================== */}
        <section id="expertise" className="relative py-28" style={{ background: "linear-gradient(180deg, rgba(8, 13, 28, 0.5), rgba(3, 5, 16, 0.3))" }}>
          <div className="section-container">
            <div data-reveal>
              <h2 className="section-title">
                <span className="section-index">02</span> Expertise
              </h2>
            </div>
            <div data-reveal>
              <p className="section-lead">Three domains, one mission: building systems that are smart, secure, and built to last.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {EXPERTISE_CARDS.map((card) => (
                <div key={card.abbr} data-reveal>
                  <div className="tilt-card-wrapper h-full">
                    <div className="tilt-card relative rounded-2xl" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                      <div className="card-shine" />
                      <div className="glow-border relative p-8 rounded-2xl h-full flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-all duration-500" style={{ background: card.gradient, transform: "scaleX(0)", transformOrigin: "left" }} />
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)", background: "rgba(56, 189, 248, 0.08)", border: "1px solid var(--border)" }}>
                          {card.abbr}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                        <p className="mb-5" style={{ color: "var(--text-dim)", fontSize: "0.95rem", lineHeight: 1.65 }}>
                          {card.desc}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {card.tags.map((tag) => (
                            <span key={tag} className="skill-tag interactive">{tag}</span>
                          ))}
                        </div>
                        <p className="mt-auto font-mono text-xs" style={{ color: "var(--text-dim)" }}>{card.tools}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SERVICES ==================== */}
        <section id="services" className="relative py-28">
          <div className="section-container">
            <div data-reveal>
              <h2 className="section-title">
                <span className="section-index">03</span> What I Build
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {SERVICES.map((svc) => (
                <div key={svc.title} data-reveal>
                  <div className="interactive group relative p-7 rounded-2xl transition-all duration-300" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h3 className="text-base font-semibold mb-2.5 flex items-center gap-3">
                      <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>&gt;</span>
                      {svc.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{svc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== WORK WITH ME ==================== */}
        <section id="work-with-me" className="relative py-28" style={{ background: "linear-gradient(180deg, rgba(8, 13, 28, 0.5), rgba(3, 5, 16, 0.3))" }}>
          <div className="section-container">
            <div data-reveal>
              <h2 className="section-title">
                <span className="section-index">04</span> Work With Me
              </h2>
            </div>
            <div data-reveal>
              <p className="section-lead">
                Have a task, a project, or a security question? Pick a topic that matches your needs. Your message is composed in your own email client and sent straight to my inbox — nothing is stored on this site.
              </p>
            </div>

            <div data-reveal>
              <div className="flex flex-wrap gap-3 mb-10">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    className={`interactive topic-chip ${selectedTopic === topic ? "active" : ""}`}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? "" : topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div data-reveal>
              <form className="max-w-3xl rounded-2xl p-9" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>Your Name</label>
                    <input
                      type="text"
                      className="cyber-input interactive"
                      placeholder="Jane Doe"
                      maxLength={120}
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>Your Email</label>
                    <input
                      type="email"
                      className="cyber-input interactive"
                      placeholder="jane@example.com"
                      maxLength={254}
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>Selected Topic</label>
                  <input
                    type="text"
                    readOnly
                    className="cyber-input"
                    style={{ color: "var(--text-mono)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
                    value={selectedTopic || "Select a topic above..."}
                  />
                </div>
                <div className="mb-7">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>Message / Task Details</label>
                  <textarea
                    className="cyber-input interactive"
                    rows={6}
                    placeholder="Tell me about the task, project, or question you have in mind..."
                    maxLength={4000}
                    style={{ resize: "vertical", minHeight: 130 }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <div className="flex items-center flex-wrap gap-5">
                  <button type="submit" className="interactive neon-btn neon-btn-primary">Compose Email</button>
                  <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Your email client will open with everything prefilled.</p>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ==================== CONNECT ==================== */}
        <section id="connect" className="relative py-28">
          <div className="section-container">
            <div data-reveal>
              <h2 className="section-title">
                <span className="section-index">05</span> Let&apos;s Connect
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {CONNECT_LINKS.map((link) => (
                <div key={link.label} data-reveal>
                  <div className="tilt-card-wrapper">
                    <div className="tilt-card relative rounded-2xl" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                      <div className="card-shine" />
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="interactive block p-8 rounded-2xl transition-all duration-300"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 font-mono font-bold text-sm" style={{ color: link.color, background: `${link.color}12`, border: "1px solid var(--border)" }}>
                          {link.abbr}
                        </div>
                        <p className="text-lg font-semibold mb-1">{link.label}</p>
                        <p className="text-sm" style={{ color: "var(--text-dim)" }}>{link.sub}</p>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="relative border-t py-12 mt-auto" style={{ borderColor: "var(--border)", background: "rgba(3, 5, 16, 0.7)" }}>
        <div className="section-container text-center">
          <p className="font-mono text-sm mb-3" style={{ color: "var(--text-mono)" }}>
            // &quot;The best way to predict the future is to program it securely.&quot;
          </p>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            &copy; {new Date().getFullYear()} Shannon Madden. Built securely, by design.
          </p>
        </div>
      </footer>
    </>
  );
}