import { describe, expect, it } from "vitest";

import {
  resolveSeriesPick,
  type SeasonInput,
} from "~/components/player-content/resolveSeriesPick.js";

const series: ReadonlyArray<SeasonInput> = [
  {
    seasonNumber: 1,
    episodes: [
      { episodeNumber: 1, title: "Pilot", durationSeconds: 1800, onDisk: true },
      { episodeNumber: 2, title: "Hands", durationSeconds: 1800, onDisk: true },
      { episodeNumber: 3, title: "Brigade", durationSeconds: 1800, onDisk: false },
    ],
  },
  {
    seasonNumber: 2,
    episodes: [
      { episodeNumber: 1, title: "Beef", durationSeconds: 1800, onDisk: true },
      { episodeNumber: 2, title: "Pasta", durationSeconds: null, onDisk: false },
    ],
  },
];

describe("resolveSeriesPick", () => {
  it("returns null when there are no seasons", () => {
    expect(resolveSeriesPick([], 1, 1)).toBeNull();
  });

  it("returns the requested episode when both params hit", () => {
    const pick = resolveSeriesPick(series, 1, 2);
    expect(pick).toEqual({
      seasonNumber: 1,
      episodeNumber: 2,
      episodeTitle: "Hands",
      episodeDurationSeconds: 1800,
    });
  });

  it("falls back to first available episode when params miss the season", () => {
    const pick = resolveSeriesPick(series, 99, 1);
    expect(pick?.seasonNumber).toBe(1);
    expect(pick?.episodeNumber).toBe(1);
  });

  it("falls back to first available episode when the requested episode is missing", () => {
    const pick = resolveSeriesPick(series, 1, 99);
    expect(pick?.seasonNumber).toBe(1);
    expect(pick?.episodeNumber).toBe(1);
  });

  it("falls back to first available across seasons when requested season has none on disk", () => {
    const noFirstSeasonAvailable: ReadonlyArray<SeasonInput> = [
      {
        seasonNumber: 1,
        episodes: [{ episodeNumber: 1, title: null, durationSeconds: null, onDisk: false }],
      },
      {
        seasonNumber: 2,
        episodes: [{ episodeNumber: 1, title: "S2E1", durationSeconds: 100, onDisk: true }],
      },
    ];
    const pick = resolveSeriesPick(noFirstSeasonAvailable, null, null);
    expect(pick).toEqual({
      seasonNumber: 2,
      episodeNumber: 1,
      episodeTitle: "S2E1",
      episodeDurationSeconds: 100,
    });
  });

  it("falls back to the very first episode when nothing is on disk", () => {
    const allMissing: ReadonlyArray<SeasonInput> = [
      {
        seasonNumber: 1,
        episodes: [
          { episodeNumber: 1, title: "Pilot", durationSeconds: 1800, onDisk: false },
          { episodeNumber: 2, title: null, durationSeconds: null, onDisk: false },
        ],
      },
    ];
    const pick = resolveSeriesPick(allMissing, null, null);
    expect(pick).toEqual({
      seasonNumber: 1,
      episodeNumber: 1,
      episodeTitle: "Pilot",
      episodeDurationSeconds: 1800,
    });
  });

  it("uses the params path when both are null but seasons exist", () => {
    const pick = resolveSeriesPick(series, null, null);
    expect(pick?.seasonNumber).toBe(1);
    expect(pick?.episodeNumber).toBe(1);
  });

  it("uses the params path when only one of s/e is null", () => {
    const pickSOnly = resolveSeriesPick(series, 1, null);
    expect(pickSOnly?.seasonNumber).toBe(1);
    const pickEOnly = resolveSeriesPick(series, null, 2);
    expect(pickEOnly?.seasonNumber).toBe(1);
  });
});
