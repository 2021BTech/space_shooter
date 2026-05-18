import { useEffect, useState } from "react";
import {
  getHighScores,
  type LeaderboardEntry,
} from "../services/leaderboardService";

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);

    getHighScores()
      .then((data) => {
        if (!cancelled) {
          setScores(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at center, rgba(10,10,40,0.8) 0%, rgba(5,5,20,0.95) 100%)",
        zIndex: 20,
        fontFamily: "'Courier New', monospace",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: "bold",
          letterSpacing: 6,
          textShadow: "0 0 20px rgba(255,200,50,0.4)",
          margin: 0,
          marginBottom: 30,
        }}
      >
        LEADERBOARD
      </h1>

      {loading && (
        <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: 1 }}>
          Loading scores...
        </div>
      )}

      {error && (
        <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: 1 }}>
          Failed to load scores.
        </div>
      )}

      {!loading && !error && scores.length === 0 && (
        <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: 1 }}>
          No scores yet.
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <div
          style={{
            width: 400,
            maxWidth: "80%",
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 100px 60px",
              gap: 8,
              padding: "8px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontSize: 12,
              opacity: 0.5,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            <span>#</span>
            <span>NAME</span>
            <span style={{ textAlign: "right" }}>SCORE</span>
            <span style={{ textAlign: "right" }}>LVL</span>
          </div>

          {scores.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 100px 60px",
                gap: 8,
                padding: "8px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 14,
                background: i === 0 ? "rgba(255,200,50,0.08)" : "transparent",
              }}
            >
              <span
                style={{
                  fontWeight: i < 3 ? "bold" : "normal",
                  color:
                    i === 0
                      ? "#ffd700"
                      : i === 1
                        ? "#c0c0c0"
                        : i === 2
                          ? "#cd7f32"
                          : "#fff",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.name}
              </span>
              <span style={{ textAlign: "right", fontWeight: "bold" }}>
                {entry.score.toLocaleString()}
              </span>
              <span style={{ textAlign: "right", opacity: 0.6 }}>
                {entry.level}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: 30,
          padding: "12px 40px",
          fontSize: 16,
          fontFamily: "'Courier New', monospace",
          fontWeight: "bold",
          letterSpacing: 2,
          color: "#fff",
          background: "linear-gradient(135deg, #0066ff, #0044cc)",
          border: "2px solid rgba(0,150,255,0.5)",
          borderRadius: 4,
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,100,255,0.2)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0088ff, #0066dd)";
          e.currentTarget.style.boxShadow = "0 0 40px rgba(0,100,255,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0066ff, #0044cc)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,100,255,0.2)";
        }}
      >
        BACK
      </button>
    </div>
  );
}
