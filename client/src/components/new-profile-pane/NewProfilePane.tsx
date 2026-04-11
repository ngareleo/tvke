import { mergeClasses } from "@griffel/react";
import React, { type FC, useState } from "react";
import { graphql, useMutation } from "react-relay";

import { IconClose } from "~/lib/icons.js";
import type { NewProfilePaneCreateLibraryMutation } from "~/relay/__generated__/NewProfilePaneCreateLibraryMutation.graphql.js";

import { useNewProfilePaneStyles } from "./NewProfilePane.styles.js";

const CREATE_LIBRARY_MUTATION = graphql`
  mutation NewProfilePaneCreateLibraryMutation(
    $name: String!
    $path: String!
    $mediaType: MediaType!
    $extensions: [String!]!
  ) {
    createLibrary(name: $name, path: $path, mediaType: $mediaType, extensions: $extensions) {
      id
      name
    }
  }
`;

const EXTENSION_PRESETS: Record<string, string[]> = {
  MOVIES: [".mkv", ".mp4", ".avi", ".mov", ".m4v"],
  TV_SHOWS: [".mkv", ".mp4", ".avi", ".mov"],
};

const ALL_EXTENSIONS = [".mkv", ".mp4", ".avi", ".mov", ".m4v", ".wmv", ".flv", ".ts"];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export const NewProfilePane: FC<Props> = ({ onClose, onCreated }) => {
  const styles = useNewProfilePaneStyles();
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [mediaType, setMediaType] = useState<"MOVIES" | "TV_SHOWS">("MOVIES");
  const [extensions, setExtensions] = useState<string[]>(EXTENSION_PRESETS.MOVIES);

  const [commit, isPending] =
    useMutation<NewProfilePaneCreateLibraryMutation>(CREATE_LIBRARY_MUTATION);
  const [error, setError] = useState<string | null>(null);

  const handleMediaTypeChange = (next: "MOVIES" | "TV_SHOWS"): void => {
    setMediaType(next);
    setExtensions(EXTENSION_PRESETS[next]);
  };

  const toggleExtension = (ext: string): void => {
    setExtensions((prev) => (prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]));
  };

  const handleSubmit = (): void => {
    if (!name.trim() || !path.trim()) {
      setError("Name and path are required.");
      return;
    }
    if (extensions.length === 0) {
      setError("Select at least one file extension.");
      return;
    }
    setError(null);
    commit({
      variables: { name: name.trim(), path: path.trim(), mediaType, extensions },
      onCompleted: () => {
        onCreated();
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>New Library</div>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <IconClose size={13} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Library Name</label>
          <input
            className={styles.input}
            placeholder="e.g. Movies 4K"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Folder Path</label>
          <input
            className={styles.input}
            placeholder="/media/movies"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Media Type</label>
          <select
            className={styles.select}
            value={mediaType}
            onChange={(e) => handleMediaTypeChange(e.target.value as "MOVIES" | "TV_SHOWS")}
          >
            <option value="MOVIES">Movies</option>
            <option value="TV_SHOWS">TV Shows</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>File Extensions</label>
          <div className={styles.extChips}>
            {ALL_EXTENSIONS.map((ext) => (
              <button
                key={ext}
                className={mergeClasses(
                  styles.extChip,
                  extensions.includes(ext) && styles.extChipActive
                )}
                onClick={() => toggleExtension(ext)}
                type="button"
              >
                {ext}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}
      </div>

      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={onClose}>
          Cancel
        </button>
        <button
          className={styles.btnCreate}
          onClick={handleSubmit}
          disabled={isPending}
          type="button"
        >
          {isPending ? "Creating…" : "Create Library"}
        </button>
      </div>
    </div>
  );
};
