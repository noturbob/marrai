"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────
type SubmitState = "idle" | "loading" | "success" | "error";

// ── Platform Cycler ────────────────────────────────
const PLATFORMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"];

function PlatformCycler() {
  const [current, setCurrent] = useState(0);
  const [animClass, setAnimClass] = useState("platform-enter");

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass("platform-exit");
      setTimeout(() => {
        setCurrent((c) => (c + 1) % PLATFORMS.length);
        setAnimClass("platform-enter");
      }, 320);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`font-display inline-block ${animClass}`}
      style={{ color: "var(--purple-bright)", minWidth: "160px", display: "inline-block" }}
    >
      {PLATFORMS[current]}
    </span>
  );
}

// ── Animated Counter ───────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(ease * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ── Citation Bar ────────────────────────────────────
function CitationBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(pct); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div ref={ref} className="citation-bar" style={{ flex: 1 }}>
      <div className="citation-bar-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

// ── Waitlist Form ───────────────────────────────────
function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    // Simulate API — swap for real /api/waitlist call
    await new Promise((r) => setTimeout(r, 900));
    setState("success");
    setMsg("You're on the list. We'll be in touch.");
  }

  if (state === "success") {
    return (
      <div
        className="pill pill-purple"
        style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
      >
        <span className="pill-dot" /> {msg}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "0.5rem",
        flexDirection: compact ? "row" : "column",
        width: "100%",
        maxWidth: compact ? "480px" : "400px",
      }}
    >
      <input
        className="input-waitlist"
        type="email"
        placeholder="you@brand.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ flex: 1 }}
      />
      <button className="btn-primary" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Adding…" : "Join Waitlist"}
        {state === "idle" && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {state === "error" && (
        <p style={{ color: "var(--danger)", fontSize: "0.8rem" }}>{msg}</p>
      )}
    </form>
  );
}

// ── Step card ───────────────────────────────────────
function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card" style={{ padding: "1.75rem", flex: 1, minWidth: 240 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background: "var(--purple-dim)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--purple-bright)",
          marginBottom: "1rem",
          fontFamily: "var(--font-display)",
        }}
      >
        {n}
      </div>
      <p
        className="font-display"
        style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}
      >
        {title}
      </p>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(9,9,11,0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            className="font-display"
            style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}
          >
            marrai
            <span style={{ color: "var(--purple-bright)" }}>.</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a
              href="#how-it-works"
              style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}
            >
              How it works
            </a>
            <a
              href="#audit"
              style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}
            >
              Research
            </a>
            <a
              href="#waitlist"
              className="btn-primary"
              style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
            >
              Get early access
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "7rem 1.5rem 6rem",
          textAlign: "center",
        }}
      >
        <div className="aura-hero" />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          {/* eyebrow */}
          <div className="pill pill-purple reveal" style={{ marginBottom: "1.75rem", display: "inline-flex" }}>
            <span className="pill-dot" />
            India&apos;s first AEO monitoring platform
          </div>

          {/* headline */}
          <h1
            className="font-display reveal reveal-delay-1"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}
          >
            Your brand is cited on{" "}
            <PlatformCycler />
            <br />
            <span style={{ color: "var(--text-muted)" }}>
              but does your site get the credit?
            </span>
          </h1>

          {/* sub */}
          <p
            className="reveal reveal-delay-2"
            style={{
              fontSize: "1.1rem",
              color: "var(--text-muted)",
              maxWidth: 540,
              margin: "0 auto 2.5rem",
              lineHeight: 1.65,
            }}
          >
            AI answer engines are intercepting your search traffic. Marrai tracks
            every mention, every citation gap, and every domain stealing your
            authority across ChatGPT, Perplexity, Gemini, and Claude.
          </p>

          {/* form */}
          <div
            className="reveal reveal-delay-3"
            style={{ display: "flex", justifyContent: "center" }}
            id="waitlist"
          >
            <WaitlistForm />
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-subtle)",
              marginTop: "0.75rem",
            }}
          >
            Free audit for early access members · No credit card required
          </p>
        </div>
      </section>

      {/* ── PROBLEM: CITATION GAP ── */}
      <section
        style={{
          padding: "5rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
        id="audit"
      >
        <div
          className="aura-section"
          style={{ top: "50%", right: -200, transform: "translateY(-50%)" }}
        />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* section label */}
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--purple-bright)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            The Citation Gap
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
              marginBottom: "1rem",
              maxWidth: 600,
            }}
          >
            boAt is mentioned in 65% of AI queries.
            <br />
            <span style={{ color: "var(--danger)" }}>
              Their site is cited 0 times on Perplexity.
            </span>
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              maxWidth: 520,
              lineHeight: 1.65,
              marginBottom: "3rem",
            }}
          >
            We audited 43 queries across ChatGPT and Perplexity. boAt fed the AI
            ecosystem with brand awareness and captured none of the citation
            authority. Third-party sites did.
          </p>

          {/* Citation cards row */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {/* Mention rate */}
            <div
              className="card card-purple"
              style={{ padding: "1.75rem 2rem", flex: 1, minWidth: 220 }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}
              >
                Brand mention rate
              </p>
              <p
                className="font-display"
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--purple-bright)",
                  lineHeight: 1,
                }}
              >
                <Counter end={65} suffix="%" />
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: "0.4rem",
                }}
              >
                across ChatGPT queries
              </p>
            </div>

            {/* Own-site citation */}
            <div className="card" style={{ padding: "1.75rem 2rem", flex: 1, minWidth: 220 }}>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}
              >
                Own-site citation (Perplexity)
              </p>
              <p
                className="font-display"
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--danger)",
                  lineHeight: 1,
                }}
              >
                <Counter end={0} suffix="%" />
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: "0.4rem",
                }}
              >
                zero times across 43 queries
              </p>
            </div>

            {/* Who's stealing citations */}
            <div className="card" style={{ padding: "1.75rem 2rem", flex: "2", minWidth: 280 }}>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.25rem",
                }}
              >
                Who captures citations instead
              </p>
              {[
                { name: "YouTube", pct: 23.5, color: "var(--purple-bright)" },
                { name: "Reddit", pct: 16.7, color: "#A78BFA" },
                { name: "Gadgets360", pct: 6.2, color: "#818CF8" },
                { name: "Cashify", pct: 5.1, color: "var(--text-subtle)" },
              ].map(({ name, pct, color }) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      width: 80,
                      flexShrink: 0,
                    }}
                  >
                    {name}
                  </span>
                  <CitationBar pct={(pct / 30) * 100} color={color} />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      width: 36,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-subtle)",
              marginTop: "1rem",
            }}
          >
            Independent audit · 43 queries · ChatGPT + Perplexity · June 2025
          </p>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 860, margin: "0 auto" }} />

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        style={{ padding: "5rem 1.5rem", position: "relative" }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--purple-bright)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            How Marrai works
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              marginBottom: "3rem",
              maxWidth: 480,
              lineHeight: 1.15,
            }}
          >
            Continuous monitoring,
            <br />
            not one-time audits.
          </h2>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Step
              n="01"
              title="Query your brand"
              body="We run hundreds of queries across ChatGPT, Perplexity, and Gemini the same questions your customers are actually asking."
            />
            <Step
              n="02"
              title="Track every citation"
              body="We record which domains get cited when your brand is mentioned. Are they linking to you or to YouTube, Reddit, and your competitors?"
            />
            <Step
              n="03"
              title="Close the gap"
              body="Get a weekly report showing your mention rate, citation rate, and the exact domains intercepting your authority. Know what to fix."
            />
          </div>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 860, margin: "0 auto" }} />

      {/* ── AUDIT PORTFOLIO ── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--purple-bright)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Research in progress
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              marginBottom: "0.75rem",
              lineHeight: 1.15,
            }}
          >
            We&apos;re auditing 10 Indian brands
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: "2.5rem",
              maxWidth: 500,
              lineHeight: 1.65,
            }}
          >
            Independent research across every major D2C category. No brand paid for
            this. We&apos;re building the evidence base for why AEO matters in India.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              { brand: "boAt", cat: "Consumer Electronics", done: true },
              { brand: "Minimalist", cat: "Skincare", done: false },
              { brand: "Cult.fit", cat: "Health & Fitness", done: false },
              { brand: "Physics Wallah", cat: "EdTech", done: false },
              { brand: "Zerodha", cat: "Fintech", done: false },
              { brand: "Zoho", cat: "Indian SaaS", done: false },
              { brand: "Policybazaar", cat: "Insurance", done: false },
              { brand: "Oziva", cat: "Food & Nutrition", done: false },
              { brand: "MakeMyTrip", cat: "Travel Tech", done: false },
              { brand: "Indiahikes", cat: "Trekking", done: false },
            ].map(({ brand, cat, done }) => (
              <div
                key={brand}
                className={done ? "card card-purple" : "card"}
                style={{ padding: "1rem 1.25rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  {done ? (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--purple-bright)",
                        flexShrink: 0,
                        boxShadow: "0 0 8px var(--purple-bright)",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--text-subtle)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: done ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {brand}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-subtle)",
                    paddingLeft: "1.2rem",
                  }}
                >
                  {cat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        style={{
          padding: "6rem 1.5rem 8rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="aura-section"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 500,
          }}
        />
        <div style={{ maxWidth: 580, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Know where you stand
            <br />
            <span style={{ color: "var(--purple-bright)" }}>before your competitors do.</span>
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              marginBottom: "2rem",
              lineHeight: 1.65,
            }}
          >
            Get early access and we&apos;ll run a free audit on your brand before
            we launch. Limited to 20 brands.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WaitlistForm compact />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "2rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span
            className="font-display"
            style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}
          >
            marrai<span style={{ color: "var(--purple-bright)" }}>.</span>
          </span>
          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
            India&apos;s first AEO monitoring platform · &copy; 2025 Marrai
          </p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {["Privacy", "Terms"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-subtle)",
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}