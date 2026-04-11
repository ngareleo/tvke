import { type FC, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  IconPlay,
  IconPause,
  IconBackward,
  IconForward,
  IconSpeaker,
  IconArrowsOut,
  IconArrowLeft,
  IconFilm,
} from "../../lib/icons.js";
import { films, getFilmById } from "../../data/mock.js";
import "./Player.css";

const TOTAL_DURATION = 9960; // 2h 46m in seconds

export const Player: FC = () => {
  const { filmId } = useParams<{ filmId: string }>();
  const film = filmId ? getFilmById(filmId) : films[0];

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(3862); // ~1h 4m
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (ts: number) => {
      if (lastRef.current) {
        const delta = (ts - lastRef.current) / 1000;
        setElapsed((prev) => {
          const next = prev + delta;
          if (next >= TOTAL_DURATION) {
            setPlaying(false);
            return TOTAL_DURATION;
          }
          return next;
        });
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const togglePlay = () => {
    lastRef.current = 0;
    setPlaying((p) => !p);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const progressPct = (elapsed / TOTAL_DURATION) * 100;

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setElapsed(pct * TOTAL_DURATION);
  };

  if (!film) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)" }}>Film not found</div>
        <Link to="/" style={{ color: "var(--red)", marginTop: 8 }}>Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="player-shell">
      {/* Left: video area */}
      <div className="video-area">
        <div className="video-screen" style={{ background: film.gradient }} />

        {/* Player controls */}
        <div className="player-controls">
          <div className="progress-times">
            <span className="progress-time">{formatTime(elapsed)}</span>
            <span className="progress-time">{formatDuration(TOTAL_DURATION)}</span>
          </div>
          <div className="progress-track" onClick={scrub}>
            <div className="progress-buffered" style={{ width: "68%" }} />
            <div className="progress-played" style={{ width: `${progressPct}%` }} />
            <div className="progress-thumb" style={{ left: `${progressPct}%` }} />
          </div>
          <div className="controls-row">
            <button className="ctrl"><IconBackward size={20} /></button>
            <button className="ctrl play" onClick={togglePlay}>
              {playing ? <IconPause size={26} /> : <IconPlay size={26} />}
            </button>
            <button className="ctrl"><IconForward size={20} /></button>
            <button className="ctrl"><IconSpeaker size={20} /></button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginRight: 12 }}>
              {film.resolution}{film.hdr ? ` · ${film.hdr}` : ""}
            </span>
            <button className="ctrl"><IconArrowsOut size={20} /></button>
          </div>
        </div>
      </div>

      {/* Right: info panel */}
      <div className="player-sidebar">
        <div className="player-sidebar-head">
          <Link to="/" className="player-back">
            <IconArrowLeft size={14} />
            Library
          </Link>
          <div className="player-sidebar-title">{film.title ?? film.filename}</div>
          {film.year && (
            <div className="player-sidebar-meta">
              {film.year} · {film.genre} · {film.director}
            </div>
          )}
          {film.rating && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              <span className="badge badge-red">{film.resolution}</span>
              {film.hdr && <span className="badge badge-gray">{film.hdr}</span>}
              <span className="badge badge-gray">{film.codec}</span>
              <span className="badge badge-gray">{film.audio}</span>
            </div>
          )}
        </div>

        {film.plot && (
          <div className="player-sidebar-body">
            <div className="section-label">Synopsis</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{film.plot}</div>
          </div>
        )}

        {film.cast.length > 0 && (
          <div className="player-sidebar-body" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="section-label">Cast</div>
            <div className="detail-cast">
              {film.cast.map((c) => <span key={c} className="cast-chip">{c}</span>)}
            </div>
          </div>
        )}

        <div className="player-sidebar-body" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="section-label">File</div>
          {[
            ["File", film.filename],
            ["Size", film.size],
            ["Bitrate", film.bitrate],
            ["Frame Rate", film.frameRate],
            ["Container", film.container],
          ].map(([k, v]) => (
            <div key={k} className="detail-row">
              <span className="detail-key">{k}</span>
              <span className="detail-val" style={{ fontFamily: "monospace", fontSize: 11 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="player-sidebar-foot">
          <button className="btn btn-surface btn-sm" style={{ gap: 7 }}>
            <IconFilm size={12} />
            Open in VLC
          </button>
        </div>
      </div>
    </div>
  );
};
