import { useState } from "react";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SettingsToggle } from "./SettingsToggle.js";

interface WrapperProps {
  initial: boolean;
  disabled?: boolean;
}

const Wrapper = ({ initial, disabled }: WrapperProps): JSX.Element => {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ padding: 24 }}>
      <SettingsToggle on={on} onChange={setOn} disabled={disabled} ariaLabel="Demo toggle" />
    </div>
  );
};

const meta: Meta<WrapperProps> = {
  title: "Components/SettingsToggle",
  component: Wrapper,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const Off: Story = {
  args: { initial: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Demo toggle" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
};

export const On: Story = {
  args: { initial: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Demo toggle" });
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
};

export const Disabled: Story = {
  args: { initial: true, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Demo toggle" });
    await expect(toggle).toBeDisabled();
  },
};
