import { mapEventMetadata, NovaEventingProvider } from "@nova/react";
import type { EventWrapper } from "@nova/types";
import React from "react";
import { graphql } from "react-relay";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import type { PlayerEndScreen_video$key } from "~/relay/__generated__/PlayerEndScreen_video.graphql.js";
import type { PlayerEndScreenStoryQuery } from "~/relay/__generated__/PlayerEndScreenStoryQuery.graphql.js";

import { PlayerEndScreen } from "./PlayerEndScreen.js";

/**
 * PlayerEndScreen is shown when playback reaches the end of a video.
 * It displays up-next suggestion cards (filtered from the same library) and
 * a Replay button that bubbles a PLAY_REQUESTED Nova event.
 *
 * Stories use @imchhh/storybook-addon-relay for mock fragment data and wrap
 * the component in a NovaEventingProvider (required for useNovaEventing).
 */

const STORY_QUERY = graphql`
  query PlayerEndScreenStoryQuery($videoId: ID!) @relay_test_operation {
    video(id: $videoId) {
      ...PlayerEndScreen_video
    }
  }
`;

const noopEventing = {
  bubble: (_event: EventWrapper): Promise<void> => Promise.resolve(),
};

interface WrapperProps {
  video: PlayerEndScreen_video$key;
}

function PlayerEndScreenWrapper({ video }: WrapperProps): JSX.Element {
  return (
    <div style={{ position: "relative", width: "100%", height: "400px", background: "#080808" }}>
      <NovaEventingProvider eventing={noopEventing} reactEventMapper={mapEventMetadata}>
        <PlayerEndScreen video={video} />
      </NovaEventingProvider>
    </div>
  );
}

const meta: Meta<WrapperProps> = {
  title: "Components/PlayerEndScreen",
  component: PlayerEndScreenWrapper,
  parameters: {
    layout: "fullscreen",
    relay: {
      query: STORY_QUERY,
      variables: { videoId: "Video:mock-current" },
      getReferenceEntry: (result: PlayerEndScreenStoryQuery["response"]) => ["video", result.video],
      mockResolvers: {
        Video: () => ({
          id: "Video:mock-current",
          library: {
            videos: {
              edges: [
                {
                  node: {
                    id: "Video:mock-1",
                    title: "Mad Max: Fury Road",
                    metadata: { year: 2015, posterUrl: null },
                  },
                },
                {
                  node: {
                    id: "Video:mock-2",
                    title: "Dune: Part Two",
                    metadata: { year: 2024, posterUrl: null },
                  },
                },
                {
                  node: {
                    id: "Video:mock-3",
                    title: "Oppenheimer",
                    metadata: { year: 2023, posterUrl: null },
                  },
                },
                {
                  node: {
                    id: "Video:mock-4",
                    title: "The Batman",
                    metadata: { year: 2022, posterUrl: null },
                  },
                },
                // Same ID as videoId — should be filtered out
                {
                  node: {
                    id: "Video:mock-current",
                    title: "Current Video",
                    metadata: { year: 2025, posterUrl: null },
                  },
                },
              ],
            },
          },
        }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<WrapperProps>;

/** Four suggestion cards plus a Replay button. */
export const WithSuggestions: Story = {};

/** No other videos in the library — only the Replay button is shown. */
export const NoSuggestions: Story = {
  parameters: {
    relay: {
      query: STORY_QUERY,
      variables: { videoId: "Video:mock-current" },
      getReferenceEntry: (result: PlayerEndScreenStoryQuery["response"]) => ["video", result.video],
      mockResolvers: {
        Video: () => ({
          id: "Video:mock-current",
          library: { videos: { edges: [] } },
        }),
      },
    },
  },
};
