import { Box, Text } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { useVideoPlayback } from "../hooks/useVideoPlayback.js";
import type { VideoPlayer_video$key } from "../relay/__generated__/VideoPlayer_video.graphql.js";
import type { VideoPlayerStartTranscodeMutation } from "../relay/__generated__/VideoPlayerStartTranscodeMutation.graphql.js";
import type { Resolution } from "../types.js";
import { maxResolutionForHeight } from "../utils/formatters.js";
import { ControlBar } from "./ControlBar.js";

const VIDEO_FRAGMENT = graphql`
  fragment VideoPlayer_video on Video {
    id
    videoStream {
      height
    }
    # Spread the ControlBar fragment so ControlBar can fetch its own fields
    ...ControlBar_video
  }
`;

const START_TRANSCODE_MUTATION = graphql`
  mutation VideoPlayerStartTranscodeMutation($videoId: ID!, $resolution: Resolution!) {
    startTranscode(videoId: $videoId, resolution: $resolution) {
      id
    }
  }
`;

interface Props {
  video: VideoPlayer_video$key;
}

export function VideoPlayer({ video }: Props): JSX.Element {
  const data = useFragment(VIDEO_FRAGMENT, video);
  const [startTranscode] = useMutation<VideoPlayerStartTranscodeMutation>(START_TRANSCODE_MUTATION);

  const videoRef = useRef<HTMLVideoElement>(null);
  const nativeMax = maxResolutionForHeight(data.videoStream?.height);
  const [resolution, setResolution] = useState<Resolution>(nativeMax);

  const { status, error, startPlayback } = useVideoPlayback(videoRef, data.id, startTranscode);

  const handleResolutionChange = useCallback(
    (res: Resolution) => {
      setResolution(res);
      if (status === "playing") startPlayback(res);
    },
    [status, startPlayback]
  );

  const handlePlay = useCallback(() => {
    startPlayback(resolution);
  }, [resolution, startPlayback]);

  return (
    <Box bg="black" position="relative">
      <video
        ref={videoRef}
        style={{ width: "100%", display: "block", maxHeight: "80vh" }}
        controls={false}
      />

      {error && (
        <Box position="absolute" top={4} left={4} right={4} bg="red.800" p={3} borderRadius="md">
          <Text color="white" fontSize="sm">
            {error}
          </Text>
        </Box>
      )}

      <ControlBar
        video={data}
        videoRef={videoRef}
        resolution={resolution}
        status={status}
        onPlay={handlePlay}
        onResolutionChange={handleResolutionChange}
      />
    </Box>
  );
}
