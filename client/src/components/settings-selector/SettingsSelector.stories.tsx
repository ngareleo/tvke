import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SettingsSelector } from "./SettingsSelector.js";

const meta: Meta<typeof SettingsSelector> = {
  title: "Components/SettingsSelector",
  component: SettingsSelector,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof SettingsSelector>;

export const Default: Story = {
  args: { value: "MATCH SOURCE", onClick: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("MATCH SOURCE")).toBeInTheDocument();
  },
};

export const Masked: Story = {
  args: { value: "●●●● ●●● 7c2a", onClick: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("●●●● ●●● 7c2a")).toBeInTheDocument();
  },
};

export const Decorative: Story = {
  args: { value: "VAAPI" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("VAAPI")).toBeInTheDocument();
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
