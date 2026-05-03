import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Poster } from "./Poster.js";

interface WrapperProps {
  url: string | null;
  alt: string;
}

const PosterWrapper = ({ url, alt }: WrapperProps): JSX.Element => (
  <div style={{ width: 200, height: 300, background: "#0a0a0a" }}>
    <Poster url={url} alt={alt} />
  </div>
);

const meta: Meta<WrapperProps> = {
  title: "Components/Poster",
  component: PosterWrapper,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const WithImage: Story = {
  args: {
    url: "https://picsum.photos/seed/poster/200/300",
    alt: "Sample Movie Poster",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByAltText("Sample Movie Poster")).toBeInTheDocument();
  },
};

export const Errored: Story = {
  args: {
    url: "https://example.invalid/missing-poster.jpg",
    alt: "Broken URL Movie",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Broken URL Movie")).toBeInTheDocument();
  },
};

export const NoUrl: Story = {
  args: {
    url: null,
    alt: "Missing Poster Movie",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Missing Poster Movie")).toBeInTheDocument();
  },
};

export const NoUrlNoAlt: Story = {
  args: {
    url: null,
    alt: "",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("poster")).toBeInTheDocument();
  },
};
