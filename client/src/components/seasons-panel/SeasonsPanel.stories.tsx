import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SeasonsPanel, type SeasonViewModel } from "./SeasonsPanel.js";

const seasonComplete: SeasonViewModel = {
  number: 1,
  episodes: Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1} title`,
    duration: "47m",
    available: true,
  })),
};

const seasonPartial: SeasonViewModel = {
  number: 2,
  episodes: Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1} title`,
    duration: "47m",
    available: i < 4,
  })),
};

const seasonMissing: SeasonViewModel = {
  number: 3,
  episodes: Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    title: null,
    duration: null,
    available: false,
  })),
};

const meta: Meta<typeof SeasonsPanel> = {
  title: "Components/SeasonsPanel",
  component: SeasonsPanel,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ width: 380, background: "#0a0d0c", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SeasonsPanel>;

export const Closed: Story = {
  args: { seasons: [seasonComplete, seasonPartial, seasonMissing] },
};

export const DefaultOpenFirst: Story = {
  args: {
    seasons: [seasonComplete, seasonPartial, seasonMissing],
    defaultOpenFirst: true,
  },
};

export const Accordion: Story = {
  args: {
    seasons: [seasonComplete, seasonPartial, seasonMissing],
    defaultOpenFirst: true,
    accordion: true,
  },
};

export const InteractivePlayer: Story = {
  args: {
    seasons: [seasonComplete, seasonPartial],
    activeEpisode: { seasonNumber: 1, episodeNumber: 3 },
    onSelectEpisode: () => {},
  },
};
