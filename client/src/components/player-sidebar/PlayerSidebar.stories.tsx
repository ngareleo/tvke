import React from "react";
import { graphql } from "react-relay";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import type { PlayerSidebar_video$key } from "~/relay/__generated__/PlayerSidebar_video.graphql.js";
import type { PlayerSidebarStoryQuery } from "~/relay/__generated__/PlayerSidebarStoryQuery.graphql.js";
import { withRelay } from "~/storybook/withRelay.js";

import { PlayerSidebar, type SidebarSeriesPick } from "./PlayerSidebar.js";

const STORY_QUERY = graphql`
  query PlayerSidebarStoryQuery($videoId: ID!) @relay_test_operation {
    video(id: $videoId) {
      ...PlayerSidebar_video
    }
  }
`;

interface WrapperProps {
  video: PlayerSidebar_video$key;
  open: boolean;
  seriesPick: SidebarSeriesPick | null;
}

const PlayerSidebarWrapper = ({ video, open, seriesPick }: WrapperProps): JSX.Element => (
  <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#0a0d0c" }}>
    <PlayerSidebar
      video={video}
      open={open}
      seriesPick={seriesPick}
      onClose={() => {}}
      onBack={() => {}}
      onSelectEpisode={() => {}}
    />
  </div>
);

const movieResolvers = {
  Video: (context: { path?: readonly string[] }) => {
    const isUpNext = (context.path ?? []).includes("edges");
    if (isUpNext) {
      const pathKey = (context.path ?? []).join("_");
      return {
        id: `up-${pathKey}`,
        title: "Up Next Film",
        durationSeconds: 5400,
        metadata: { title: null, year: 2020, genre: "Action", plot: null, posterUrl: null },
        library: { videos: { edges: [] } },
        show: null,
      };
    }
    return {
      id: "v-1",
      title: "mad.max.fury.road.2015.4k.mkv",
      durationSeconds: 7200,
      metadata: {
        title: "Mad Max: Fury Road",
        year: 2015,
        genre: "Action · Adventure",
        plot: "In a post-apocalyptic wasteland, Max teams up with Furiosa to outrun a warlord in a desperate bid for freedom.",
        posterUrl: null,
      },
      show: null,
    };
  },
};

const seriesResolvers = {
  Video: () => ({
    id: "v-show-1",
    title: "the.bear.s01.mkv",
    durationSeconds: 1800,
    metadata: {
      title: "The Bear",
      year: 2022,
      genre: "Drama · Comedy",
      plot: "A young chef returns to Chicago to run his deceased brother's sandwich shop.",
      posterUrl: null,
    },
    library: { videos: { edges: [] } },
    show: {
      seasons: [
        {
          seasonNumber: 1,
          episodes: Array.from({ length: 8 }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            durationSeconds: 1800,
            onDisk: true,
          })),
        },
        {
          seasonNumber: 2,
          episodes: Array.from({ length: 10 }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            durationSeconds: 1800,
            onDisk: i < 4,
          })),
        },
      ],
    },
  }),
};

const meta: Meta<WrapperProps> = {
  title: "Components/PlayerSidebar",
  component: PlayerSidebarWrapper,
  decorators: [withRelay],
  parameters: {
    layout: "fullscreen",
    relay: {
      query: STORY_QUERY,
      variables: { videoId: "Video:mock" },
      getReferenceEntry: (result: PlayerSidebarStoryQuery["response"]) => ["video", result.video],
      mockResolvers: movieResolvers,
    },
  },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const MovieOpen: Story = {
  args: { open: true, seriesPick: null },
};

export const MovieClosed: Story = {
  args: { open: false, seriesPick: null },
};

export const SeriesOpen: Story = {
  args: {
    open: true,
    seriesPick: { seasonNumber: 1, episodeNumber: 3, episodeTitle: "Brigade" },
  },
  parameters: {
    relay: {
      query: STORY_QUERY,
      variables: { videoId: "Video:show" },
      getReferenceEntry: (result: PlayerSidebarStoryQuery["response"]) => ["video", result.video],
      mockResolvers: seriesResolvers,
    },
  },
};
