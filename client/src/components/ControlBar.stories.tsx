import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense, useRef, useMemo } from "react";
import { graphql, useLazyLoadQuery, RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { ControlBar } from "./ControlBar.js";
import type { ControlBarStoryQuery } from "../relay/__generated__/ControlBarStoryQuery.graphql.js";

/**
 * ControlBar is the playback UI: seek bar, play/pause, time display, title,
 * and resolution badges. It reads video metadata (title, duration, resolution
 * cap) via a Relay fragment and live state via useVideoSync.
 *
 * Stories seed a mock Relay environment via relay-test-utils so no server is needed.
 */

const STORY_QUERY = graphql`
  query ControlBarStoryQuery($videoId: ID!) {
    video(id: $videoId) {
      ...ControlBar_video
    }
  }
`;

interface StoryArgs {
  title: string;
  durationSeconds: number;
  height: number;
  resolution: "240p" | "360p" | "480p" | "720p" | "1080p" | "4k";
  status: "idle" | "loading" | "playing";
}

function ControlBarLoader({ resolution, status }: Pick<StoryArgs, "resolution" | "status">) {
  const data = useLazyLoadQuery<ControlBarStoryQuery>(STORY_QUERY, { videoId: "Video:mock" });
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!data.video) return null;
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 960, background: "#000" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <ControlBar
        video={data.video}
        videoRef={videoRef}
        resolution={resolution}
        status={status}
        onPlay={() => {}}
        onResolutionChange={() => {}}
      />
    </div>
  );
}

function ControlBarStory({ title, durationSeconds, height, resolution, status }: StoryArgs) {
  const env = useMemo(() => {
    const e = createMockEnvironment();
    e.mock.queueOperationResolver((op) =>
      MockPayloadGenerator.generate(op, {
        Video() {
          return { title, durationSeconds, videoStream: { height } };
        },
      })
    );
    return e;
  }, [title, durationSeconds, height]);

  return (
    <RelayEnvironmentProvider environment={env}>
      <Suspense fallback={null}>
        <ControlBarLoader resolution={resolution} status={status} />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

const meta: Meta<StoryArgs> = {
  title: "Components/ControlBar",
  component: ControlBarStory as never,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Mad Max: Fury Road (2015)",
    durationSeconds: 7200,
    height: 2160,
    resolution: "1080p",
    status: "playing",
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Playing: Story = {};
export const Idle: Story = { args: { status: "idle" } };
export const Loading: Story = { args: { status: "loading" } };
export const CappedAt1080p: Story = { args: { height: 1080, resolution: "1080p" } };
export const CappedAt720p: Story = { args: { height: 720, resolution: "720p" } };
export const LongTitle: Story = {
  args: { title: "One Battle After Another: The Director's Cut Extended Edition (2025)" },
};
export const ShortVideo: Story = { args: { durationSeconds: 90 } };
