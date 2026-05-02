import { type FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mergeClasses } from "@griffel/react";
import { ImdbBadge, IconClose } from "../../lib/icons.js";
import { type Film } from "../../data/mock.js";
import { Poster } from "../Poster/Poster.js";
import { useDetailPaneStyles } from "./DetailPane.styles.js";

interface DetailPaneProps {
  film: Film;
  /** When true, the pane mounts already in edit mode. */
  initialEdit?: boolean;
  onClose: () => void;
  /**
   * Notify the parent when the user enters/exits edit mode so it can
   * sync URL state. The parent owns the source of truth.
   */
  onEditChange?: (editing: boolean) => void;
}

/**
 * Right-rail film detail. Identical structure on Profiles and Library.
 * Has a view mode (default) and an edit mode that exposes editable
 * title / year / IMDb ID / plot fields. The design lab does not persist
 * edits — Save just exits edit mode visually so the form can be QA'd.
 */
export const DetailPane: FC<DetailPaneProps> = ({
  film,
  initialEdit = false,
  onClose,
  onEditChange,
}) => {
  const styles = useDetailPaneStyles();
  const hdrLabel = film.hdr && film.hdr !== "—" ? film.hdr.toUpperCase() : null;
  const [editing, setEditing] = useState(initialEdit);

  // Editable field state — primed from the film whenever the pane swaps
  // films or re-enters edit mode.
  const [title, setTitle] = useState(film.title ?? "");
  const [year, setYear] = useState(film.year !== null ? String(film.year) : "");
  const [imdbId, setImdbId] = useState("");
  const [plot, setPlot] = useState(film.plot ?? "");

  // When the parent swaps the active film while the pane is mounted, or
  // the URL flips between view/edit, re-prime the form so stale edits
  // don't leak between films.
  useEffect(() => {
    setTitle(film.title ?? "");
    setYear(film.year !== null ? String(film.year) : "");
    setImdbId("");
    setPlot(film.plot ?? "");
  }, [film.id]);

  useEffect(() => {
    setEditing(initialEdit);
  }, [initialEdit]);

  const enterEdit = (): void => {
    setEditing(true);
    onEditChange?.(true);
  };

  const exitEdit = (): void => {
    setEditing(false);
    onEditChange?.(false);
  };

  return (
    <div className={styles.pane}>
      <div className={styles.posterFrame}>
        <Poster
          url={film.posterUrl}
          alt={film.title ?? film.filename}
          className={styles.posterImage}
        />
        <div className={styles.posterFade} />
        <button
          onClick={onClose}
          aria-label="Close detail pane"
          className={styles.closeBtn}
        >
          <IconClose />
        </button>
      </div>

      <div className={styles.body}>
        {editing ? (
          <DetailPaneEdit
            title={title}
            year={year}
            imdbId={imdbId}
            plot={plot}
            onTitle={setTitle}
            onYear={setYear}
            onImdbId={setImdbId}
            onPlot={setPlot}
            onSave={exitEdit}
            onCancel={exitEdit}
          />
        ) : (
          <>
            <div className={styles.actionRow}>
              <Link to={`/player/${film.id}`} className={styles.playAction}>
                ▶ Play
              </Link>
              <button
                type="button"
                onClick={enterEdit}
                className={styles.editAction}
              >
                Edit
              </button>
            </div>

            <div className={styles.title}>{film.title ?? "Unmatched file"}</div>
            <div className={styles.subhead}>
              {[film.year, film.genre, film.duration]
                .filter(Boolean)
                .join(" · ")}
            </div>

            <div className={styles.techChips}>
              <span className="chip green">{film.resolution} UHD</span>
              {hdrLabel && <span className="chip">{hdrLabel}</span>}
              <span className="chip">{film.codec}</span>
              <span className="chip">
                {film.audio} {film.audioChannels}
              </span>
            </div>

            <div className={styles.ratingRow}>
              {film.rating !== null && (
                <>
                  <ImdbBadge />
                  <span className={styles.ratingValue}>{film.rating}</span>
                  <span className={styles.divider}>·</span>
                </>
              )}
              <span>{film.duration}</span>
              <span className={styles.divider}>·</span>
              <span className={styles.status}>● ON DISK</span>
            </div>

            {film.plot && <div className={styles.plot}>{film.plot}</div>}

            {film.cast.length > 0 && (
              <>
                <div className={styles.sectionLabel}>CAST</div>
                <div className={styles.castChips}>
                  {film.cast.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className={styles.sectionLabel}>FILE</div>
            <div className={styles.fileBlock}>
              <div>{film.filename}</div>
              <div className={styles.fileMeta}>
                <span>{film.size}</span>
                <span>·</span>
                <span>{film.bitrate}</span>
                <span>·</span>
                <span>{film.frameRate}</span>
                <span>·</span>
                <span>{film.container}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface EditProps {
  title: string;
  year: string;
  imdbId: string;
  plot: string;
  onTitle: (v: string) => void;
  onYear: (v: string) => void;
  onImdbId: (v: string) => void;
  onPlot: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const DetailPaneEdit: FC<EditProps> = ({
  title,
  year,
  imdbId,
  plot,
  onTitle,
  onYear,
  onImdbId,
  onPlot,
  onSave,
  onCancel,
}) => {
  const s = useDetailPaneStyles();
  return (
    <>
      <div className={s.editEyebrow}>· edit · re-link to OMDb</div>
      <div className={s.editFields}>
        <label className={s.editField}>
          <span className={s.editLabel}>Title</span>
          <input
            className={s.editInput}
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Oppenheimer"
          />
        </label>
        <label className={s.editField}>
          <span className={s.editLabel}>Year</span>
          <input
            className={s.editInput}
            value={year}
            onChange={(e) => onYear(e.target.value)}
            placeholder="2023"
            inputMode="numeric"
          />
        </label>
        <label className={s.editField}>
          <span className={s.editLabel}>IMDb ID</span>
          <input
            className={s.editInput}
            value={imdbId}
            onChange={(e) => onImdbId(e.target.value)}
            placeholder="tt15398776"
          />
        </label>
        <label className={s.editField}>
          <span className={s.editLabel}>Plot</span>
          <textarea
            className={mergeClasses(s.editInput, s.editTextarea)}
            value={plot}
            onChange={(e) => onPlot(e.target.value)}
            rows={4}
            placeholder="Short synopsis…"
          />
        </label>
      </div>

      <div className={s.editFooter}>
        <button type="button" className={s.editCancel} onClick={onCancel}>
          [ESC] Cancel
        </button>
        <button type="button" className={s.editSave} onClick={onSave}>
          [↩] Save
        </button>
      </div>
    </>
  );
};
