import React from "react";
import { graphql } from "react-relay";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import type { VideoArea_video$key } from "~/relay/__generated__/VideoArea_video.graphql.js";
import type { VideoAreaStoryQuery } from "~/relay/__generated__/VideoAreaStoryQuery.graphql.js";
import { withRelay } from "~/storybook/withRelay.js";

import { type SeriesPick, VideoArea } from "./VideoArea.js";

const STORY_QUERY = graphql`
  query VideoAreaStoryQuery($videoId: ID!) @relay_test_operation {
    video(id: $videoId) {
      ...VideoArea_video
    }
  }
`;

interface WrapperProps {
  video: VideoArea_video$key;
  seriesPick: SeriesPick | null;
  controlsHidden: boolean;
}

const VideoAreaWrapper = ({ video, seriesPick, controlsHidden }: WrapperProps): JSX.Element => (
  <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#000" }}>
    <VideoArea
      video={video}
      seriesPick={seriesPick}
      controlsHidden={controlsHidden}
      onBack={() => {}}
    />
  </div>
);

const baseResolvers = {
  Video: () => ({
    id: "v-mock",
    title: "mad.max.fury.road.2015.4k.mkv",
    durationSeconds: 7200,
    metadata: {
      title: "Mad Max: Fury Road",
      year: 2015,
      genre: "Action · Adventure",
      plot: null,
      posterUrl: null,
    },
    videoStream: { height: 2160, width: 3840 },
  }),
};

const meta: Meta<WrapperProps> = {
  title: "Components/VideoArea",
  component: VideoAreaWrapper,
  decorators: [withRelay],
  parameters: {
    layout: "fullscreen",
    relay: {
      query: STORY_QUERY,
      variables: { videoId: "Video:mock" },
      getReferenceEntry: (result: VideoAreaStoryQuery["response"]) => ["video", result.video],
      mockResolvers: baseResolvers,
    },
  },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const Movie: Story = {
  args: {
    seriesPick: null,
    controlsHidden: false,
  },
};

export const Series: Story = {
  args: {
    seriesPick: {
      seasonNumber: 1,
      episodeNumber: 3,
      episodeTitle: "Walk With Me",
      episodeDurationSeconds: 2820,
    },
    controlsHidden: false,
  },
};

export const ChromeHidden: Story = {
  args: {
    seriesPick: null,
    controlsHidden: true,
  },
};
