import { type FC, useState } from "react";
import { AppHeader } from "../../components/AppHeader/AppHeader.js";
import { Slideshow } from "../../components/Slideshow/Slideshow.js";
import {
  IconRefresh,
  IconPlus,
  IconChevronDown,
  IconFilm,
  IconTv,
  IconDocument,
  IconWarning,
  IconPlay,
  IconPencil,
  IconClose,
} from "../../lib/icons.js";
import {
  profiles,
  films,
  user,
  type Profile,
  type Film,
} from "../../data/mock.js";
import "./Dashboard.css";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type PaneMode = "none" | "new-profile" | "profile-detail" | "film-detail";

const EXT_OPTIONS = [".mkv", ".mp4", ".mov", ".avi", ".webm", ".m4v", ".ts", ".m2ts"];

const ResolutionBadge: FC<{ res: string }> = ({ res }) => {
  const cls = res === "4K" ? "badge badge-red" : "badge badge-gray";
  return <span className={cls} style={{ fontSize: 9, padding: "1px 5px" }}>{res}</span>;
};

const MatchBar: FC<{ pct: number; warn: boolean }> = ({ pct, warn }) => (
  <div className="match-bar">
    <div className="match-track">
      <div className={`match-fill${warn ? " warn" : ""}`} style={{ width: `${pct}%` }} />
    </div>
    <span style={{ fontSize: 11, color: warn ? "var(--yellow)" : "var(--muted)" }}>{pct}%</span>
  </div>
);

const FilmRow: FC<{
  film: Film;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}> = ({ film, onSelect, onEdit }) => {
  const isUnmatched = !film.matched;
  const isTv = film.mediaType === "tv";
  const label = film.title ?? film.filename;

  return (
    <div
      className={`dir-child-row${isUnmatched ? " unmatched-child" : ""}`}
      onClick={() => onSelect(film.id)}
    >
      <div className="child-icon">
        {isUnmatched ? (
          <IconWarning size={14} style={{ color: "rgba(245,197,24,0.5)" }} />
        ) : isTv ? (
          <IconTv size={14} style={{ color: "var(--muted2)" }} />
        ) : (
          <IconDocument size={14} style={{ color: "var(--muted2)" }} />
        )}
      </div>
      <div className="dir-name-cell">
        <div className="child-name">{label}</div>
        <div className="child-filename">{film.filename}</div>
      </div>
      <div className="child-cell dir-files">
        {film.year ? `${film.year} · ${film.duration}` : film.duration}
      </div>
      <div className="child-cell dir-matched">
        <ResolutionBadge res={film.resolution} />
      </div>
      <div className="child-cell mono dir-size">{film.size}</div>
      <div className="child-actions" style={{ gap: 3 }}>
        <button
          className="btn btn-surface btn-xs"
          onClick={(e) => { e.stopPropagation(); onEdit(film.id); }}
          style={{ padding: "3px 7px" }}
          title="Edit link"
        >
          <IconPencil size={11} />
        </button>
        {isUnmatched ? (
          <button
            className="btn btn-surface btn-xs"
            onClick={(e) => { e.stopPropagation(); onEdit(film.id); }}
            style={{ color: "var(--yellow)", borderColor: "rgba(245,197,24,0.2)" }}
          >
            Link
          </button>
        ) : (
          <a
            href={`/player/${film.id}`}
            className="btn btn-red btn-xs"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "3px 8px" }}
          >
            <IconPlay size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

const ProfileRow: FC<{
  profile: Profile;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onFilmSelect: (id: string) => void;
  onFilmEdit: (id: string) => void;
}> = ({ profile, expanded, selected, onToggle, onSelect, onFilmSelect, onFilmEdit }) => {
  const profileFilms = films.filter((f) => f.profile === profile.id);
  const totalItems = profile.type === "tv" ? (profile.episodeCount ?? 0) : (profile.filmCount ?? 0);
  const matchPct = totalItems > 0 ? Math.round((profile.matched / totalItems) * 100) : 0;
  const hasWarn = profile.unmatched > 0;
  const typeLabel =
    profile.type === "tv"
      ? `${profile.showCount} shows`
      : `${profile.filmCount} films`;

  return (
    <>
      <div
        className={`dir-row${expanded ? " expanded" : ""}${selected ? " selected" : ""}${profile.scanning ? " scanning" : ""}`}
        onClick={() => { onToggle(); onSelect(); }}
      >
        <div className="dir-icon">
          <span className="chevron">
            <IconChevronDown size={10} style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.18s ease" }} />
          </span>
        </div>
        <div className="dir-name-cell" style={{ paddingLeft: 4 }}>
          <div className="dir-name">{profile.name}</div>
          <div className="dir-path">{profile.path}</div>
        </div>
        <div className="dir-cell dir-files">{typeLabel}</div>
        <div className="dir-cell dir-matched">
          {profile.scanning ? (
            <div className="scan-inline">
              <div className="scan-spinner" />
              {profile.scanProgress?.done}/{profile.scanProgress?.total}
            </div>
          ) : (
            <MatchBar pct={matchPct} warn={hasWarn} />
          )}
        </div>
        <div className="dir-cell mono dir-size">{profile.size}</div>
        <div className="dir-actions">
          {profile.scanning ? (
            <span style={{ fontSize: 10, color: "var(--green)" }}>Scanning…</span>
          ) : (
            <>
              <button className="btn btn-surface btn-xs" onClick={(e) => e.stopPropagation()}>
                <IconRefresh size={11} />
              </button>
              <button className="btn btn-surface btn-xs" onClick={(e) => e.stopPropagation()}>
                <IconPencil size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`dir-children${expanded ? " open" : ""}`}>
        {profileFilms.map((film) => (
          <FilmRow
            key={film.id}
            film={film}
            onSelect={onFilmSelect}
            onEdit={onFilmEdit}
          />
        ))}
      </div>
    </>
  );
};

const NewProfilePane: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeExts, setActiveExts] = useState(new Set([".mkv", ".mp4", ".mov"]));

  const toggleExt = (ext: string) => {
    setActiveExts((prev) => {
      const next = new Set(prev);
      if (next.has(ext)) next.delete(ext);
      else next.add(ext);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="right-pane-head">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--white)" }}>New Profile</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Add a directory to your library</div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <IconClose size={13} />
          </button>
        </div>
      </div>
      <div className="right-pane-body" style={{ padding: 18 }}>
        <div className="form-group">
          <label className="form-label">Profile Name</label>
          <input className="form-input" type="text" placeholder="e.g. Endurance Movies" />
          <div className="form-hint">A friendly name for this library.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Directory Path</label>
          <div className="form-row">
            <input className="form-input" type="text" placeholder="/home/user/Videos/Movies" />
            <button className="btn btn-surface btn-sm">Browse</button>
          </div>
          <div className="form-hint">Moran scans all subdirectories recursively.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Media Type</label>
          <select className="form-input">
            <option>Movies</option>
            <option>TV Shows</option>
            <option>Mixed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ marginBottom: 10 }}>File Extensions</label>
          <div className="ext-chips">
            {EXT_OPTIONS.map((ext) => (
              <span
                key={ext}
                className={`ext-chip${activeExts.has(ext) ? " on" : ""}`}
                onClick={() => toggleExt(ext)}
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="right-pane-foot">
        <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }}>
          Create &amp; Scan
        </button>
        <button className="btn btn-surface" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const FilmDetailPane: FC<{ film: Film; onClose: () => void }> = ({ film, onClose }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        id="fdPoster"
        style={{ height: 200, position: "relative", overflow: "hidden", flexShrink: 0, background: film.gradient }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.58) 0%,transparent 40%,rgba(0,0,0,0.84) 100%)" }} />
        <div className="fd-actions">
          <a href={`/player/${film.id}`} className="fd-action-btn primary">
            <IconPlay size={10} />
            PLAY
          </a>
          <div className="fd-action-sep" />
          <button className="fd-action-btn">
            <IconPencil size={10} />
            RE-LINK
          </button>
          <div style={{ flex: 1 }} />
          <button className="fd-action-close" onClick={onClose}>
            <IconClose size={13} />
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", zIndex: 2 }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 22, letterSpacing: ".06em", color: "var(--white)", lineHeight: 1 }}>
            {film.title ?? film.filename}
          </div>
          {film.year && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
              {film.year} · {film.genre} · {film.director}
            </div>
          )}
        </div>
      </div>

      <div className="right-pane-body" style={{ padding: 0 }}>
        {film.rating && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <span className="badge badge-red">{film.resolution}</span>
            {film.hdr && <span className="badge badge-gray">{film.hdr}</span>}
            <span className="badge badge-gray">{film.codec}</span>
            <span className="badge badge-gray">{film.audio}</span>
            <span className="badge badge-gray">{film.audioChannels}</span>
          </div>
        )}

        {film.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--yellow)" }}>{film.rating}</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>IMDb</span>
            <span style={{ fontSize: 11, color: "var(--muted2)" }}>·</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{film.duration}</span>
          </div>
        )}

        {film.plot && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-label">Synopsis</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{film.plot}</div>
          </div>
        )}

        {film.cast.length > 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-label">Cast</div>
            <div className="detail-cast">
              {film.cast.map((c) => (
                <span key={c} className="cast-chip">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "12px 16px" }}>
          <div className="section-label">File</div>
          {[
            ["Filename", film.filename],
            ["Container", film.container],
            ["Size", film.size],
            ["Bitrate", film.bitrate],
            ["Frame Rate", film.frameRate],
          ].map(([k, v]) => (
            <div key={k} className="fd-info-row">
              <span style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</span>
              <span style={{ fontSize: 12, color: "rgba(245,245,245,0.75)", fontFamily: "monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: FC = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [paneMode, setPaneMode] = useState<PaneMode>("none");
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);

  const toggleProfile = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openFilmDetail = (id: string) => {
    setSelectedFilmId(id);
    setPaneMode("film-detail");
  };

  const paneOpen = paneMode !== "none";
  const selectedFilm = selectedFilmId ? films.find((f) => f.id === selectedFilmId) : null;

  const totalFiles = profiles.reduce((s, p) => s + (p.filmCount ?? p.episodeCount ?? 0), 0);
  const totalSize = "4.3 TB";

  return (
    <>
      <AppHeader collapsed={false}>
        <span className="topbar-sub" id="topbarSub" />
        <div className="header-actions">
          <button className="header-action-btn" onClick={() => {}}>
            <IconRefresh size={14} />
            Scan All
          </button>
          <div className="header-action-sep" />
          <button
            className="header-action-btn primary"
            onClick={() => setPaneMode("new-profile")}
          >
            <IconPlus size={14} />
            New Profile
          </button>
        </div>
      </AppHeader>

      <div className="main">
        {/* Greeting + Slideshow strip */}
        <div className="dashboard-hero">
          <div className="dashboard-greeting">
            <div className="greeting-text">
              {getGreeting()}, <span className="greeting-name">{user.name}</span>
            </div>
            <div className="greeting-sub">
              {profiles.length} profiles &nbsp;·&nbsp; {totalFiles} files &nbsp;·&nbsp; {totalSize} on disk
            </div>
          </div>
          <Slideshow />
        </div>

        {/* Location bar */}
        <div className="location-bar">
          <div className="loc-crumb">
            <span style={{ color: "var(--muted2)", fontSize: 12 }}>{user.name}</span>
            <span className="loc-sep">/</span>
            <span className="loc-current">profiles</span>
          </div>
        </div>

        <div className={`split-body${paneOpen ? " pane-open" : ""}`}>
          <div className="split-left" style={{ padding: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Column headers */}
            <div className="dir-header">
              <div />
              <div className="dir-col sortable" style={{ paddingLeft: 20 }}>Name</div>
              <div className="dir-col dir-files">Files</div>
              <div className="dir-col dir-matched">Matched</div>
              <div className="dir-col dir-size">Size</div>
              <div className="dir-col" />
            </div>

            {/* Profile rows */}
            <div className="dir-list">
              {profiles.map((p) => (
                <ProfileRow
                  key={p.id}
                  profile={p}
                  expanded={expandedIds.has(p.id)}
                  selected={selectedProfileId === p.id}
                  onToggle={() => toggleProfile(p.id)}
                  onSelect={() => setSelectedProfileId(p.id)}
                  onFilmSelect={openFilmDetail}
                  onFilmEdit={openFilmDetail}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="dir-footer">
              <div className="dir-footer-stat"><span>{profiles.length}</span> profiles</div>
              <div className="dir-footer-stat"><span>{totalFiles}</span> total files</div>
              <div className="dir-footer-stat"><span>{totalSize}</span> on disk</div>
            </div>
          </div>

          {/* Right pane */}
          <div className="right-pane">
            {paneMode === "new-profile" && (
              <NewProfilePane onClose={() => setPaneMode("none")} />
            )}
            {paneMode === "film-detail" && selectedFilm && (
              <FilmDetailPane film={selectedFilm} onClose={() => setPaneMode("none")} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
