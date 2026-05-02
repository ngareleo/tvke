import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { withRelay } from "~/storybook/withRelay.js";

import { DirectoryBrowser } from "./DirectoryBrowser.js";

interface WrapperProps {
  initialPath: string;
}

const DirectoryBrowserWrapper = ({ initialPath }: WrapperProps): JSX.Element => {
  const [picked, setPicked] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  return (
    <div style={{ width: 360, padding: 24, background: "#050706" }}>
      <DirectoryBrowser
        initialPath={initialPath}
        onSelect={(p) => setPicked(p)}
        onCancel={() => setCancelled(true)}
      />
      <p
        style={{
          marginTop: 16,
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          color: "#9aa6a0",
        }}
      >
        {picked ? `picked: ${picked}` : cancelled ? "cancelled" : "—"}
      </p>
    </div>
  );
};

const meta: Meta<WrapperProps> = {
  title: "Components/DirectoryBrowser",
  component: DirectoryBrowserWrapper,
  decorators: [withRelay],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const Root: Story = {
  args: { initialPath: "/" },
};
