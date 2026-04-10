import { Box, Text, Badge } from "@chakra-ui/react";
import { useFragment, graphql } from "react-relay";
import { useNavigate } from "react-router-dom";
import type { VideoCard_video$key } from "../relay/__generated__/VideoCard_video.graphql";

const VIDEO_FRAGMENT = graphql`
  fragment VideoCard_video on Video {
    id
    title
    durationSeconds
    videoStream {
      height
    }
  }
`;

interface Props {
  video: VideoCard_video$key;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function resolutionLabel(height: number | null | undefined): string {
  if (!height) return "";
  if (height >= 2160) return "4K";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  if (height >= 480) return "480p";
  return `${height}p`;
}

export function VideoCard({ video }: Props) {
  const data = useFragment(VIDEO_FRAGMENT, video);
  const navigate = useNavigate();

  return (
    <Box
      cursor="pointer"
      borderRadius="md"
      overflow="hidden"
      bg="gray.800"
      _hover={{ bg: "gray.700", transform: "scale(1.02)" }}
      transition="all 0.15s"
      onClick={() => navigate(`/play/${data.id}`)}
      p={3}
    >
      {/* Placeholder thumbnail */}
      <Box bg="gray.700" borderRadius="sm" aspect-ratio="16/9" mb={2} h="100px" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="2xl">▶</Text>
      </Box>

      <Text fontSize="sm" fontWeight="medium" lineClamp={2} color="white">
        {data.title}
      </Text>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
        <Text fontSize="xs" color="gray.400">{formatDuration(data.durationSeconds)}</Text>
        {data.videoStream?.height && (
          <Badge size="sm" colorPalette="blue">{resolutionLabel(data.videoStream.height)}</Badge>
        )}
      </Box>
    </Box>
  );
}
