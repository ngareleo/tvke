import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { AppHeader } from "./AppHeader.js";

const meta: Meta<typeof AppHeader> = {
  title: "Components/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    router: { initialEntries: ["/"] },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const HomeActive: Story = {
  parameters: { router: { initialEntries: ["/"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Xstream — home")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "home" })).toBeInTheDocument();
  },
};

export const ProfilesActive: Story = {
  parameters: { router: { initialEntries: ["/profiles"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "profiles" })).toBeInTheDocument();
  },
};

export const WatchlistActive: Story = {
  parameters: { router: { initialEntries: ["/watchlist"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "watchlist" })).toBeInTheDocument();
  },
};
