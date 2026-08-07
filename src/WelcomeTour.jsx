import { useState, useEffect, useCallback } from "react";
import { C, MONO, SANS, Btn } from "./Tearsheet.jsx";

const TOUR_STORAGE_KEY = "tearsheet-welcome-tour-completed";

/* ------------------------------------------------------------------ */
/*  MINI ILLUSTRATIONS — one per tab, drawn in the app's own palette   */
/* ------------------------------------------------------------------ */

function TableIllustration() {
  const rows = [
    { name: "ADSK", tier: C.down, gm: 92, bar: C.up },
    { name: "DDOG", tier: C.up, gm: 80, bar: C.muted },
    { name: "SNOW", tier: C.amber, gm: 67, bar: C.down },
    { name: "PLTR", tier: C.down, gm: 80, bar: C.up },
  ];
  return (
    <div style={{ background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 4, padding: 10 }}>
      <div style={{ display: "flex", fontFamily: SANS, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6, gap: 10 }}>
        <span style={{ width: 34 }}>Ticker</span><span style={{ flex: 1 }}>Gross mgn</span><span style={{ width: 60 }}>Path</span>
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "3px 0", borderLeft: `2px solid ${r.tier}`, paddingLeft: 6 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.ink, width: 30 }}>{r.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.ink, flex: 1 }}>{r.gm}%</span>
          <svg width="52" height="14" style={{ display: "block" }}>
            <path d="M0,10 L15,6 L30,8 L52,3" fill="none" stroke={r.bar} strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function CohortIllustration() {
  const rows = [
    { g: 30, f: 5 }, { g: 26, f: 10 }, { g: 20, f: 15 }, { g: 16, f: 20 }, { g: 14, f: 24 },
  ];
  return (
    <div style={{ background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 4, padding: 10, display: "flex", alignItems: "flex-end", gap: 6, height: 96 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column-reverse", width: 16 }}>
          <div style={{ height: r.g * 1.2, background: C.blue, opacity: 0.75, borderRadius: "1px 1px 0 0" }} />
          <div style={{ height: r.f * 1.2, background: C.up, opacity: 0.75 }} />
        </div>
      ))}
      <div style={{ marginLeft: "auto", alignSelf: "center", fontFamily: SANS, fontSize: 9, color: C.dim, lineHeight: 1.5 }}>
        <div><span style={{ color: C.blue }}>■</span> growth</div>
        <div><span style={{ color: C.up }}>■</span> FCF</div>
      </div>
    </div>
  );
}

function QuadrantIllustration() {
  const dots = [
    { x: 78, y: 20, r: 5, c: C.blue }, { x: 130, y: 55, r: 8, c: C.up },
    { x: 60, y: 70, r: 4, c: C.amber }, { x: 168, y: 30, r: 10, c: C.down },
    { x: 100, y: 88, r: 5, c: C.muted },
  ];
  return (
    <div style={{ background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 4, padding: 10 }}>
      <svg width="100%" height="96" viewBox="0 0 200 96">
        <line x1="0" y1="96" x2="200" y2="0" stroke={C.amber} strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1="96" x2="200" y2="96" stroke={C.rule} strokeWidth="1" />
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity="0.75" />)}
      </svg>
    </div>
  );
}

function TrendIllustration() {
  return (
    <div style={{ background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 4, padding: 10 }}>
      <svg width="100%" height="96" viewBox="0 0 200 96">
        <path d="M0,70 L40,60 L80,64 L120,40 L160,44 L200,20" fill="none" stroke={C.amber} strokeWidth="1.8" />
        <path d="M0,50 L40,55 L80,35 L120,42 L160,25 L200,32" fill="none" stroke={C.up} strokeWidth="1.8" />
        <path d="M0,80 L40,78 L80,82 L120,70 L160,74 L200,68" fill="none" stroke={C.blue} strokeWidth="1.8" />
      </svg>
    </div>
  );
}

function AIIllustration() {
  const bars = [
    { label: "Before AI", v: 80, base: 80 },
    { label: "No levers", v: 72, base: 80 },
    { label: "After levers", v: 79, base: 80 },
  ];
  return (
    <div style={{ background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 4, padding: 10 }}>
      {bars.map((b) => {
        const col = b.v >= b.base - 0.2 ? C.muted : b.v > b.base ? C.up : C.down;
        return (
          <div key={b.label} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 8.5, color: C.muted, marginBottom: 2 }}>
              <span>{b.label}</span><span style={{ fontFamily: MONO, color: C.ink }}>{b.v}%</span>
            </div>
            <div style={{ height: 8, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 2, position: "relative", overflow: "hidden" }}>
              <div style={{ width: `${b.v}%`, height: "100%", background: col, opacity: 0.5 }} />
              <div style={{ position: "absolute", left: `${b.base}%`, top: 0, bottom: 0, width: 1, background: C.ink, opacity: 0.75 }} />
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {[0, 40, 90].map((v, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: C.rule, borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", left: `${v}%`, top: -2, width: 7, height: 7, borderRadius: "50%", background: C.amber }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WelcomeHeroIllustration() {
  return (
    <div style={{
      width: "100%", height: 168, borderRadius: 10, position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, ${C.panel} 0%, #14202a 55%, #1c1a12 100%)`,
      border: `1px solid ${C.rule}`,
    }}>
      <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(242,193,78,0.14)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", bottom: -30, left: -20, width: 130, height: 130, borderRadius: "50%", background: "rgba(111,211,180,0.12)", filter: "blur(28px)" }} />
      <div style={{ position: "absolute", inset: 12, borderRadius: 6, background: "rgba(14,18,22,0.85)", border: `1px solid ${C.rule}`, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 90, height: 6, borderRadius: 3, background: C.rule }} />
          <div style={{ display: "flex", gap: 3 }}>
            {[C.amber, C.up, C.blue, C.down, C.dim].map((c, i) => (
              <div key={i} style={{ width: 14, height: 5, borderRadius: 2, background: c, opacity: 0.6 }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          <div style={{ flex: 1, borderRadius: 4, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.rule}`, padding: 6, display: "flex", alignItems: "flex-end", gap: 3 }}>
            {[40, 70, 55, 90, 65, 80, 50].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 ? C.amber : "rgba(242,193,78,0.3)", borderRadius: "1px 1px 0 0" }} />
            ))}
          </div>
          <div style={{ width: 70, borderRadius: 4, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.rule}`, padding: 6, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
            {[C.up, C.amber, C.down].map((c, i) => (
              <div key={i} style={{ height: 4, borderRadius: 2, background: c, opacity: 0.6, width: `${80 - i * 18}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CARD DATA                                                          */
/* ------------------------------------------------------------------ */
const TOUR_CARDS = [
  {
    id: "welcome",
    headline: "Welcome to the Software Margin Tearsheet",
    body: "AI monetization tends to show up first in whichever line absorbs the inference cost — and companies rarely name it. This tool reads gross margin, free cash flow and R&D together across 56 public software companies to ask where that cost may be landing. Every figure is a public-filing approximation and every assumption on the AI tab is yours to change.",
    illustration: null,
    isWelcome: true,
  },
  {
    id: "table",
    headline: "Table: ten years, every company",
    body: "Sort and filter 56 software companies by growth, margin, Rule of 40 and NRR. The trajectory ribbon on the right shows the shape of the decade, not just the latest print. Click any row for its full FY16–FY25 detail and read.",
    illustration: <TableIllustration />,
  },
  {
    id: "cohort",
    headline: "10-Year Cohort: how Rule of 40 is built",
    body: "Median growth and median FCF margin, stacked. A company hitting 40 in 2018 and one hitting 40 in 2025 are rarely the same business — this view shows the mix inverting across the decade.",
    illustration: <CohortIllustration />,
  },
  {
    id: "quadrant",
    headline: "Rule of 40: growth vs. cash",
    body: "Every company plotted on revenue growth against FCF margin, bubble-sized by revenue. The amber diagonal is Rule of 40 itself — above it is the durable zone.",
    illustration: <QuadrantIllustration />,
  },
  {
    id: "trend",
    headline: "Trends: compare any companies",
    body: "Pick up to seven tickers and trace gross margin, FCF margin, growth or revenue side by side across all ten years.",
    illustration: <TrendIllustration />,
  },
  {
    id: "ai",
    headline: "AI Margin Math: does the feature pay for itself?",
    body: "Model a customer, add an AI feature, and watch gross margin move live. Usage attach and paying attach are kept as separate sliders on purpose — a feature can be widely used and poorly monetized at the same time.",
    illustration: <AIIllustration />,
  },
];

/* ------------------------------------------------------------------ */
/*  TOUR COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export function WelcomeTour({ forceOpen = false, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setCurrentCard(0);
      setIsOpen(true);
      return;
    }
    const completed = sessionStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) setIsOpen(true);
  }, [forceOpen]);

  const closeTour = useCallback(() => {
    sessionStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsOpen(false);
    setCurrentCard(0);
    onClose?.();
  }, [onClose]);

  const goNext = useCallback(() => {
    setCurrentCard((c) => (c < TOUR_CARDS.length - 1 ? c + 1 : (closeTour(), c)));
  }, [closeTour]);

  const goPrev = useCallback(() => {
    setCurrentCard((c) => Math.max(0, c - 1));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, goNext, goPrev, closeTour]);

  if (!isOpen) return null;

  const card = TOUR_CARDS[currentCard];
  const isFirst = currentCard === 0;
  const isLast = currentCard === TOUR_CARDS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} role="dialog" aria-modal="true" aria-label="Welcome tour">
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(2px)" }} onClick={closeTour} />

      <div
        key={card.id}
        data-tour-card={card.id}
        style={{ position: "relative", width: "100%", maxWidth: 460, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", overflow: "hidden" }}
      >
        <button
          onClick={closeTour}
          aria-label="Close tour"
          style={{ position: "absolute", top: 10, right: 10, zIndex: 1, width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <div style={{ padding: 20 }}>
          {card.isWelcome ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <WelcomeHeroIllustration />
              <div style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.amber, marginTop: 16, marginBottom: 8 }}>
                Getting started
              </div>
              <h2 style={{ fontFamily: MONO, fontSize: 19, fontWeight: 500, color: C.ink, margin: 0, marginBottom: 10 }}>{card.headline}</h2>
              <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, lineHeight: 1.6, maxWidth: 400, margin: 0 }}>{card.body}</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim }}>
                  {currentCard} of {TOUR_CARDS.length - 1}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>{card.illustration}</div>
              <h2 style={{ fontFamily: MONO, fontSize: 15.5, fontWeight: 500, color: C.ink, margin: 0, marginBottom: 8 }}>{card.headline}</h2>
              <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: 0 }}>{card.body}</p>
            </>
          )}
        </div>

        <div style={{ padding: "0 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {TOUR_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentCard(i)}
                aria-label={`Go to step ${i + 1}`}
                style={{
                  height: 5, borderRadius: 3, border: "none", cursor: "pointer", transition: "all 0.2s",
                  width: i === currentCard ? 20 : 5,
                  background: i === currentCard ? C.amber : C.rule,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isFirst && (
              <button onClick={goPrev} style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.06em", color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px" }}>
                Back
              </button>
            )}
            {isFirst && (
              <button onClick={closeTour} style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.06em", color: C.muted, background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px" }}>
                Skip tour
              </button>
            )}
            <Btn active onClick={goNext}>{isLast ? "Let's go" : isFirst ? "Take the tour" : "Next"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Take the tour"
      style={{
        display: "flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 10.5,
        letterSpacing: "0.08em", textTransform: "uppercase", color: C.amber,
        background: "rgba(242,193,78,0.1)", border: `1px solid rgba(242,193,78,0.3)`,
        borderRadius: 2, cursor: "pointer", padding: "5px 10px",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
      Tour
    </button>
  );
}
