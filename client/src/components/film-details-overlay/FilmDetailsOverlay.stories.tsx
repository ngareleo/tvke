import { MemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import type { FilmTileViewModel } from "~/components/film-tile/FilmTile";
import type { SeasonViewModel } from "~/components/seasons-panel/SeasonsPanel";

import { FilmDetailsOverlay, type FilmDetailsViewModel } from "./FilmDetailsOverlay.js";

const movie: FilmDetailsViewModel = {
  id: "1",
  title: "Blade Runner 2049",
  filename: "blade-runner-2049.mkv",
  posterUrl: "https://picsum.photos/seed/blade/1920/1080",
  kind: "MOVIES",
  resolution: "4K",
  hdr: "HDR10",
  codec: "HEVC",
  year: 2017,
  genre: "Sci-Fi",
  duration: "2h 44m",
  director: "Denis Villeneuve",
  plot: "Thirty years after the events of the first film, a new blade runner unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
  rating: 8.0,
  seasons: [],
};

const seasons: SeasonViewModel[] = [
  {
    number: 1,
    episodes: Array.from({ length: 9 }, (_, i) => ({
      number: i + 1,
      title: `Episode ${i + 1}`,
      duration: "47m",
      available: true,
    })),
  },
  {
    number: 2,
    episodes: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      title: `Episode ${i + 1}`,
      duration: "47m",
      available: i < 4,
    })),
  },
];

const series: FilmDetailsViewModel = {
  ...movie,
  id: "2",
  title: "Severance",
  filename: "severance/",
  kind: "TV_SHOWS",
  duration: null,
  director: "Ben Stiller",
  seasons,
};

const suggestion = (id: number): FilmTileViewModel => ({
  id: String(100 + id),
  title: `Suggested film ${id}`,
  filename: `suggested-${id}.mkv`,
  kind: "MOVIES",
  posterUrl: `https://picsum.photos/seed/sug${id}/200/300`,
  year: 2010 + id,
  durationLabel: "1h 50m",
});

const meta: Meta<typeof FilmDetailsOverlay> = {
  title: "Components/FilmDetailsOverlay",
  component: FilmDetailsOverlay,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: { onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof FilmDetailsOverlay>;

export const Movie: Story = { args: { film: movie } };

export const MovieWithSuggestions: Story = {
  args: {
    film: movie,
    suggestions: Array.from({ length: 6 }, (_, i) => suggestion(i + 1)),
  },
};

export const Series: Story = { args: { film: series } };

export const SeriesWithSuggestions: Story = {
  args: {
    film: series,
    suggestions: Array.from({ length: 6 }, (_, i) => suggestion(i + 1)),
  },
};

export const UnmatchedFile: Story = {
  args: {
    film: {
      ...movie,
      title: null,
      year: null,
      genre: null,
      duration: null,
      director: null,
      plot: null,
      posterUrl: null,
      rating: null,
    },
  },
};
