import { useState, useEffect } from "react";
import RetirementPlanner from "./RetirementPlanner";

const HASH = "78163a9b32a43d0bf9bf5a80cd700105ddd6e3abe279bb190fa9b97f05c59e77";

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d27",
  border: "#2e3140",
  accent1: "#e07a3a",
  text: "#e8e4df",
  textDim: "#8a8680",
  input: "#13151d",
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("planner-auth") === "true") {
      setAuthed(true);
    }
  }, []);

  async function tryAuth() {
    const hash = await sha256(pw);
    if (hash === HASH) {
      sessionStorage.setItem("planner-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") tryAuth();
    if (error) setError(false);
  }

  if (authed) return <RetirementPlanner />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .gate-box {
          animation: ${shake ? "shake 0.45s ease" : "none"};
        }
        .pw-input:focus {
          outline: none;
          border-color: ${COLORS.accent1} !important;
        }
        .enter-btn:hover {
          background: ${COLORS.accent1} !important;
        }
      `}</style>

      <div className="gate-box" style={{ textAlign: "center", width: "100%", maxWidth: 320 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.text,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          Retirement Planner
        </h1>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: COLORS.accent1,
            letterSpacing: "0.06em",
            marginBottom: 28,
          }}
        >
          DC ↔ KENYA
        </p>

        <input
          className="pw-input"
          type="password"
          placeholder="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            display: "block",
            width: "100%",
            padding: "11px 14px",
            background: COLORS.input,
            border: `1px solid ${error ? "#e03a3a" : COLORS.border}`,
            borderRadius: 7,
            color: COLORS.text,
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 10,
            transition: "border-color 0.15s",
          }}
        />

        <button
          className="enter-btn"
          onClick={tryAuth}
          style={{
            display: "block",
            width: "100%",
            padding: "11px",
            background: "#c0692e",
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          Enter
        </button>

        {error && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#e03a3a",
              marginTop: 10,
            }}
          >
            incorrect
          </p>
        )}
      </div>
    </div>
  );
}
