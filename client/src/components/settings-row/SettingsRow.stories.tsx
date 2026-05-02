import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SettingsRow } from "./SettingsRow.js";

const meta: Meta<typeof SettingsRow> = {
  title: "Components/SettingsRow",
  component: SettingsRow,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = {
  args: {
    label: "Auto-rescan on launch",
    control: <span style={{ color: "#9aa6a0", fontSize: 12 }}>(toggle)</span>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Auto-rescan on launch")).toBeInTheDocument();
  },
};

export const WithHint: Story = {
  args: {
    label: "OMDb API key",
    hint: "Required for poster + metadata fetches.",
    control: <span style={{ color: "#9aa6a0", fontSize: 12 }}>(selector)</span>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("OMDb API key")).toBeInTheDocument();
    await expect(canvas.getByText("Required for poster + metadata fetches.")).toBeInTheDocument();
  },
};
