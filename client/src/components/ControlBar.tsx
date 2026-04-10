import { useRef, useEffect, useState, RefObject } from "react";
import { Box, Text, IconButton, Slider, Badge, Stack } from "@chakra-ui/react";

type Resolution = "240p" | "360p" | "480p" | "720p" | "1080p" | "4k";

const ALL_RESOLUTIONS: Resolution[] = ["240p", "360p", "480p", "720p", "1080p", "4k"];

const RESOLUTION_ORDER: Record<Resolution, number> = {
  "240p": 0, "360p": 1, "480p": 2, "720p": 3, "1080p": 4, "4k": 5,
};

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  title: string;
  durationSeconds: number;
  resolution: Resolution;
  maxResolution: Resolution;
  status: "idle" | "loading" | "playing";
  onPlay: () => void;
  onResolutionChange: (res: Resolution) => void;
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function ControlBar({ videoRef, title, durationSeconds, resolution, maxResolution, status, onPlay, onResolutionChange }: Props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    const tick = () => {
      setCurrentTime(video.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (status === "idle") { onPlay(); return; }
    if (video.paused) video.play();
    else video.pause();
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
  };

  const availableResolutions = ALL_RESOLUTIONS.filter(
    (r) => RESOLUTION_ORDER[r] <= RESOLUTION_ORDER[maxResolution]
  );

  return (
    <Box bg="gray.900" px={4} py={3}>
      {/* Seek bar */}
      <Slider.Root
        value={[currentTime]}
        min={0}
        max={durationSeconds || 1}
        step={1}
        onValueChange={({ value }) => handleSeek(value)}
        mb={3}
      >
        <Slider.Track bg="gray.600">
          <Slider.Range bg="blue.400" />
        </Slider.Track>
        <Slider.Thumb index={0} />
      </Slider.Root>

      <Stack direction="row" align="center" justify="space-between">
        <Stack direction="row" align="center" gap={3}>
          {/* Play/pause */}
          <IconButton
            aria-label={isPlaying ? "Pause" : "Play"}
            variant="ghost"
            color="white"
            size="sm"
            loading={status === "loading"}
            onClick={togglePlayPause}
          >
            {isPlaying ? "⏸" : "▶"}
          </IconButton>

          {/* Time */}
          <Text color="gray.300" fontSize="sm">
            {formatTime(currentTime)} / {formatTime(durationSeconds)}
          </Text>
        </Stack>

        {/* Title */}
        <Text color="white" fontSize="sm" fontWeight="medium" flex={1} textAlign="center" px={4} lineClamp={1}>
          {title}
        </Text>

        {/* Resolution picker */}
        <Stack direction="row" gap={1}>
          {availableResolutions.map((r) => (
            <Badge
              key={r}
              cursor="pointer"
              colorPalette={resolution === r ? "blue" : "gray"}
              variant={resolution === r ? "solid" : "outline"}
              onClick={() => onResolutionChange(r)}
              px={2}
              py={1}
              fontSize="xs"
            >
              {r}
            </Badge>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
