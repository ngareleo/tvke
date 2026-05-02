import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { AppShell } from "./AppShell.js";

const Placeholder = (): JSX.Element => (
  <div
    style={{
      paddingTop: "52px",
      paddingLeft: "24px",
      paddingRight: "24px",
      paddingBottom: "24px",
      fontFamily: "monospace",
      color: "#9aa6a0",
    }}
  >
    Page content sits at viewport y=0; pages add their own header-clearance padding.
  </div>
);

const meta: Meta<typeof AppShell> = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    router: { initialEntries: ["/"] },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => (
    <AppShell>
      <Placeholder />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("main")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Xstream — home")).toBeInTheDocument();
  },
};

export const ProfilesRoute: Story = {
  parameters: { router: { initialEntries: ["/profiles"] } },
  render: () => (
    <AppShell>
      <Placeholder />
    </AppShell>
  ),
};
