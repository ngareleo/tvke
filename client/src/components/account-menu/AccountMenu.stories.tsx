import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { withNovaEventing } from "~/storybook/withNovaEventing.js";

import { AccountMenu } from "./AccountMenu.js";

interface WrapperProps {
  initials: string;
  name: string;
  email: string;
}

const AccountMenuWrapper = (props: WrapperProps): JSX.Element => (
  <div style={{ position: "relative", width: 280, height: 280 }}>
    <AccountMenu {...props} />
  </div>
);

const meta: Meta<WrapperProps> = {
  title: "Components/AccountMenu",
  component: AccountMenuWrapper,
  parameters: { layout: "centered" },
  decorators: [withNovaEventing],
  args: {
    initials: "DG",
    name: "Dag Mwenda",
    email: "dag@xstream.local",
  },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Settings")).toBeInTheDocument();
    await expect(canvas.getByText("Sign out")).toBeInTheDocument();
    await expect(canvas.getByText("Dag Mwenda")).toBeInTheDocument();
    await expect(canvas.getByText("dag@xstream.local")).toBeInTheDocument();
  },
};

export const LongName: Story = {
  args: {
    initials: "AB",
    name: "Anastasia Beauregard-Williamson",
    email: "anastasia.beauregard.williamson@example.org",
  },
};
