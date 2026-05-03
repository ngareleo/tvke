import { describe, expect, it } from "vitest";

import { filmMatches } from "~/pages/profiles-page/filmMatches.js";

const film = {
  title: "Oppenheimer",
  filename: "Oppenheimer.2023.2160p.UHD.mkv",
  metadata: { genre: "Biography · Drama · History", director: "Christopher Nolan" },
};

describe("filmMatches", () => {
  it("matches on title (case-insensitive)", () => {
    expect(filmMatches(film, "oppen")).toBe(true);
  });

  it("matches on filename", () => {
    expect(filmMatches(film, "2160p")).toBe(true);
  });

  it("matches on director", () => {
    expect(filmMatches(film, "nolan")).toBe(true);
  });

  it("matches on genre", () => {
    expect(filmMatches(film, "drama")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(filmMatches(film, "xyzzy")).toBe(false);
  });

  it("returns true on empty query", () => {
    expect(filmMatches(film, "")).toBe(true);
  });

  it("handles missing metadata", () => {
    expect(filmMatches({ title: "Foo", filename: "foo.mkv", metadata: null }, "foo")).toBe(true);
  });

  it("handles missing title", () => {
    expect(filmMatches({ title: null, filename: "raw.mkv", metadata: null }, "raw")).toBe(true);
  });
});
