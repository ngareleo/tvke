import LocalizedStrings from "react-localization";

export const strings = new LocalizedStrings({
  en: {
    crumbHome: "~",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirmYes: "Yes, delete",
    deleteConfirmMsg:
      "Delete this profile? Files on disk are untouched — only the library entry, posters, and match metadata are removed.",
    nameLabel: "Name",
    namePlaceholder: "Films / 4K UHD",
    pathLabel: "Path",
    pathPlaceholder: "/media/films/4k",
    browseLabel: "Browse",
    mediaTypeLabel: "Media type",
    moviesLabel: "Movies",
    tvShowsLabel: "TV shows",
    moviesHint: "Each video file is matched as a single film.",
    tvShowsHint:
      "Files are grouped by show, then by season folder. Episode numbers are read from filenames (S01E03, 1x03, etc.).",
    extensionsLabel: "File extensions",
    errorRequired: "Name and path are required.",
    errorExtensions: "Pick at least one file extension.",
  },
});
