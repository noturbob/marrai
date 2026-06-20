"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
type SubmitState = "idle" | "loading" | "success" | "error";

// ── Platform cycler ─────────────────────────────────────────────────────────
const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Grok"];

function PlatformCycler() {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => { setIdx(i => (i + 1) % PLATFORMS.length); setOut(false); }, 300);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <span style={{
      display: "inline-block",
      color: "var(--purple-bright)",
      opacity: out ? 0 : 1,
      transform: out ? "translateY(-10px)" : "translateY(0)",
      transition: "opacity 0.28s ease, transform 0.28s ease",
      minWidth: 130,
    }}>{PLATFORMS[idx]}</span>
  );
}

// ── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm({ size = "normal" }: { size?: "normal" | "compact" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    await new Promise(r => setTimeout(r, 900));
    setState("success");
  }

  if (state === "success") return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1.25rem",
      background: "rgba(124,58,237,0.15)",
      border: "1px solid rgba(124,58,237,0.35)",
      borderRadius: 9999,
      fontSize: "0.85rem", color: "#C4B5FD", fontWeight: 500,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#A855F7", flexShrink: 0 }} />
      You&apos;re on the list — we&apos;ll be in touch.
    </div>
  );

  const isCompact = size === "compact";

  return (
    <form onSubmit={submit} style={{
      display: "flex", gap: "0.5rem",
      flexDirection: isCompact ? "row" : "row",
      width: "100%", maxWidth: isCompact ? 420 : 400,
    }}>
      <input
        className="input-waitlist"
        type="email" required
        placeholder="your@brand.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ flex: 1 }}
      />
      <button className="btn-primary" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Adding…" : "Join waitlist"}
      </button>
    </form>
  );
}

// ── FAQ accordion ────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is Marrai?",
    a: "Marrai is India's first AEO (Answer Engine Optimization) monitoring platform. We track how your brand is represented across AI answer engines like ChatGPT, Perplexity, Gemini, and Claude including which sites get cited instead of yours.",
  },
  {
    q: "Who is Marrai for?",
    a: "Marketing leaders at mid-to-large Indian D2C and digitally-native companies CMOs, Heads of Marketing, VP Growth who are already invested in SEO and starting to notice unexplained traffic drops they can't attribute to Google alone.",
  },
  {
    q: "What is the citation gap?",
    a: "The citation gap is when your brand is mentioned by AI platforms but your own website is never actually cited as a source. Instead, third-party sites like YouTube, Reddit, and review aggregators capture the citations and the traffic. We measure exactly how wide that gap is.",
  },
  {
    q: "How is this different from SEO?",
    a: "Traditional SEO optimises for Google's ranking algorithm, which is relatively stable and deterministic. AI answers are probabilistic and change constantly. Marrai monitors AI-specific signals: schema markup, FAQPage structured data, content answerability, and citation authority across AI platforms.",
  },
  {
    q: "When does Marrai launch?",
    a: "We're in early research and prototyping. We're auditing 10 major Indian brands as proof-of-concept. Early access members get a free audit before launch. Join the waitlist and you'll hear from us first.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{
          border: "1px solid",
          borderColor: open === i ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)",
          borderRadius: "var(--radius-md)",
          background: open === i ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s ease",
          overflow: "hidden",
        }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "1rem",
              padding: "1.1rem 1.5rem",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text)" }}>{faq.q}</span>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1,
              transform: open === i ? "rotate(45deg)" : "none",
              transition: "transform 0.2s ease",
            }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 1.5rem 1.1rem", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Mini dashboard mockup (hero visual) ──────────────────────────────────────
function DashboardMockup() {
  const rows = [
    { query: "best earbuds under ₹2000", mentioned: true, cited: false, platform: "ChatGPT" },
    { query: "boAt vs JBL sound quality", mentioned: true, cited: false, platform: "Perplexity" },
    { query: "is boAt good quality", mentioned: true, cited: true, platform: "ChatGPT" },
    { query: "best audio brand for gym", mentioned: false, cited: false, platform: "Gemini" },
    { query: "should I buy boAt earbuds", mentioned: true, cited: false, platform: "Perplexity" },
    { query: "wireless earbuds India 2024", mentioned: true, cited: false, platform: "Claude" },
  ];

  return (
    <div style={{
      background: "#0d0d12",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      overflow: "hidden",
      fontSize: 11,
      boxShadow: "0 40px 120px rgba(124,58,237,0.25), 0 0 0 1px rgba(255,255,255,0.04)",
    }}>
      {/* toolbar */}
      <div style={{
        background: "#111116", borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 4,
          height: 20, display: "flex", alignItems: "center", paddingLeft: 8,
          color: "#3F3F46", fontSize: 10,
        }}>marrai.com/dashboard</div>
      </div>

      {/* header row */}
      <div style={{
        padding: "12px 16px 8px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "-0.02em" }}>boAt — AEO Monitor</div>
          <div style={{ color: "#71717A", fontSize: 10, marginTop: 1 }}>43 queries · ChatGPT + Perplexity · Jun 2025</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Mention rate", value: "65%", color: "#A855F7" },
            { label: "Citation rate", value: "16%", color: "#EF4444" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6, padding: "5px 10px", textAlign: "center",
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ color: "#3F3F46", fontSize: 9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 80px 60px 72px",
        padding: "6px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        color: "#3F3F46", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        <div>Query</div><div>Platform</div><div>Mentioned</div><div>Cited</div>
      </div>

      {/* rows */}
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "1fr 80px 60px 72px",
          padding: "7px 16px", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
          background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
        }}>
          <div style={{ color: "#A1A1AA", fontSize: 10 }}>{r.query}</div>
          <div>
            <span style={{
              fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 9999,
              background: "rgba(124,58,237,0.15)", color: "#C4B5FD",
              border: "1px solid rgba(124,58,237,0.25)",
            }}>{r.platform}</span>
          </div>
          <div>
            {r.mentioned
              ? <span style={{ color: "#A855F7", fontWeight: 700, fontSize: 11 }}>✓</span>
              : <span style={{ color: "#3F3F46", fontSize: 11 }}>—</span>}
          </div>
          <div>
            {r.cited
              ? <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 11 }}>✓</span>
              : <span style={{ color: "#EF4444", fontSize: 10, fontWeight: 600 }}>✗ 3rd party</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature card mockup: Citation gap ──────────────────────────────────────
function CitationGapCard() {
  const items = [
    { name: "YouTube", pct: 23.5, w: "78%", color: "#A855F7" },
    { name: "Reddit", pct: 16.7, w: "56%", color: "#818CF8" },
    { name: "Gadgets360", pct: 6.2, w: "21%", color: "#6366F1" },
    { name: "boAt.com", pct: 0, w: "0%", color: "#EF4444" },
  ];
  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ fontSize: 10, color: "#71717A", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Citation sources — Perplexity</div>
      {items.map(item => (
        <div key={item.name} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
            <span style={{ color: item.name === "boAt.com" ? "#EF4444" : "#A1A1AA", fontWeight: item.name === "boAt.com" ? 700 : 400 }}>{item.name}</span>
            <span style={{ color: item.color, fontWeight: 700 }}>{item.pct}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 9999 }}>
            <div style={{ height: "100%", width: item.w, background: item.color, borderRadius: 9999,
              boxShadow: `0 0 6px ${item.color}66` }} />
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 14, padding: "8px 10px", background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, fontSize: 10, color: "#FCA5A5",
      }}>
        boAt feeds AI answer engines but captures <strong style={{ color: "#EF4444" }}>0% of citations</strong> on Perplexity.
      </div>
    </div>
  );
}

// ── Feature card mockup: Mention monitor ──────────────────────────────────
function MentionCard() {
  const platforms = [
    { name: "ChatGPT", rate: 65, color: "#A855F7" },
    { name: "Perplexity", rate: 53, color: "#818CF8" },
    { name: "Gemini", rate: 41, color: "#6366F1" },
    { name: "Claude", rate: 38, color: "#8B5CF6" },
  ];
  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ fontSize: 10, color: "#71717A", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mention rate by platform</div>
      {platforms.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#71717A", width: 70, flexShrink: 0 }}>{p.name}</span>
          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 9999 }}>
            <div style={{ height: "100%", width: `${p.rate}%`, background: p.color, borderRadius: 9999,
              boxShadow: `0 0 6px ${p.color}66`, transition: "width 1.2s ease" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: p.color, width: 30, textAlign: "right" }}>{p.rate}%</span>
        </div>
      ))}
      <div style={{
        marginTop: 14, display: "flex", gap: 8,
      }}>
        {[{ l: "43 queries", c: "#A855F7" }, { l: "5 query types", c: "#818CF8" }].map(b => (
          <span key={b.l} style={{
            fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 9999,
            background: `${b.c}18`, border: `1px solid ${b.c}44`, color: b.c,
          }}>{b.l}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(9,9,11,0.75)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.025em" }}>
            marrai<span style={{ color: "var(--purple-bright)" }}>.</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <a href="#features" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>Features</a>
            <Link href="/audit" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>Audit tool</Link>
            <a href="#faq" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>FAQ</a>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <a href="#waitlist" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", textDecoration: "none" }}>
              Get early access
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", textAlign: "center", padding: "5rem 1.5rem 0", overflow: "hidden" }}>
        {/* directional glow FROM BELOW like Wope — sits behind the mockup */}
        <div style={{
          position: "absolute",
          bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500,
          background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.45) 0%, rgba(109,40,217,0.2) 35%, transparent 65%)",
          filter: "blur(48px)",
          pointerEvents: "none", zIndex: 0,
        }} />
        {/* top subtle glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 200,
          background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <div className="pill pill-purple" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
            <span className="pill-dot" />
            India&apos;s first AEO monitoring platform
          </div>

          <h1 className="font-display" style={{
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            fontWeight: 800, lineHeight: 1.06,
            letterSpacing: "-0.035em",
            marginBottom: "1.25rem",
          }}>
            Is <PlatformCycler /> citing<br />your brand or your rival?
          </h1>

          <p style={{
            fontSize: "1.1rem", color: "var(--text-muted)",
            maxWidth: 500, margin: "0 auto 2.25rem", lineHeight: 1.65,
          }}>
            AI answer engines intercept your search traffic and cite whoever they want. Marrai shows you exactly where your brand stands and what to fix.
          </p>

          <div id="waitlist" style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <WaitlistForm />
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
            Free audit for early members · No credit card required
          </p>
        </div>

        {/* Hero dashboard mockup */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 820, margin: "3.5rem auto 0",
          padding: "0 1.5rem",
        }}>
          <DashboardMockup />
          {/* fade bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: "linear-gradient(to top, var(--bg), transparent)",
            pointerEvents: "none",
          }} />
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <section style={{ padding: "4rem 1.5rem 3rem" }}>
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "2rem" }}>
          We&apos;ve audited India&apos;s leading brands
        </p>
        <div style={{
          display: "flex", gap: "2.5rem", justifyContent: "center",
          alignItems: "center", flexWrap: "wrap",
        }}>
          {["boAt", "Zerodha", "Zoho", "Cult.fit", "MakeMyTrip", "Minimalist"].map(b => (
            <span key={b} className="font-display" style={{
              fontSize: "1rem", fontWeight: 700,
              color: "var(--text-subtle)", letterSpacing: "-0.01em",
              opacity: 0.5,
            }}>{b}</span>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 900, margin: "0 auto" }} />

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--purple-bright)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              What Marrai tracks
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
            }}>
              Meet the new-gen<br />AEO research experience
            </h2>
          </div>

          {/* Feature row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            {/* Citation gap card */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <CitationGapCard />
              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
                  Citation gap analysis
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  See exactly which third-party domains YouTube, Reddit, review sites are capturing the citations that should be going to your site.
                </p>
              </div>
            </div>

            {/* Mention monitor card */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <MentionCard />
              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
                  Cross-platform mention rate
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Track how often your brand surfaces across ChatGPT, Perplexity, Gemini, and Claude broken down by query type and intent.
                </p>
              </div>
            </div>
          </div>

          {/* Feature row 2 — wide card */}
          <div className="card card-purple" style={{ padding: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", color: "var(--purple-bright)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Real audit data
              </p>
              <h3 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: "1rem" }}>
                Five query types.<br />One complete picture.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                We run Category Discovery, Brand Comparison, Brand Direct, Problem/Solution, and High-Intent Decision queries the actual questions your customers ask AI platforms before they buy.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {["Category discovery", "Brand comparison", "Brand direct", "Problem/solution", "High intent"].map(t => (
                  <span key={t} style={{
                    fontSize: "0.75rem", fontWeight: 500,
                    padding: "0.25rem 0.75rem", borderRadius: 9999,
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#C4B5FD",
                  }}>{t}</span>
                ))}
              </div>
            </div>
            {/* stat block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { num: 65, suffix: "%", label: "boAt mention rate on ChatGPT", color: "var(--purple-bright)" },
                { num: 0, suffix: "%", label: "boAt cited on Perplexity", color: "var(--danger)" },
                { num: 43, suffix: "", label: "queries per platform", color: "var(--purple-bright)" },
                { num: 10, suffix: "", label: "Indian brands being audited", color: "var(--purple-bright)" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "var(--radius-md)", padding: "1.25rem",
                }}>
                  <p className="font-display" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: s.color }}>
                    <Counter end={s.num} suffix={s.suffix} />
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem", lineHeight: 1.4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 900, margin: "0 auto" }} />

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--purple-bright)", textTransform: "uppercase", textAlign: "center", marginBottom: "0.75rem" }}>FAQ</p>
          <h2 className="font-display" style={{
            textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.5rem",
          }}>
            Frequently asked questions
          </h2>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "3rem" }}>
            Haven&apos;t found what you&apos;re looking for?{" "}
            <a href="mailto:hello@marrai.com" style={{ color: "var(--purple-bright)", textDecoration: "none" }}>Contact us.</a>
          </p>
          <FAQ />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "6rem 1.5rem 8rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* centered glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 65%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          {/* icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 1.5rem",
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(124,58,237,0.5)",
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="1.8" strokeOpacity="0.5"/>
              <circle cx="14" cy="14" r="4" fill="white"/>
              <path d="M14 4v4M14 20v4M4 14h4M20 14h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6"/>
            </svg>
          </div>
          <h2 className="font-display" style={{
            fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1rem",
          }}>
            Outrank everyone.<br />
            <span style={{ color: "var(--purple-bright)" }}>Starting now.</span>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.65 }}>
            Marrai audits your brand across AI answer engines and shows you exactly how to close the citation gap. Get early access and we&apos;ll run your brand free.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <WaitlistForm size="compact" />
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
            No credit card required · 14-day free trial at launch
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "2.5rem 1.5rem" }}>
        <div style={{
          maxWidth: 1060, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr auto auto auto",
          gap: "3rem", alignItems: "start",
        }}>
          <div>
            <div className="font-display" style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              marrai<span style={{ color: "var(--purple-bright)" }}>.</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: 200, lineHeight: 1.6 }}>
              Experience the next generation of AEO analytics.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Platform</p>
            {["Audit tool", "Waitlist", "Research"].map(l => (
              <p key={l} style={{ marginBottom: "0.4rem" }}>
                <a href="#" style={{ fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none" }}>{l}</a>
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Legal</p>
            {["Privacy policy", "Terms of service"].map(l => (
              <p key={l} style={{ marginBottom: "0.4rem" }}>
                <a href="#" style={{ fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none" }}>{l}</a>
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Get in touch</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>hello@marrai.com</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Hyderabad, India</p>
          </div>
        </div>
        <div style={{ maxWidth: 1060, margin: "2rem auto 0", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>©2025 Marrai. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            {["LinkedIn", "Twitter"].map(s => (
              <a key={s} href="#" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textDecoration: "none" }}>{s}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}