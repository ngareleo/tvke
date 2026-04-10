import { useRef, useEffect, useState, useCallback } from "react";
import { Box, Text } from "@chakra-ui/react";
import { useFragment, useMutation, graphql } from "react-relay";
import type { VideoPlayer_video$key } from "../relay/__generated__/VideoPlayer_video.graphql";
import type { VideoPlayerStartTranscodeMutation } from "../relay/__generated__/VideoPlayerStartTranscodeMutation.graphql";
import { ControlBar } from "./ControlBar.js";
import { StreamingService } from "../services/StreamingService.js";
import { BufferManager } from "../services/BufferManager.js";

const VIDEO_FRAGMENT = graphql`
  fragment VideoPlayer_video on Video {
    id
    title
    durationSeconds
    videoStream {
      height
    }
  }
`;

const START_TRANSCODE_MUTATION = graphql`
  mutation VideoPlayerStartTranscodeMutation($videoId: ID!, $resolution: Resolution!) {
    startTranscode(videoId: $videoId, resolution: $resolution) {
      id
    }
  }
`;

type Resolution = "240p" | "360p" | "480p" | "720p" | "1080p" | "4k";

const GQL_RESOLUTION: Record<Resolution, string> = {
  "240p": "RESOLUTION_240P",
  "360p": "RESOLUTION_360P",
  "480p": "RESOLUTION_480P",
  "720p": "RESOLUTION_720P",
  "1080p": "RESOLUTION_1080P",
  "4k": "RESOLUTION_4K",
};

function maxResolution(height: number | null | undefined): Resolution {
  if (!height || height < 360) return "240p";
  if (height < 480) return "360p";
  if (height < 720) return "480p";
  if (height < 1080) return "720p";
  if (height < 2160) return "1080p";
  return "4k";
}

interface Props {
  video: VideoPlayer_video$key;
}

export function VideoPlayer({ video }: Props) {
  const data = useFragment(VIDEO_FRAGMENT, video);
  const [startTranscode] = useMutation<VideoPlayerStartTranscodeMutation>(START_TRANSCODE_MUTATION);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamingRef = useRef<StreamingService | null>(null);
  const bufferRef = useRef<BufferManager | null>(null);

  const nativeMax = maxResolution(data.videoStream?.height);
  const [resolution, setResolution] = useState<Resolution>(nativeMax);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");

  const teardown = useCallback(() => {
    streamingRef.current?.cancel();
    bufferRef.current?.teardown();
    streamingRef.current = null;
    bufferRef.current = null;
  }, []);

  const startPlayback = useCallback(async (res: Resolution) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    teardown();
    setError(null);
    setStatus("loading");

    startTranscode({
      variables: { videoId: data.id, resolution: GQL_RESOLUTION[res] },
      onCompleted: async (response) => {
        const rawJobId = atob(response.startTranscode.id).replace("TranscodeJob:", "");

        const buffer = new BufferManager(
          videoEl,
          () => streamingRef.current?.pause(),
          () => streamingRef.current?.resume()
        );
        bufferRef.current = buffer;

        try {
          await buffer.init();
        } catch (err) {
          setError(`MSE init failed: ${(err as Error).message}`);
          setStatus("idle");
          return;
        }

        const streaming = new StreamingService();
        streamingRef.current = streaming;

        streaming.start(
          rawJobId,
          0,
          async (segData, isInit) => {
            try {
              await buffer.appendSegment(segData);
              if (isInit) {
                videoEl.play().catch(() => {});
                setStatus("playing");
              }
            } catch (err) {
              setError(`Buffer error: ${(err as Error).message}`);
            }
          },
          (err) => setError(err.message),
          () => buffer.markStreamDone()
        );
      },
      onError: (err) => {
        setError(err.message);
        setStatus("idle");
      },
    });
  }, [data.id, startTranscode, teardown]);

  const handleResolutionChange = useCallback((res: Resolution) => {
    setResolution(res);
    if (status === "playing") {
      startPlayback(res);
    }
  }, [status, startPlayback]);

  const handlePlay = useCallback(() => {
    startPlayback(resolution);
  }, [resolution, startPlayback]);

  // Cleanup on unmount
  useEffect(() => () => teardown(), [teardown]);

  return (
    <Box bg="black" position="relative">
      <video
        ref={videoRef}
        style={{ width: "100%", display: "block", maxHeight: "80vh" }}
        controls={false}
      />

      {error && (
        <Box position="absolute" top={4} left={4} right={4} bg="red.800" p={3} borderRadius="md">
          <Text color="white" fontSize="sm">{error}</Text>
        </Box>
      )}

      <ControlBar
        videoRef={videoRef}
        title={data.title}
        durationSeconds={data.durationSeconds}
        resolution={resolution}
        maxResolution={nativeMax}
        status={status}
        onPlay={handlePlay}
        onResolutionChange={handleResolutionChange}
      />
    </Box>
  );
}
