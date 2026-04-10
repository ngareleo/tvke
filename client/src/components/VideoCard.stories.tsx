import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense, useMemo } from "react";
import { graphql, useLazyLoadQuery, RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { VideoCard } from "./VideoCard.js";
import type { VideoCardStoryQuery } from "../relay/__generated__/VideoCardStoryQuery.graphql.js";

const STORY_QUERY = graphql`
  query VideoCardStoryQuery($videoId: ID!) {
    video(id: $videoId) {
      ...VideoCard_video
    }
  }
`;

interface StoryArgs {
  title: string;
  durationSeconds: number;
  height: number | null;
}

function VideoCardLoader() {
  const data = useLazyLoadQuery<VideoCardStoryQuery>(STORY_QUERY, { videoId: "Video:mock" });
  if (!data.video) return null;
  return <VideoCard video={data.video} />;
}

function VideoCardStory({ title, durationSeconds, height }: StoryArgs) {
  const env = useMemo(() => {
    const e = createMockEnvironment();
    e.mock.queueOperationResolver((op) =>
      MockPayloadGenerator.generate(op, {
        Video() {
          return {
            title,
            durationSeconds,
            videoStream: height ? { height } : null,
          };
        },
      })
    );
    return e;
  }, [title, durationSeconds, height]);

  return (
    <RelayEnvironmentProvider environment={env}>
      <Suspense fallback={null}>
        <VideoCardLoader />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

const meta: Meta<StoryArgs> = {
  title: "Components/VideoCard",
  component: VideoCardStory as never,
  parameters: { layout: "centered" },
  args: {
    title: "Mad Max: Fury Road (2015)",
    durationSeconds: 7200,
    height: 2160,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Movie4K: Story = {};

export const Movie1080p: Story = {
  args: { height: 1080 },
};

export const NoStreamInfo: Story = {
  args: { height: null },
};

export const LongTitle: Story = {
  args: {
    title: "One Battle After Another: The Director's Cut Extended Edition (2025)",
  },
};

export const ShortDuration: Story = {
  args: { title: "Short Film", durationSeconds: 300, height: 720 },
};
