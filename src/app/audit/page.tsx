"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryScore {
  name: string;
  score: number;
  weight: number;
}

interface PageResult {
  url: string;
  score: number;
  issues: string[];
}

interface AuditResult {
  url: string;
  overall_score: number;
  categories: CategoryScore[];
  pages_crawled: number;
  findings: string[];
  recommendations: string[];
  pages: PageResult[];
  audited_at: string;
}

type AuditState = "idle" | "crawling" | "parsing" | "scoring" | "done" | "error";

// ─── Mock data (replace with real API call) ───────────────────────────────────

const MOCK_RESULT: AuditResult = {
  url: "https://example.com",
  overall_score: 61,
  categories: [
    { name: "Structured Data", score: 42, weight: 40 },
    { name: "Metadata",        score: 78, weight: 25 },
    { name: "Content Quality", score: 65, weight: 20 },
    { name: "Connectivity",    score: 80, weight: 10 },
    { name: "Technical",       score: 55, weight: 5  },
  ],
  pages_crawled: 14,
  findings: [
    "11 of 14 pages missing JSON-LD schema markup",
    "No FAQPage schema found — high-value for AI retrieval",
    "Meta descriptions absent on 6 pages",
    "Average word count 420 — below recommended 800",
    "3 pages have no canonical URL set",
    "23 images missing alt text across site",
  ],
  recommendations: [
    "Add Organization + WebSite JSON-LD to every page",
    "Create FAQ sections and mark up with FAQPage schema",
    "Write meta descriptions for all 6 flagged pages",
    "Expand thin pages to 800+ words with structured headings",
    "Set canonical URLs on all pages to avoid duplicate content",
  ],
  pages: [
    { url: "/",           score: 74, issues: ["No FAQ schema", "Thin content"] },
    { url: "/about",      score: 68, issues: ["Missing canonical"] },
    { url: "/products",   score: 55, issues: ["No schema", "Missing meta description"] },
    { url: "/blog",       score: 82, issues: ["Images missing alt text"] },
    { url: "/contact",    score: 48, issues: ["No schema", "Missing meta description", "Thin content"] },
    { url: "/pricing",    score: 61, issues: ["No FAQ schema"] },
    { url: "/faq",        score: 70, issues: ["HTML FAQs not marked up as FAQPage schema"] },
    { url: "/terms",      score: 90, issues: [] },
  ],
  audited_at: new Date().toISOString(),
};

// ─── Crawl steps shown during loading ────────────────────────────────────────

const CRAWL_STEPS = [
  { id: "crawling", label: "Crawling pages",       detail: "Following internal links, respecting robots.txt" },
  { id: "parsing",  label: "Parsing HTML",          detail: "Extracting schema, metadata, headings, body text" },
  { id: "scoring",  label: "Scoring for AI readiness", detail: "Applying weighted rubric across 5 categories" },
];

// ─── Score colour helper ──────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "#22c55e";           // green
  if (score >= 50) return "var(--purple-bright)"; // purple
  return "var(--danger)";                      // red
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs work";
  return "Critical";
}

// ─── Animated score ring ──────────────────────────────────────────────────────

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size / 2) - 14;
  const circ = 2 * Math.PI * r;
  const progress = displayed / 100;
  const dashOffset = circ * (1 - progress);
  const color = scoreColor(score);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}
        />
        {/* fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      {/* centre text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2,
      }}>
        <span style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: size * 0.22,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color,
          lineHeight: 1,
        }}>{displayed}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>/ 100</span>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: 2,
        }}>{scoreLabel(score)}</span>
      </div>
    </div>
  );
}

// ─── Category score bar ───────────────────────────────────────────────────────

function CategoryBar({ cat, delay }: { cat: CategoryScore; delay: number }) {
  const [width, setWidth] = useState(0);
  const color = scoreColor(cat.score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(cat.score), delay);
    return () => clearTimeout(t);
  }, [cat.score, delay]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{cat.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{cat.weight}% weight</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color, minWidth: 28, textAlign: "right" }}>{cat.score}</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          borderRadius: 9999,
          background: color,
          width: `${width}%`,
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState({ phase }: { phase: AuditState }) {
  const stepIndex = phase === "crawling" ? 0 : phase === "parsing" ? 1 : 2;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
      {/* spinner ring */}
      <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 2rem" }}>
        <svg width={72} height={72} style={{ transform: "rotate(-90deg)", animation: "spin 1.4s linear infinite" }}>
          <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <circle cx={36} cy={36} r={28} fill="none" stroke="#7C3AED" strokeWidth={5}
            strokeLinecap="round" strokeDasharray={175.9} strokeDashoffset={88}
            style={{ filter: "drop-shadow(0 0 6px #7C3AED88)" }}
          />
        </svg>
      </div>

      <p style={{
        fontFamily: "var(--font-display), sans-serif",
        fontSize: "1.15rem", fontWeight: 700,
        marginBottom: "0.4rem",
      }}>
        {CRAWL_STEPS[stepIndex].label}
      </p>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "2.5rem" }}>
        {CRAWL_STEPS[stepIndex].detail}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {CRAWL_STEPS.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={step.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 1rem",
              background: active ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: "var(--radius-md)",
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                background: done ? "#22c55e" : active ? "var(--purple-core)" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : done ? "#22c55e" : "var(--text-muted)",
              }}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<AuditState>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function runAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setResult(null);
    setErrorMsg("");

    // Simulate the async pipeline phases
    setState("crawling");
    await new Promise(r => setTimeout(r, 1400));
    setState("parsing");
    await new Promise(r => setTimeout(r, 1200));
    setState("scoring");
    await new Promise(r => setTimeout(r, 900));

    // ── Swap this block for a real fetch ──────────────────────────────────
    // try {
    //   const res = await fetch("http://localhost:8000/api/v1/audit", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ url }),
    //   });
    //   if (!res.ok) throw new Error(await res.text());
    //   const data = await res.json();
    //   setResult(data);
    // } catch (err) {
    //   setErrorMsg(String(err));
    //   setState("error");
    //   return;
    // }
    // ─────────────────────────────────────────────────────────────────────

    setResult({ ...MOCK_RESULT, url });
    setState("done");
  }

  function reset() {
    setState("idle");
    setResult(null);
    setUrl("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // ── Idle / input ────────────────────────────────────────────────────────

  if (state === "idle" || state === "error") return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div className="aura-hero" />
        <div style={{
          maxWidth: 580, margin: "0 auto",
          padding: "8rem 1.5rem 6rem",
          textAlign: "center",
          position: "relative", zIndex: 1,
        }}>
          <div className="pill pill-purple" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
            <span className="pill-dot" />
            AEO Readiness Audit
          </div>
          <h1 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
            marginBottom: "1rem",
          }}>
            How visible is your brand<br />
            <span style={{ color: "var(--purple-bright)" }}>inside AI answers?</span>
          </h1>
          <p style={{
            fontSize: "1rem", color: "var(--text-muted)",
            maxWidth: 420, margin: "0 auto 2.5rem", lineHeight: 1.65,
          }}>
            Paste any URL. We crawl up to 20 pages and score your site across
            5 factors that determine whether AI platforms cite you — or someone else.
          </p>

          <form onSubmit={runAudit} style={{ display: "flex", gap: "0.5rem", maxWidth: 480, margin: "0 auto" }}>
            <input
              ref={inputRef}
              className="input-waitlist"
              type="url"
              placeholder="https://yourbrand.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              autoFocus
            />
            <button className="btn-primary" type="submit">
              Audit
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {state === "error" && (
            <p style={{ fontSize: "0.82rem", color: "var(--danger)", marginTop: "1rem" }}>
              {errorMsg || "Audit failed. Check the URL and try again."}
            </p>
          )}

          <div style={{
            display: "flex", gap: "2rem", justifyContent: "center",
            marginTop: "3rem",
          }}>
            {[
              ["5", "scoring categories"],
              ["20", "pages crawled"],
              ["~30s", "audit time"],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p className="font-display" style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--purple-bright)" }}>{num}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────────────────

  if (state !== "done") return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <LoadingState phase={state} />
    </div>
  );

  // ── Results ─────────────────────────────────────────────────────────────

  if (!result) return null;

  const displayUrl = result.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* ── Results header ── */}
      <div style={{
        borderBottom: "1px solid var(--border-subtle)",
        padding: "1.5rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.2rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Audit results</p>
            <p className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{displayUrl}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {result.pages_crawled} pages · {new Date(result.audited_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button
              onClick={reset}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                fontWeight: 500,
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
              }}
            >
              New audit
            </button>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "2rem 1.5rem",
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: "1.5rem",
        alignItems: "start",
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Score ring card */}
          <div className="card card-purple" style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <ScoreRing score={result.overall_score} size={180} />
            <div style={{ width: "100%", textAlign: "center" }}>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Overall AEO Score</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {result.overall_score >= 75
                  ? "Your site is reasonably well-structured for AI retrieval."
                  : result.overall_score >= 50
                  ? "Several gaps are reducing your AI citation potential."
                  : "Critical issues are preventing AI platforms from citing your site."}
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em",
              color: "var(--purple-bright)", textTransform: "uppercase", marginBottom: "1.25rem",
            }}>Category scores</p>
            {result.categories.map((cat, i) => (
              <CategoryBar key={cat.name} cat={cat} delay={i * 100} />
            ))}
          </div>

          {/* Page count stat */}
          <div className="card" style={{
            padding: "1.25rem 1.5rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "var(--purple-dim)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1" stroke="var(--purple-bright)" strokeWidth="1.5"/>
                <rect x="10" y="2" width="6" height="6" rx="1" stroke="var(--purple-bright)" strokeWidth="1.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1" stroke="var(--purple-bright)" strokeWidth="1.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1" stroke="var(--purple-bright)" strokeWidth="1.5" opacity="0.4"/>
              </svg>
            </div>
            <div>
              <p className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{result.pages_crawled}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>pages crawled</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Findings */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em",
              color: "var(--danger)", textTransform: "uppercase", marginBottom: "1.25rem",
            }}>Key findings</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {result.findings.map((f, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.75rem 1rem",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.14)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="7" cy="7" r="6" stroke="var(--danger)" strokeWidth="1.2"/>
                    <path d="M7 4v3.5M7 9.5v.5" stroke="var(--danger)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "var(--text)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em",
              color: "#22c55e", textTransform: "uppercase", marginBottom: "1.25rem",
            }}>Recommendations</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.75rem 1rem",
                  background: "rgba(34,197,94,0.05)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="7" cy="7" r="6" stroke="#22c55e" strokeWidth="1.2"/>
                    <path d="M4.5 7l2 2 3-3" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "var(--text)" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Page-by-page breakdown */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em",
              color: "var(--purple-bright)", textTransform: "uppercase", marginBottom: "1.25rem",
            }}>Page breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {result.pages.map((page) => {
                const color = scoreColor(page.score);
                const isOpen = expandedPage === page.url;
                return (
                  <div key={page.url}>
                    <button
                      onClick={() => setExpandedPage(isOpen ? null : page.url)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        gap: "0.75rem", padding: "0.65rem 0.875rem",
                        background: isOpen ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isOpen ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)"}`,
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                      }}
                    >
                      {/* score bubble */}
                      <span style={{
                        width: 32, height: 32, borderRadius: "var(--radius-sm)",
                        background: `${color}18`,
                        border: `1px solid ${color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: 700, color, flexShrink: 0,
                      }}>{page.score}</span>

                      {/* url */}
                      <span style={{ fontSize: "0.82rem", color: "var(--text)", flex: 1, fontFamily: "var(--font-mono, monospace)" }}>{page.url}</span>

                      {/* issue count */}
                      {page.issues.length > 0 && (
                        <span style={{
                          fontSize: "0.7rem", color: "var(--text-muted)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "9999px", padding: "1px 8px",
                        }}>
                          {page.issues.length} issue{page.issues.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {page.issues.length === 0 && (
                        <span style={{ fontSize: "0.7rem", color: "#22c55e" }}>Clean</span>
                      )}

                      {/* chevron */}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease", flexShrink: 0 }}>
                        <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* expanded issues */}
                    {isOpen && page.issues.length > 0 && (
                      <div style={{
                        margin: "0.25rem 0 0 0",
                        padding: "0.75rem 1rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        display: "flex", flexDirection: "column", gap: "0.35rem",
                      }}>
                        {page.issues.map((issue, i) => (
                          <p key={i} style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem" }}>
                            <span style={{ color: "var(--danger)", flexShrink: 0 }}>—</span>
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ─── Shared Nav ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(9,9,11,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "0 1.5rem",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--text)" }}>
            marrai<span style={{ color: "var(--purple-bright)" }}>.</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/audit" style={{ fontSize: "0.85rem", color: "var(--purple-bright)", textDecoration: "none", fontWeight: 500 }}>
            Audit tool
          </Link>
          <Link href="/#waitlist" style={{
            fontSize: "0.8rem", fontWeight: 600,
            background: "var(--purple-core)", color: "#fff",
            padding: "0.45rem 1rem", borderRadius: "var(--radius-md)",
            textDecoration: "none",
          }}>
            Get early access
          </Link>
        </div>
      </div>
    </nav>
  );
}