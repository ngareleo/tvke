import { Box, Spinner } from "@chakra-ui/react";
import { useLazyLoadQuery, graphql } from "react-relay";
import { useParams } from "react-router-dom";
import type { PlayerPageQuery } from "../relay/__generated__/PlayerPageQuery.graphql";
import { VideoPlayer } from "../components/VideoPlayer.js";
import { Suspense } from "react";

const VIDEO_QUERY = graphql`
  query PlayerPageQuery($id: ID!) {
    video(id: $id) {
      id
      title
      durationSeconds
      videoStream {
        height
      }
      ...VideoPlayer_video
    }
  }
`;

function PlayerContent({ videoId }: { videoId: string }) {
  const data = useLazyLoadQuery<PlayerPageQuery>(VIDEO_QUERY, { id: videoId });

  if (!data.video) {
    return <Box p={8}>Video not found.</Box>;
  }

  return (
    <Box>
      <VideoPlayer video={data.video} />
    </Box>
  );
}

export function PlayerPage(): JSX.Element {
  const { videoId } = useParams<{ videoId: string }>();

  if (!videoId) return <Box p={8}>Invalid video ID.</Box>;

  return (
    <Box maxW="1600px" mx="auto">
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" pt={20}>
            <Spinner size="xl" />
          </Box>
        }
      >
        <PlayerContent
          videoId={atob(videoId).startsWith("Video:") ? videoId : btoa(`Video:${videoId}`)}
        />
      </Suspense>
    </Box>
  );
}
