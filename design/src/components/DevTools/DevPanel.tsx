/**
 * DevPanel — floating developer tools overlay.
 *
 * Only rendered when import.meta.env.DEV is true. Exports a no-op stub for
 * production builds so the import can safely live in AppShell.
 *
 * Features:
 *   Kill switch  — force-throw a render error inside any registered component
 *                  tree to exercise the ErrorBoundary without navigating away
 *   Route info   — shows current pathname for quick orientation
 *
 * The panel is toggled by a small "DEV" pill fixed to the bottom-right corner.
 * Press Escape or click outside to close.
 */

import { type FC, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDevTools } from "./DevToolsContext.js";
import "./DevPanel.css";

// Pages / component trees that can be force-thrown from the panel.
// Add an entry here whenever you add a new <DevThrowTarget id="..."> in a page.
const THROW_TARGETS = [
  { id: "Dashboard",  label: "Profiles page" },
  { id: "Library",    label: "Library page" },
  { id: "Watchlist",  label: "Watchlist page" },
  { id: "Settings",   label: "Settings page" },
  { id: "Player",     label: "Player page" },
  { id: "NotFound",   label: "404 page" },
];

const DevPanelInner: FC = () => {
  const [open, setOpen] = useState(false);
  const { setThrowTarget } = useDevTools();
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleThrow = (id: string) => {
    setOpen(false);
    // Small delay so the panel closes before the throw renders
    setTimeout(() => setThrowTarget(id), 50);
  };

  return (
    <div className="devpanel-root" ref={panelRef}>
      {open && (
        <div className="devpanel-popup">
          <div className="devpanel-header">
            <span className="devpanel-title">DevTools</span>
            <span className="devpanel-route">{pathname}</span>
          </div>

          <div className="devpanel-section-label">Kill switch — force throw</div>
          <div className="devpanel-targets">
            {THROW_TARGETS.map(({ id, label }) => (
              <div key={id} className="devpanel-target-row">
                <div>
                  <div className="devpanel-target-label">{label}</div>
                  <div className="devpanel-target-id">{id}</div>
                </div>
                <button
                  className="devpanel-throw-btn"
                  onClick={() => handleThrow(id)}
                  title={`Throw error inside <DevThrowTarget id="${id}">`}
                >
                  ⚡ Throw
                </button>
              </div>
            ))}
          </div>

          <div className="devpanel-footer">
            Errors are caught by the nearest{" "}
            <code>&lt;ErrorBoundary&gt;</code>. Click "Try again" to recover.
          </div>
        </div>
      )}

      <button
        className={`devpanel-pill${open ? " active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Toggle DevTools panel"
      >
        DEV
      </button>
    </div>
  );
};

// Export a no-op in production so the import in AppShell compiles but ships nothing
export const DevPanel: FC = import.meta.env.DEV ? DevPanelInner : () => null;
