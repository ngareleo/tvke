import { mergeClasses } from "@griffel/react";
import { NovaEventingInterceptor } from "@nova/react";
import type { EventWrapper } from "@nova/types";
import { type FC, useState } from "react";
import { Link } from "react-router-dom";

import {
  type DirectorySelectedData,
  isDirectoryBrowserCancelledEvent,
  isDirectorySelectedEvent,
} from "~/components/directory-browser/DirectoryBrowser.events.js";
import { DirectoryBrowser } from "~/components/directory-browser/DirectoryBrowser.js";
import { IconFolder } from "~/lib/icons.js";

import { strings } from "./ProfileForm.strings.js";
import { useProfileFormStyles } from "./ProfileForm.styles.js";

export type ProfileMediaType = "MOVIES" | "TV_SHOWS";

export interface ProfileFormValues {
  name: string;
  path: string;
  mediaType: ProfileMediaType;
  extensions: string[];
}

interface ProfileFormProps {
  mode: "create" | "edit";
  initial: ProfileFormValues;
  crumbs: string[];
  title: string;
  eyebrow: string;
  subtitle?: string;
  submitLabel: string;
  onSubmit: (values: ProfileFormValues) => void;
  onDelete?: () => void;
  submitting?: boolean;
}

const EXTENSION_PRESETS: Record<ProfileMediaType, string[]> = {
  MOVIES: [".mkv", ".mp4", ".avi", ".mov", ".m4v"],
  TV_SHOWS: [".mkv", ".mp4", ".avi", ".mov"],
};

const ALL_EXTENSIONS = [".mkv", ".mp4", ".avi", ".mov", ".m4v", ".wmv", ".flv", ".ts"];

export const ProfileForm: FC<ProfileFormProps> = ({
  mode,
  initial,
  crumbs,
  title,
  eyebrow,
  subtitle,
  submitLabel,
  onSubmit,
  onDelete,
  submitting = false,
}) => {
  const styles = useProfileFormStyles();

  const [name, setName] = useState(initial.name);
  const [path, setPath] = useState(initial.path);
  const [mediaType, setMediaType] = useState<ProfileMediaType>(initial.mediaType);
  const [extensions, setExtensions] = useState<string[]>(initial.extensions);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  const setMediaTypeAndPreset = (next: ProfileMediaType): void => {
    setMediaType(next);
    setExtensions(EXTENSION_PRESETS[next]);
  };

  const toggleExt = (ext: string): void => {
    setExtensions((prev) => (prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]));
  };

  const handleSubmit = (): void => {
    if (!name.trim() || !path.trim()) {
      setError(strings.errorRequired);
      return;
    }
    if (extensions.length === 0) {
      setError(strings.errorExtensions);
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), path: path.trim(), mediaType, extensions });
  };

  const directoryInterceptor = async (wrapper: EventWrapper): Promise<EventWrapper> => {
    if (isDirectorySelectedEvent(wrapper)) {
      const data = wrapper.event.data?.() as DirectorySelectedData | undefined;
      if (data) {
        setPath(data.path);
        setBrowseOpen(false);
      }
    } else if (isDirectoryBrowserCancelledEvent(wrapper)) {
      setBrowseOpen(false);
    }
    return wrapper;
  };

  return (
    <div className={styles.shell}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbDim}>{strings.crumbHome}</span>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={`${c}-${i}`} style={{ display: "contents" }}>
              <span>/</span>
              <span className={last ? styles.crumbBright : undefined}>{c}</span>
            </span>
          );
        })}
        <span className={styles.crumbSpacer} />
        <Link to="/profiles" className={styles.textAction}>
          {strings.cancel}
        </Link>
      </div>

      <div className={styles.page}>
        <div className={styles.card}>
          <div>
            <div className={styles.eyebrow}>· {eyebrow}</div>
            <div className={styles.title}>{title}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{strings.nameLabel}</label>
            <input
              className={styles.input}
              placeholder={strings.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{strings.pathLabel}</label>
            <div className={styles.pathSection}>
              <div className={styles.pathRow}>
                <input
                  className={mergeClasses(styles.input, styles.pathInput)}
                  placeholder={strings.pathPlaceholder}
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />
                <button
                  type="button"
                  className={mergeClasses(styles.browseBtn, browseOpen && styles.browseBtnActive)}
                  onClick={() => setBrowseOpen((v) => !v)}
                >
                  <IconFolder /> {strings.browseLabel}
                </button>
              </div>
              {browseOpen && (
                <div className={styles.browserFloat}>
                  <NovaEventingInterceptor interceptor={directoryInterceptor}>
                    <DirectoryBrowser initialPath={path.trim() || "/"} />
                  </NovaEventingInterceptor>
                </div>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{strings.mediaTypeLabel}</label>
            <div className={styles.segment}>
              <button
                type="button"
                className={mergeClasses(
                  styles.segmentBtn,
                  mediaType === "MOVIES" && styles.segmentBtnActive
                )}
                onClick={() => setMediaTypeAndPreset("MOVIES")}
              >
                {strings.moviesLabel}
              </button>
              <button
                type="button"
                className={mergeClasses(
                  styles.segmentBtn,
                  mediaType === "TV_SHOWS" && styles.segmentBtnActive
                )}
                onClick={() => setMediaTypeAndPreset("TV_SHOWS")}
              >
                {strings.tvShowsLabel}
              </button>
            </div>
            <div className={styles.segmentHint}>
              {mediaType === "MOVIES" ? strings.moviesHint : strings.tvShowsHint}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{strings.extensionsLabel}</label>
            <div className={styles.extChips}>
              {ALL_EXTENSIONS.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  className={mergeClasses(
                    styles.extChip,
                    extensions.includes(ext) && styles.extChipActive
                  )}
                  onClick={() => toggleExt(ext)}
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          {mode === "edit" && confirmDelete && onDelete && (
            <div className={styles.deleteConfirm}>
              <div className={styles.deleteConfirmMsg}>{strings.deleteConfirmMsg}</div>
              <div className={styles.deleteConfirmRow}>
                <button
                  type="button"
                  className={styles.textAction}
                  onClick={() => setConfirmDelete(false)}
                >
                  {strings.cancel}
                </button>
                <button
                  type="button"
                  className={mergeClasses(styles.textAction, styles.textActionDanger)}
                  onClick={() => onDelete()}
                >
                  {strings.deleteConfirmYes}
                </button>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            {mode === "edit" && !confirmDelete && onDelete && (
              <button
                type="button"
                className={mergeClasses(styles.textAction, styles.textActionDanger)}
                onClick={() => setConfirmDelete(true)}
              >
                {strings.delete}
              </button>
            )}
            <span className={styles.footerSpacer} />
            <Link to="/profiles" className={styles.textAction}>
              {strings.cancel}
            </Link>
            <button
              type="button"
              className={mergeClasses(styles.textAction, styles.textActionAccent)}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
