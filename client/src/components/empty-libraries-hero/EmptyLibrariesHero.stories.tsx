import { MemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { EmptyLibrariesHero } from "./EmptyLibrariesHero.js";

interface WrapperProps {
  watermark: string;
}

const Wrapper = ({ watermark }: WrapperProps): JSX.Element => (
  <MemoryRouter>
    <div style={{ width: "100vw", height: "100vh", background: "#050706" }}>
      <EmptyLibrariesHero watermark={watermark} />
    </div>
  </MemoryRouter>
);

const meta: Meta<WrapperProps> = {
  title: "Components/EmptyLibrariesHero",
  component: Wrapper,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const Profiles: Story = { args: { watermark: "profiles" } };
export const Library: Story = { args: { watermark: "library" } };
